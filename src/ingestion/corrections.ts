export const correctionFields = {
  name: "Product name", brandName: "Brand", manufacturerPartNumber: "Part number",
  itemPrice: "Item price", quantity: "Quantity", origin: "OEM / aftermarket",
  condition: "Condition", destinationUrl: "Item link",
} as const;
export type CorrectionField = keyof typeof correctionFields;
export type Correction = { field: CorrectionField; value: string; source: string; evidence: string };
export function validateCorrection(input: unknown): Correction {
  const bad = () => { throw new Error("Correction: choose a supported field, valid value, HTTPS evidence link, and evidence summary."); };
  if (!input || typeof input !== "object" || Array.isArray(input)) return bad();
  const data = input as Record<string, unknown>;
  if (Object.keys(data).some(key => !["field", "value", "source", "evidence"].includes(key)) || typeof data.field !== "string" || !Object.hasOwn(correctionFields, data.field)) return bad();
  for (const key of ["value", "source", "evidence"]) if (typeof data[key] !== "string" || !(data[key] as string).trim() || (data[key] as string).length > (key === "evidence" ? 2000 : 500) || /[\u0000-\u001f\u007f]/.test(data[key] as string)) return bad();
  const field = data.field as CorrectionField; let value = (data.value as string).trim();
  function url(raw: string) { try { const u = new URL(raw); if (u.protocol !== "https:" || u.username || u.password || u.search || u.hash) return bad(); return u.href; } catch { return bad(); } }
  const source = url((data.source as string).trim());
  if (field === "destinationUrl") value = url(value);
  if (field === "itemPrice" && (!/^\d{1,10}(\.\d{1,2})?$/.test(value) || Number(value) <= 0)) return bad();
  if (field === "quantity" && (!/^[1-9]\d{0,8}$/.test(value))) return bad();
  if (field === "origin" && !["oem", "aftermarket", "unknown"].includes(value)) return bad();
  if (field === "condition" && !["new", "used", "unknown"].includes(value)) return bad();
  return {field, value, source, evidence: (data.evidence as string).trim()};
}
