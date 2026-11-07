# Private local review screen

The `/admin` landing page now lists prepared local packets after the existing
server-side role and MFA guard succeeds. It provides search, blocked-batch
filtering, expandable original/proposed field comparisons, evidence gaps, and
the packet preparation history. There are no approval, correction, status-change,
or publishing controls in this slice. Catalog comparison remains explicitly unknown.

The normal empty queue represents the actual local files. `/admin?sample=1` shows
clearly labeled synthetic items generated in memory, without writing any files or
database records. Sample access uses the same role/MFA guard as the real queue.

Only known display fields reach the browser, rather than whole raw packets.
Item URLs are text only, with credentials rejected and query/fragment parameters
hidden. React escapes vendor text. Invalid packets are skipped with an explicit
incomplete-list warning. Reads use fixed local paths and hashed filenames, reject
file symlinks, and cap file size, number of packets, and displayed rows. This is
a local development reader, not a production storage or ingestion service.

## Validation and running

31 tests passed; build includes TypeScript validation and ESLint passed. The
review component was visually checked with synthetic data using a separate,
temporary static fixture; expanding details worked. The actual port 3002 build
was then checked with an authenticated Owner session: real empty queue, two
clearly labeled sample items, search narrowing, blocked-batch filtering,
expanded rejected-item details, no-match results, and clearing filters all passed
on September 28, 2026. Samples did not create database records.
The earlier owner password and TOTP enrollment were confirmed working by Kenny's
authenticated Owner landing screen on September 28, 2026. Recovery, session
refresh/revocation, and complete authorization integration tests remain pending.

To preserve the user's running app while preparing this update, build with
`BAGGER_REVIEW_BUILD=1` to `.next-review` and start with that same environment flag
on port 3002. The prepared owner launcher does this. The regular `.next` build on
port 3001 remains the earlier version until rebuilt/restarted. No public hosting
or new account setup is needed. Do not put local packets in Git or public assets.
