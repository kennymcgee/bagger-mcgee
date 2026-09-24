# BUILD-01 foundation status

Approved architecture: Next.js, TypeScript, PostgreSQL on Supabase, Supabase Auth,
Drizzle ORM, Vercel, PostgreSQL MVP search, and a standardized VENDOR ingestion pipeline.

## Foundation completed

- App Router and strict TypeScript configuration.
- Responsive coming-soon page; no invented products, prices, or vendor claims.
- Health endpoint, baseline response headers, and an admin route that always denies access.
- Environment-variable template with no credentials.
- Existing repository README and ignore rules preserved.

## Validation

Validated on Windows with Next.js 16.3.6 and React 19.3.0:

- Production build passed.
- Strict TypeScript check and ESLint passed.
- Running production server: home 200, health 200 with {"status":"ok"}, admin 404.
- Browser inspection of the home page passed.
- Dependencies are pinned to the installed versions and a pnpm lockfile is included.

The package manager initially flagged the unrs-resolver installation hook.
Its prebuilt Windows binary works without the hook; the workspace explicitly
keeps that hook disabled. Linux/Vercel validation remains pending. ESLint 9.39.5
is marked deprecated by the registry; review upgrading the lint toolchain before
production. Offline reinstall could not be validated because cached registry
metadata was unavailable in this task. No package-policy checks were disabled.

## Remaining work, in order

1. Review the foundation draft PR and validate a fresh install on the target host.
2. Guide Kenny through Supabase account/project setup. He handles authorizations,
   credentials, costs, and business/security/architecture decisions.
3. Implement the approved initial Drizzle schema after recovering detailed data
   model decisions. Do not infer new product or ingestion rules from this skeleton.
4. Add Supabase session handling and server-verified admin roles. Never grant admin
   from client-editable user metadata. Keep admin disabled until verified.
5. Connect a separate preview database and create a Vercel preview. Do not deploy
   production or apply migrations automatically during builds.

Keep all .env files and credentials out of Git. Only .env.example is tracked.
Do not enter database credentials into this conversation.
