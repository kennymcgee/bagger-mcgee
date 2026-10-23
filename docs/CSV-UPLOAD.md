# Private CSV upload

Owner-only /admin/upload provides UTF-8 CSV upload (5 MiB, 10,000 product rows),
server-side preview, vendor selection, and explicit transactional import. Every
server action checks fresh role and MFA. Read-only preview writes nothing.
The import re-parses/revalidates the file and requires the preview's SHA-256 hash.
Changed files, invalid rows, missing vendors, and the labeled fictional example
are blocked from real import. Repeated canonical parsed content for the same
vendor preserves the existing packet and all review history. A packet advisory
lock serializes concurrent duplicate imports. Failures roll back the transaction.

The Owner may create an inactive vendor using a name and public HTTPS website.
An intake slug based on normalized name and website origin prevents duplicate
creation on retries. This does not activate the vendor or publish its products.
The CSV format exactly matches the downloadable eleven-column template. Blank
origin/condition map to null; variants are JSON objects. Raw CSV bytes are hashed,
not stored; packet originals preserve parsed field values. No links are fetched.

Templates, fictional examples, and instructions are public static downloads and
contain no vendor data. App data and upload actions remain protected. Samples are
preview-only; unknown real origin/condition still require human review after import.

Validation: 42 tests passed, including CSV quoting/BOM/commas, malformed fields,
invalid prices/quantities, duplicate SKUs, row and size bounds. Production build,
TypeScript and ESLint passed. Live browser preview/import verification awaits
launching the new version on port 3007. No new database migration is required.
