# Vendor import preflight (local only)

This is the first validation stage of the standardized ingestion pipeline.
It never connects to the database, fetches vendor URLs, or publishes products.
Kenny chose to continue locally and defer paid hosting on September 24, 2026.

## Format version 1

Each file represents one vendor's batch. Vendor identity must come from a future
trusted ingestion context, never from untrusted rows. Vendor-specific adapters
will convert feeds into this internal format; this is not yet an external vendor
onboarding contract. Put private working feeds in the git-ignored `local-imports/`.

```json
{
  "formatVersion": 1,
  "rows": [{
    "vendorSku": "EXAMPLE-01",
    "name": "Synthetic example part",
    "brandName": "Example brand",
    "manufacturerPartNumber": "EX-01",
    "variantAttributes": { "finish": "black" },
    "destinationUrl": "https://example.com/parts/ex-01",
    "itemPrice": "19.90",
    "currency": "USD",
    "quantity": 1,
    "origin": "aftermarket",
    "condition": "new"
  }]
}
```

The example is synthetic and is never seeded into the catalog. Prices are decimal
strings with at most two fractional digits, excluding shipping, tax, and coupons.
Origin is `oem`, `aftermarket`, or unknown (null/omitted). Condition is `new`,
`used`, or unknown; refurbished is rejected. Unknown values remain pending review.
An explicit variant object is required, even if empty; part numbers are never
used to merge rows automatically. SKU case is preserved. Duplicate trimmed SKUs
hold every occurrence. No feed can set approval status or canonical product IDs.

Run with Node 22.18+ (validated with Node 24.19):

```sh
pnpm import:preview local-imports/vendor-feed.json
pnpm test
```

The report contains row numbers and fixed error codes, not raw vendor values.
Exit 0 means structurally valid but still requiring review; exit 1 means blocked;
exit 2 means a file/JSON/usage failure. Row 0 identifies a file-level problem.
A mixed file is blocked as a whole; no subset is applied. The limits of 10,000 rows
and 5 MiB are conservative local preflight limits, not vendor contract decisions.

## Deliberately unfinished

Structural validation does not verify that URLs identify real items, that vendor
claims are true, or that data is fresh. Brand/category taxonomy, fitment, vendor
domain verification, canonical mapping, human review, audit records, atomic batch
application, and preservation of the last good feed still need implementation.
There is no HTTP import endpoint, scheduler, import database write, or public
catalog change in this slice. The function's candidates are internal review data,
not approved offers and must never be sent straight to a publishing operation.
