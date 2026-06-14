const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Load from environment — never hardcode credentials here
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL env var is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const uid = () => crypto.randomUUID();

async function provision() {
  const subdomain = process.env.SUBDOMAIN || 'demo';
  const schema = `school_${subdomain}`;
  const adminEmail = process.env.ADMIN_EMAIL || `admin@${subdomain}.getskula.com`;
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@2026';
  const schoolName = process.env.SCHOOL_NAME || 'Skula Demo School';

  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('SchoolTenant','_prisma_migrations') ORDER BY tablename`;
  console.log('Tables to clone:', tables.length);

  await sql.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  console.log('Schema created');

  for (const { tablename } of tables) {
    try {
      await sql.query(`CREATE TABLE IF NOT EXISTS "${schema}"."${tablename}" (LIKE public."${tablename}" INCLUDING ALL)`);
    } catch (e) { /* skip */ }
  }
  console.log('Tables cloned');

  const hash = await bcrypt.hash(adminPassword, 12);
  const userId = uid(), staffId = uid(), profileId = uid(), tenantId = uid();

  await sql.query(`INSERT INTO "${schema}"."User" (id, username, email, password, role, "isActive", "createdAt", "updatedAt") VALUES ('${userId}', 'admin', '${adminEmail}', '${hash}', 'SUPER_ADMIN', true, NOW(), NOW()) ON CONFLICT DO NOTHING`);
  await sql.query(`INSERT INTO "${schema}"."Staff" (id, "userId", "employeeId", "firstName", "lastName", "isActive", "createdAt", "updatedAt") VALUES ('${staffId}', '${userId}', 'EMP001', 'School', 'Admin', true, NOW(), NOW()) ON CONFLICT DO NOTHING`);
  await sql.query(`INSERT INTO "${schema}"."SchoolProfile" (id, name, "onboardingCompleted") VALUES ('${profileId}', '${schoolName}', false) ON CONFLICT DO NOTHING`);
  await sql.query(`INSERT INTO "SchoolTenant" (id, name, subdomain, "schemaName", plan, status, "adminEmail", "createdAt", "updatedAt") VALUES ('${tenantId}', '${schoolName}', '${subdomain}', '${schema}', 'trial', 'active', '${adminEmail}', NOW(), NOW()) ON CONFLICT (subdomain) DO UPDATE SET status = 'active'`);

  console.log('\n✅ School provisioned!');
  console.log('URL     : https://' + subdomain + '.getskula.com/sign-in');
  console.log('Email   :', adminEmail);
}

provision().catch(e => console.error('ERROR:', e.message));
