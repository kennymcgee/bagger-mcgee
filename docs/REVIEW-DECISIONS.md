# Local review decisions

Authenticated Owners and Reviewers can save one of New, In Review, Waiting on VENDOR,
Resolved, or Dismissed with a required note (maximum 2,000 characters). Every save
checks fresh role/MFA and confirms the item belongs to a readable real packet.
The reviewer ID and role come from the verified session, never client input.

Decisions append separate revision files under ignored local-imports/decisions.
Original packets remain unchanged. Completed files are published using exclusive
hard links: stale/concurrent submissions cannot replace an existing revision.
History records previous/next status, note, server timestamp, reviewer ID and role.
Unreadable or incomplete history disables saves. Reopening is allowed with a note.
This is local storage, not database-backed, tamper-proof, or suitable for deployment;
back up private local-imports separately. No catalog approval or publishing occurs.

Samples support temporary practice decisions and history in browser memory only.
Refresh clears them. Real notes should never contain passwords or credentials.

Validation: 34 tests passed, including persisted history/reopening, simultaneous
saves, stale revisions, invalid inputs, and corrupt-history rejection. Production
build/TypeScript and ESLint passed. Live authenticated save and browser interaction
verification awaits launch of the updated build on port 3003. Existing port 3002
build remains untouched. Account recovery/revocation integration tests remain pending.
