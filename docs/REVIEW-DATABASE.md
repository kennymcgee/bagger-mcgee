# Development database review storage

Run scripts/transfer-review-database.mjs --apply from the prepared launcher. It
uses the existing guarded development credentials and strict TLS. It creates only
three private review tables; existing catalog tables and publishing remain untouched.
The review schema is maintained by migrations/001-review-storage.sql, separately
from the earlier Drizzle catalog migrations; do not regenerate/drop these tables.

Packets, review items and append-only events have RLS enabled and no PUBLIC,
anon or authenticated grants. Only the server database connection accesses them.
Updates/deletes are rejected by triggers. The database administrator can still
alter protections; this is not tamper-proof audit storage. All web saves first
recheck trusted Auth role/MFA, lock the item row, replay history, reject a stale
revision and insert one event in a transaction. Status/correction/approval policy
is shared with the former local store. No automatic public access is enabled.

Transfer validates all local packets and journals before copying. A transaction
transfers all validated packets, retaining original local files. Repeated transfer
accepts matching history prefixes, preserves newer database events, and rejects
conflicting packets/history. Orphan history and malformed files stop the process.
New local packets from import:review need another explicit transfer command.
Use only the new port 3006 app for edits after migration. Old running versions
still write local journals and must not be used for further edits. There is no
fallback to local writes when the database is unavailable.

Validation: 38 policy/local-history tests and production build/TypeScript/ESLint
passed. The launcher still needs to run live privacy, immutable-history, duplicate
revision, idempotent transfer, conflict rejection and full workflow rollback tests,
then transfer existing data. Browser database-write verification remains pending.
The script reports only safe status/counts to ignored .review-database-result.json.
All synthetic integration rows are rolled back. No credentials appear in output.
