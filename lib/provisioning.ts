/**
 * School provisioning.
 * Creates a new Postgres schema for a new school and seeds it with
 * the table structure + initial admin user.
 */
import { Pool, PoolClient } from "pg";
import bcrypt from "bcryptjs";

/**
 * Creates all public-schema enum types inside a tenant schema, then alters
 * any columns that still reference public enum types to use the tenant-local
 * copies. Safe to call multiple times (idempotent).
 */
export async function migrateEnumsForSchema(client: PoolClient, schemaName: string) {
  // 1. Get every enum type defined in the public schema with its values pre-quoted
  const enumsResult = await client.query<{ enum_name: string; value_list: string }>(`
    SELECT t.typname AS enum_name,
           string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS value_list
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
    GROUP BY t.typname
  `);

  // 2. Create each enum in the tenant schema (no-op if already exists)
  for (const { enum_name, value_list } of enumsResult.rows) {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "${schemaName}"."${enum_name}" AS ENUM (${value_list});
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
  }

  // 3. Find columns in the tenant schema that still reference public enum types
  const columnsResult = await client.query<{
    table_name: string; column_name: string; udt_name: string; column_default: string | null;
  }>(`
    SELECT c.table_name, c.column_name, c.udt_name, c.column_default
    FROM information_schema.columns c
    WHERE c.table_schema = $1
      AND c.udt_schema = 'public'
      AND EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.typname = c.udt_name
          AND t.typtype = 'e'
      )
  `, [schemaName]);

  // 4. Alter each column to use the tenant-local enum type
  for (const { table_name, column_name, udt_name, column_default } of columnsResult.rows) {
    // Drop default first so ALTER TYPE doesn't fail on the cast
    if (column_default !== null) {
      await client.query(
        `ALTER TABLE "${schemaName}"."${table_name}" ALTER COLUMN "${column_name}" DROP DEFAULT`
      );
    }

    await client.query(`
      ALTER TABLE "${schemaName}"."${table_name}"
        ALTER COLUMN "${column_name}"
        TYPE "${schemaName}"."${udt_name}"
        USING "${column_name}"::text::"${schemaName}"."${udt_name}"
    `);

    // Restore the default using the tenant-local enum type
    if (column_default !== null) {
      const match = column_default.match(/^'([^']+)'/);
      if (match) {
        await client.query(
          `ALTER TABLE "${schemaName}"."${table_name}" ALTER COLUMN "${column_name}" SET DEFAULT '${match[1]}'::"${schemaName}"."${udt_name}"`
        );
      }
    }
  }
}

// Generates a safe schema name from a subdomain
export function makeSchemaName(subdomain: string): string {
  return `school_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

// Creates the schema, copies all table definitions from public, creates admin user
export async function provisionSchool(input: {
  schemaName: string;
  schoolName: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
}) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create the schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${input.schemaName}"`);

    // 2. Copy all table definitions from public schema into the new schema
    //    using pg_dump logic — get all table DDL from public and recreate in new schema
    const tables = await client.query<{ tablename: string }>(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('SchoolTenant', '_prisma_migrations')
      ORDER BY tablename
    `);

    for (const { tablename } of tables.rows) {
      // Copy table structure (without data)
      await client.query(`
        CREATE TABLE IF NOT EXISTS "${input.schemaName}"."${tablename}"
        (LIKE "public"."${tablename}" INCLUDING ALL)
      `);
    }

    // 2b. Create tenant-local enum types and migrate columns off public enums
    await migrateEnumsForSchema(client, input.schemaName);

    // Copy sequences (for auto-increment, though we use cuid so mostly not needed)
    const sequences = await client.query<{ sequence_name: string }>(`
      SELECT sequence_name FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    `);
    for (const { sequence_name } of sequences.rows) {
      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS "${input.schemaName}"."${sequence_name}"
      `).catch(() => {}); // ignore if already exists
    }

    // 3. Create the admin user in the new schema
    const passwordHash = await bcrypt.hash(input.adminPassword, 12);
    const userId = generateId();
    const staffId = generateId();

    await client.query(`
      INSERT INTO "${input.schemaName}"."User"
        (id, username, email, password, role, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', true, NOW(), NOW())
    `, [userId, input.adminEmail.split("@")[0], input.adminEmail, passwordHash]);

    await client.query(`
      INSERT INTO "${input.schemaName}"."Staff"
        (id, "userId", "firstName", "lastName", "employeeId", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, 'EMP0001', true, NOW(), NOW())
    `, [staffId, userId, input.adminName.split(" ")[0] ?? "Admin", input.adminName.split(" ").slice(1).join(" ") || "User"]);

    // 4. Create school profile. Provisioning IS the setup — the school must
    // land straight on the dashboard, so onboarding is marked complete here.
    await client.query(`
      INSERT INTO "${input.schemaName}"."SchoolProfile"
        (id, name, phone, address, country, currency, "dateFormat", "onboardingCompleted",
         "admAutoInsert", "admStartFrom", "admNoDigit", "staffidStartFrom", "staffidNoDigit")
      VALUES ($1, $2, $3, $4, $5, 'GHS', 'DD/MM/YYYY', true, true, 1, 4, 1, 4)
    `, [generateId(), input.schoolName, input.phone ?? null, input.address ?? null, input.country ?? null]);

    // 4b. Seed the first academic session (active) — without one, most pages
    // have nothing to hang data on and the app used to trap the new school in
    // the onboarding wizard. Sep–Jul matches the Ghanaian school year.
    const now = new Date();
    const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1; // Aug+ → current year
    await client.query(`
      INSERT INTO "${input.schemaName}"."AcademicSession"
        (id, session, "startDate", "endDate", "isActive", "createdAt")
      VALUES ($1, $2, $3, $4, true, NOW())
    `, [
      generateId(),
      `${startYear}/${startYear + 1}`,
      new Date(Date.UTC(startYear, 8, 1)),      // 1 Sep
      new Date(Date.UTC(startYear + 1, 6, 31)), // 31 Jul
    ]);

    // 5. Seed attendance types
    const attendanceTypes = [
      { id: generateId(), type: "Present",  keyValue: "P", nameStyle: "bg-green-100 text-green-700" },
      { id: generateId(), type: "Absent",   keyValue: "A", nameStyle: "bg-red-100 text-red-700"     },
      { id: generateId(), type: "Late",     keyValue: "L", nameStyle: "bg-yellow-100 text-yellow-700" },
      { id: generateId(), type: "Holiday",  keyValue: "H", nameStyle: "bg-blue-100 text-blue-700"   },
      { id: generateId(), type: "Half Day", keyValue: "F", nameStyle: "bg-orange-100 text-orange-700" },
    ];
    for (const at of attendanceTypes) {
      await client.query(`
        INSERT INTO "${input.schemaName}"."AttendanceType"
          (id, type, "keyValue", "nameStyle", "isActive", "forQR", "createdAt")
        VALUES ($1, $2, $3, $4, true, true, NOW())
      `, [at.id, at.type, at.keyValue, at.nameStyle]);
    }

    // 6. Seed staff attendance types
    const staffAttTypes = [
      { id: generateId(), type: "Present",  keyValue: "P" },
      { id: generateId(), type: "Absent",   keyValue: "A" },
      { id: generateId(), type: "Late",     keyValue: "L" },
      { id: generateId(), type: "Half Day", keyValue: "F" },
      { id: generateId(), type: "Leave",    keyValue: "LE" },
    ];
    for (const sat of staffAttTypes) {
      await client.query(`
        INSERT INTO "${input.schemaName}"."StaffAttendanceType"
          (id, type, "keyValue", "isActive", "createdAt")
        VALUES ($1, $2, $3, true, NOW())
      `, [sat.id, sat.type, sat.keyValue]);
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    // Drop partially created schema on failure
    await pool.query(`DROP SCHEMA IF EXISTS "${input.schemaName}" CASCADE`).catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Deprovision — drops the schema entirely (use with caution)
export async function deprovisionSchool(schemaName: string) {
  if (schemaName === "public") throw new Error("Cannot drop public schema");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await pool.end();
}

// Simple cuid-like ID generator (avoids importing cuid in a non-prisma context)
function generateId(): string {
  return "c" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}
