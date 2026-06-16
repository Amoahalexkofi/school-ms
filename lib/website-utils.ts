export function generateId(): string {
  return "c" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function ensureWebsiteTables(sql: any, schema: string) {
  for (const table of ["WebsiteHeroSlide", "WebsiteNotice", "WebsiteSettings"]) {
    await (sql as any).query(
      `CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (LIKE "public"."${table}" INCLUDING ALL)`
    ).catch(() => {});
  }
}
