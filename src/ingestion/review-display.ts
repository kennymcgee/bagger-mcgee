const labels: Record<string, string> = {
  vendorSku: "Vendor SKU", name: "Product name", brandName: "Brand",
  manufacturerPartNumber: "Part number", variantAttributes: "Variant details",
  destinationUrl: "Item link", itemPrice: "Item price", currency: "Currency",
  quantity: "Quantity", origin: "OEM / aftermarket", condition: "Condition",
};
const reasons: Record<string, string> = {
  canonical_product_mapping_required: "Match to a catalog product",
  vendor_claims_and_item_link_unverified: "Verify vendor information and item link",
  product_origin_unknown: "Confirm OEM or aftermarket identity",
  offer_condition_unknown: "Confirm new or used condition",
  duplicate_sku: "Duplicate vendor SKU",
  invalid_decimal_price: "Price format is invalid",
  usd_required: "Price must be in USD",
  required_text: "Required information is missing or invalid",
  positive_integer_required: "Quantity must be a positive whole number",
  unsupported_origin: "Product origin needs correction",
  unsupported_condition: "Condition is not supported",
  https_item_url_required: "A valid HTTPS item link is required",
  explicit_variant_object_required: "Variant information needs correction",
  unknown_fields: "Unrecognized fields need review",
  invalid_envelope: "File format needs correction",
  row_count_out_of_range: "File has no rows or exceeds the row limit",
  expected_object: "Row format needs correction",
};
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max) : "";
}
function display(value: unknown, field: string): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (field === "destinationUrl") {
    try { const url = new URL(String(value));
      if (url.protocol !== "https:" || url.username || url.password) return "Invalid or credential-bearing link (hidden)";
      return `${url.origin}${url.pathname}${url.search || url.hash ? " [parameters hidden]" : ""}`.slice(0, 300);
    } catch { return "Invalid link"; }
  }
  if (field === "variantAttributes") {
    if (!object(value)) return "Invalid variant details";
    return Object.entries(value).slice(0, 30).map(([key, val]) => `${text(key, 80)}: ${typeof val === "string" ? text(val, 200) : "Invalid value"}`).join("; ") || "No variants supplied";
  }
  return typeof value === "number" && Number.isFinite(value) ? String(value) : text(value) || "Invalid value";
}
export type ReviewCard = {
  id: string; row: number; title: string; sku: string; vendorId: string;
  createdAt: string; blocked: boolean; reasons: string[];
  fields: { label: string; original: string; proposed: string }[];
};
// Only known display fields cross into the browser. Never send raw packet JSON.
export function packetCards(packet: unknown, expectedId: string): ReviewCard[] | null {
  if (!object(packet) || packet.formatVersion !== 1 || packet.packetId !== expectedId ||
      !/^[a-f0-9]{64}$/.test(expectedId) || typeof packet.vendorId !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(packet.vendorId) || typeof packet.createdAt !== "string" ||
      !Number.isFinite(Date.parse(packet.createdAt)) || typeof packet.blockedBatch !== "boolean" ||
      packet.publishable !== false || !Array.isArray(packet.items) || packet.items.length > 10_000) return null;
  const cards: ReviewCard[] = [];
  const seen = new Set<number>();
  for (const item of packet.items) {
    if (!object(item) || item.status !== "New" || typeof item.row !== "number" ||
        !Number.isInteger(item.row) || item.row < 0 || seen.has(item.row) ||
        !Array.isArray(item.reasons) || item.reasons.some(reason => typeof reason !== "string")) return null;
    seen.add(item.row);
    const original = object(item.original) && item.row !== 0 ? item.original : {};
    const proposed = object(item.proposed) ? item.proposed : null;
    cards.push({
      id: `${expectedId}:${item.row}`, row: item.row,
      title: item.row === 0 ? "File needs review" : text(original.name) || "Unnamed vendor item",
      sku: text(original.vendorSku) || "No SKU", vendorId: packet.vendorId,
      createdAt: new Date(packet.createdAt).toISOString(), blocked: packet.blockedBatch,
      reasons: item.reasons.slice(0, 30).map(reason => reasons[String(reason).split(":").at(-1)!] || "Unrecognized validation issue"),
      fields: Object.entries(labels).map(([field, label]) => ({ label,
        original: display(original[field], field), proposed: proposed ? display(proposed[field], field) : "No valid proposal",
      })),
    });
  }
  return cards;
}
