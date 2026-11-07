import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
export const productOrigin = pgEnum("product_origin", ["oem", "aftermarket"]);
export const offerCondition = pgEnum("offer_condition", ["new", "used"]);
export const reviewState = pgEnum("catalog_review_state", ["pending", "approved", "hidden"]);
export const importState = pgEnum("import_state", ["pending", "processing", "completed", "failed"]);

// No public RLS policies in BUILD-01: all catalog data starts private.
export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  websiteUrl: text("website_url").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: createdAt(),
}, table => [
  uniqueIndex("vendors_slug_unique").on(table.slug),
  check("vendors_name_required", sql`length(trim(${table.name})) > 0`),
  check("vendors_website_https", sql`${table.websiteUrl} ~ '^https://[^/[:space:]]+'`),
]).enableRLS();

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brandName: text("brand_name").notNull(),
  manufacturerPartNumber: text("manufacturer_part_number").notNull(),
  // Assigned only after normalization and review. Variant distinctions must not be merged.
  canonicalKey: text("canonical_key").notNull(),
  variantAttributes: jsonb("variant_attributes").$type<Record<string, string>>().default({}).notNull(),
  origin: productOrigin("origin"),
  reviewStatus: reviewState("review_status").default("pending").notNull(),
  createdAt: createdAt(),
}, table => [
  uniqueIndex("products_canonical_key_unique").on(table.canonicalKey),
  index("products_part_number_index").on(table.manufacturerPartNumber),
  check("products_identity_required", sql`length(trim(${table.name})) > 0 AND length(trim(${table.brandName})) > 0 AND length(trim(${table.manufacturerPartNumber})) > 0 AND length(trim(${table.canonicalKey})) > 0`),
  check("products_approved_origin_required", sql`${table.reviewStatus} <> 'approved' OR ${table.origin} IS NOT NULL`),
]).enableRLS();

export const importBatches = pgTable("import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "restrict" }).notNull(),
  // An internal reference, never an authenticated feed URL or a credential.
  sourceReference: text("source_reference").notNull(),
  status: importState("status").default("pending").notNull(),
  acceptedRows: integer("accepted_rows").default(0).notNull(),
  rejectedRows: integer("rejected_rows").default(0).notNull(),
  createdAt: createdAt(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, table => [
  index("import_batches_vendor_index").on(table.vendorId),
  check("import_batches_counts_nonnegative", sql`${table.acceptedRows} >= 0 AND ${table.rejectedRows} >= 0`),
]).enableRLS();

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "restrict" }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  importBatchId: uuid("import_batch_id").references(() => importBatches.id, { onDelete: "restrict" }),
  vendorSku: text("vendor_sku").notNull(),
  destinationUrl: text("destination_url").notNull(),
  itemPrice: numeric("item_price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  condition: offerCondition("condition"),
  reviewStatus: reviewState("review_status").default("pending").notNull(),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  createdAt: createdAt(),
}, table => [
  uniqueIndex("offers_vendor_sku_unique").on(table.vendorId, table.vendorSku),
  uniqueIndex("offers_approved_duplicate_unique").on(table.vendorId, table.productId, table.condition, table.quantity, table.destinationUrl).where(sql`${table.reviewStatus} = 'approved'`),
  index("offers_product_index").on(table.productId),
  check("offers_valid_price", sql`${table.itemPrice} >= 0 AND ${table.itemPrice} <> 'NaN'::numeric AND ${table.currency} = 'USD'`),
  check("offers_positive_quantity", sql`${table.quantity} > 0`),
  check("offers_sku_required", sql`length(trim(${table.vendorSku})) > 0`),
  check("offers_destination_https", sql`${table.destinationUrl} ~ '^https://[^/[:space:]]+'`),
  check("offers_approved_details_required", sql`${table.reviewStatus} <> 'approved' OR (${table.condition} IS NOT NULL AND ${table.lastVerifiedAt} IS NOT NULL)`),
]).enableRLS();
