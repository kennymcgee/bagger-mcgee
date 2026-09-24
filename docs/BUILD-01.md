# BUILD-01 foundation status

Approved architecture: Next.js, TypeScript, PostgreSQL on Supabase, Supabase Auth,
Drizzle ORM, Vercel, PostgreSQL MVP search, and a standardized VENDOR ingestion pipeline.

## Foundation completed

- App Router and strict TypeScript configuration.
- Responsive coming-soon page; no invented products, prices, or vendor claims.
- Health endpoint, baseline response headers, and an admin route that always denies access.
- Environment-variable template with no credentials.
- Existing repository README and ignore rules preserved.
- Supabase development project created separately from Cannagram; Kenny reported
  a successful password-authenticated connection after official CA setup.
- Drizzle schema and initial SQL generated for vendors, products, offers, and import batches.
- Guarded development-only migration runner, with transactional constraint checks.
- Initial development migration applied and verified on September 24, 2026.
- Supabase browser/server client helpers; no login or admin permissions enabled yet.
- Local vendor import preflight with pending review, strict price/identity checks,
  duplicate SKU detection, variant preservation, and sanitized CLI reports.

Kenny chose local development on September 24, 2026. Paid Vercel setup is deferred.
The import preflight adds no database writes or published catalog data.

## Validation

Validated on Windows with Next.js 16.3.6 and React 19.3.0:

- Production build passed.
- Strict TypeScript check and ESLint passed.
- All 14 local import validator and CLI tests passed; production build, TypeScript,
  and ESLint rechecked successfully after adding the preflight stage.
- Running production server: home 200, health 200 with {"status":"ok"}, admin 404.
- Browser inspection of the home page passed.
- Live migration report passed: all four tables have row security enabled and no
  public grants. Negative prices, non-USD prices, unverified approved offers, and
  duplicate vendor SKUs were rejected. All validation rows were rolled back.
- Dependencies are pinned to the installed versions and a pnpm lockfile is included.

The package manager flagged unrs-resolver and esbuild installation hooks.
Their prebuilt Windows binaries supported the checks and migration generation;
the workspace explicitly keeps those hooks disabled. Linux/Vercel validation remains pending. ESLint 9.39.5
is marked deprecated by the registry; review upgrading the lint toolchain before
production. Offline reinstall could not be validated because cached registry
metadata was unavailable in this task. No package-policy checks were disabled.

## Remaining work, in order

1. Extend the minimal catalog in subsequent migrations for controlled brands,
   categories, fitment, coupons, review queue, and audit workflows. No claims of
   completed ingestion, publishing eligibility, ranking, or freshness enforcement.
2. Review the updated draft PR and validate a fresh install on the target host.
3. Add Supabase session handling and server-verified admin roles. Never grant admin
   from client-editable user metadata. Keep admin disabled until verified.
4. Connect a separate preview database and create a Vercel preview. Do not deploy
   production or apply migrations automatically during builds.

Keep all .env files and credentials out of Git. Only .env.example is tracked.
Do not enter database credentials into this conversation.

## Roadmap traceability for this slice

Recovered from the approved “Review roadmap decisions” task: MVP-PM1/2 shared
canonical products and separate offers, MVP-PM4 variant protection, MVP-CN2
product-level OEM identity versus offer-level new/used condition, MVP-CN4
unknown data held for review, MVP-PR3 USD only, and MVP-OH8 HTTPS vendor links.
The `catalog_review_state` is an internal publishing gate; it does not replace
the separately approved Admin Review Queue statuses.

The development guard intentionally refuses all Vercel environments until a
separate preview/production connection plan is configured. Secrets stay local;
the root CA is public and was downloaded from the project's official dashboard.
