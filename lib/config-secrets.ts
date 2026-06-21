// Helpers to stop provider credentials (API keys, passwords, secret keys) from
// being echoed back to the browser. The admin UI only needs to know whether a
// secret is SET, never its value.
//
// Pattern:
//  - GET responses: redactSecrets()/redactList() blank every secret field and
//    add a `<field>Set: boolean` flag.
//  - POST handlers: keepSecret() preserves the stored value when the client
//    submits a blank (so saving other fields doesn't wipe the credential).

export function redactSecrets<T extends Record<string, any>>(obj: T | null, fields: string[]): any {
  if (!obj) return obj;
  const out: any = { ...obj };
  for (const f of fields) {
    out[`${f}Set`] = !!(obj[f] && String(obj[f]).length > 0);
    out[f] = "";
  }
  return out;
}

export function redactList(arr: any[], fields: string[]): any[] {
  return (arr ?? []).map((o) => redactSecrets(o, fields));
}

// Keep the existing stored secret when the incoming value is blank/undefined.
export function keepSecret(incoming: any, existing: any): string {
  if (incoming === undefined || incoming === null || String(incoming).trim() === "") {
    return existing ?? "";
  }
  return incoming;
}
