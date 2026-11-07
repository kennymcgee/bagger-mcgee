CREATE TYPE "public"."import_state" AS ENUM('pending', 'processing', 'completed', 'failed');
--> statement-breakpoint
CREATE TYPE "public"."offer_condition" AS ENUM('new', 'used');
--> statement-breakpoint
CREATE TYPE "public"."product_origin" AS ENUM('oem', 'aftermarket');
--> statement-breakpoint
CREATE TYPE "public"."catalog_review_state" AS ENUM('pending', 'approved', 'hidden');
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"source_reference" text NOT NULL,
	"status" "import_state" DEFAULT 'pending' NOT NULL,
	"accepted_rows" integer DEFAULT 0 NOT NULL,
	"rejected_rows" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "import_batches_counts_nonnegative" CHECK ("import_batches"."accepted_rows" >= 0 AND "import_batches"."rejected_rows" >= 0)
);

--> statement-breakpoint
ALTER TABLE "import_batches" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"import_batch_id" uuid,
	"vendor_sku" text NOT NULL,
	"destination_url" text NOT NULL,
	"item_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"condition" "offer_condition",
	"review_status" "catalog_review_state" DEFAULT 'pending' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offers_valid_price" CHECK ("offers"."item_price" >= 0 AND "offers"."item_price" <> 'NaN'::numeric AND "offers"."currency" = 'USD'),
	CONSTRAINT "offers_positive_quantity" CHECK ("offers"."quantity" > 0),
	CONSTRAINT "offers_sku_required" CHECK (length(trim("offers"."vendor_sku")) > 0),
	CONSTRAINT "offers_destination_https" CHECK ("offers"."destination_url" ~ '^https://[^/[:space:]]+'),
	CONSTRAINT "offers_approved_details_required" CHECK ("offers"."review_status" <> 'approved' OR ("offers"."condition" IS NOT NULL AND "offers"."last_verified_at" IS NOT NULL))
);

--> statement-breakpoint
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand_name" text NOT NULL,
	"manufacturer_part_number" text NOT NULL,
	"canonical_key" text NOT NULL,
	"variant_attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"origin" "product_origin",
	"review_status" "catalog_review_state" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_identity_required" CHECK (length(trim("products"."name")) > 0 AND length(trim("products"."brand_name")) > 0 AND length(trim("products"."manufacturer_part_number")) > 0 AND length(trim("products"."canonical_key")) > 0),
	CONSTRAINT "products_approved_origin_required" CHECK ("products"."review_status" <> 'approved' OR "products"."origin" IS NOT NULL)
);

--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website_url" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_name_required" CHECK (length(trim("vendors"."name")) > 0),
	CONSTRAINT "vendors_website_https" CHECK ("vendors"."website_url" ~ '^https://[^/[:space:]]+')
);

--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "import_batches_vendor_index" ON "import_batches" USING btree ("vendor_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "offers_vendor_sku_unique" ON "offers" USING btree ("vendor_id","vendor_sku");
--> statement-breakpoint
CREATE UNIQUE INDEX "offers_approved_duplicate_unique" ON "offers" USING btree ("vendor_id","product_id","condition","quantity","destination_url") WHERE "offers"."review_status" = 'approved';
--> statement-breakpoint
CREATE INDEX "offers_product_index" ON "offers" USING btree ("product_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "products_canonical_key_unique" ON "products" USING btree ("canonical_key");
--> statement-breakpoint
CREATE INDEX "products_part_number_index" ON "products" USING btree ("manufacturer_part_number");
--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_slug_unique" ON "vendors" USING btree ("slug");
--> statement-breakpoint
REVOKE ALL ON TABLE public.vendors, public.products, public.offers, public.import_batches FROM PUBLIC, anon, authenticated;
