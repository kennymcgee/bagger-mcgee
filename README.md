# bagger-mcgee
Bagger McGee — motorcycle parts price comparison platform for Harley-Davidson and Indian motorcycles.

## BUILD-01 foundation

Next.js App Router + TypeScript, with an initial Drizzle catalog schema and
Supabase client helpers. Ingestion, search, fitment, full Auth/Admin, and Vercel
deployment are not yet implemented.

With Node.js 22+ and pnpm 11.25.0 installed:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. No account or credentials are needed for this placeholder.

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm start
```

`/api/health` provides liveness only. `/admin` deliberately returns 404 until
server-side authentication and admin-role checks are implemented. The placeholder
is marked noindex. No live products or prices are represented.

See [BUILD-01 status](docs/BUILD-01.md) for validation and remaining work.

## Development database

The connection is restricted to the isolated development project. Never use a
production connection in `.env.local`. TLS verifies both the certificate and
hostname with Supabase's official public root certificate in `certs/`.

The initial migration adds private `vendors`, `products`, `offers`, and
`import_batches` tables. RLS is enabled with no public policies, and Data API
grants are revoked. No public catalog or ingestion API is enabled.

After configuring `.env.local` privately, apply and test with:

```sh
node scripts/migrate-development.mjs --apply
```

The script checks the exact development destination, uses Drizzle's migration
journal, verifies table privacy, and rolls back its temporary validation rows.
It does not run as part of the app build. Detailed status is saved in the ignored
`.database-migration-result.json` file. Full business workflows still need their
own validation; these checks cover only this initial schema.
