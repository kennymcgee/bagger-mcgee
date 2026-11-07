// Pure preflight validation: no database access, URL fetching, or publishing.
export type Issue = { row: number; field: string; code: string };
export type ReviewRow = {
  row: number;
  vendorSku: string;
  name: string;
  brandName: string;
  manufacturerPartNumber: string;
  variantAttributes: Record<string, string>;
  destinationUrl: string;
  itemPrice: string;
  currency: "USD";
  quantity: number;
  origin: "oem" | "aftermarket" | null;
  condition: "new" | "used" | null;
  reviewStatus: "pending";
};
export type Preflight = {
  formatVersion: 1;
  status: "blocked" | "review_required";
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  issues: Issue[];
  candidates: ReviewRow[];
};

const fields = new Set([
  "vendorSku", "name", "brandName", "manufacturerPartNumber", "variantAttributes",
  "destinationUrl", "itemPrice", "currency", "quantity", "origin", "condition",
]);
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const cleanText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(value);

export function validateFeed(input: unknown): Preflight {
  const result: Preflight = {
    formatVersion: 1, status: "blocked", totalRows: 0,
    validRows: 0, rejectedRows: 0, issues: [], candidates: [],
  };
  if (!isObject(input) || input.formatVersion !== 1 || !Array.isArray(input.rows) ||
      Object.keys(input).some(key => !["formatVersion", "rows"].includes(key))) {
    result.issues.push({ row: 0, field: "feed", code: "invalid_envelope" });
    return result;
  }
  result.totalRows = input.rows.length;
  if (input.rows.length < 1 || input.rows.length > 10_000) {
    result.rejectedRows = input.rows.length;
    result.issues.push({ row: 0, field: "rows", code: "row_count_out_of_range" });
    return result;
  }
  // Every occurrence of a duplicate is held, including the first occurrence.
  // SKU case is preserved: vendor-specific normalization needs a separate adapter.
  const counts = new Map<string, number>();
  for (const value of input.rows) {
    if (isObject(value) && cleanText(value.vendorSku, 200)) {
      const sku = value.vendorSku.trim();
      counts.set(sku, (counts.get(sku) ?? 0) + 1);
    }
  }
  for (const [index, value] of input.rows.entries()) {
    const row = index + 1;
    const start = result.issues.length;
    const fail = (field: string, code: string) => result.issues.push({ row, field, code });
    if (!isObject(value)) {
      fail("row", "expected_object");
      result.rejectedRows++;
      continue;
    }
    // Never echo unknown keys: a vendor might accidentally send a secret field.
    if (Object.keys(value).some(key => !fields.has(key))) fail("row", "unknown_fields");
    for (const field of ["vendorSku", "name", "brandName", "manufacturerPartNumber"]) {
      if (!cleanText(value[field], field === "name" ? 500 : 200)) fail(field, "required_text");
    }
    if (typeof value.vendorSku === "string" && (counts.get(value.vendorSku.trim()) ?? 0) > 1) {
      fail("vendorSku", "duplicate_sku");
    }
    // Decimal strings prevent binary rounding and accidental inclusion of tax/shipping.
    if (typeof value.itemPrice !== "string" || !/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(value.itemPrice)) {
      fail("itemPrice", "invalid_decimal_price");
    }
    if (value.currency !== "USD") fail("currency", "usd_required");
    if (!Number.isInteger(value.quantity) || (value.quantity as number) < 1 ||
        (value.quantity as number) > 2_147_483_647) fail("quantity", "positive_integer_required");
    if (value.origin !== undefined && value.origin !== null &&
        value.origin !== "oem" && value.origin !== "aftermarket") fail("origin", "unsupported_origin");
    if (value.condition !== undefined && value.condition !== null &&
        value.condition !== "new" && value.condition !== "used") fail("condition", "unsupported_condition");
    try {
      if (!cleanText(value.destinationUrl, 2048) || !/^https:\/\//.test(value.destinationUrl) ||
          /\s|\\/.test(value.destinationUrl)) throw new Error();
      const url = new URL(value.destinationUrl);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error();
    } catch {
      fail("destinationUrl", "https_item_url_required");
    }
    const variants = value.variantAttributes;
    if (!isObject(variants) || Object.keys(variants).length > 30 ||
        Object.entries(variants).some(([key, val]) => !cleanText(key, 80) ||
          ["__proto__", "constructor", "prototype"].includes(key) || !cleanText(val, 200))) {
      fail("variantAttributes", "explicit_variant_object_required");
    }
    if (result.issues.length > start) {
      result.rejectedRows++;
      continue;
    }
    const price = (value.itemPrice as string).split(".");
    result.candidates.push({
      row,
      vendorSku: (value.vendorSku as string).trim(),
      name: (value.name as string).trim(),
      brandName: (value.brandName as string).trim(),
      manufacturerPartNumber: (value.manufacturerPartNumber as string).trim(),
      variantAttributes: { ...(variants as Record<string, string>) },
      destinationUrl: value.destinationUrl as string,
      itemPrice: `${price[0]}.${(price[1] ?? "").padEnd(2, "0")}`,
      currency: "USD", quantity: value.quantity as number,
      origin: (value.origin as ReviewRow["origin"]) ?? null,
      condition: (value.condition as ReviewRow["condition"]) ?? null,
      reviewStatus: "pending",
    });
  }
  result.validRows = result.candidates.length;
  if (result.rejectedRows === 0) result.status = "review_required";
  return result;
}
