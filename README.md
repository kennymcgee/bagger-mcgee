# bagger-mcgee
Bagger McGee — motorcycle parts price comparison platform for Harley-Davidson and Indian motorcycles.

## BUILD-01 foundation

Next.js App Router + TypeScript. Supabase, Drizzle, ingestion, search, and Vercel
integration are the next stages; they are not yet implemented.

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
