# Evidence verification and correction approval

Owners and Reviewers can verify or reject the evidence attached to a current
correction. Only Owners can approve or revoke its approval. A required reason,
verified session identity/role, server timestamp, and exact correction revision
are appended to the same local journal. Each save rechecks role/MFA and real
packet membership. Approval requires verified evidence for that exact correction.

Replacing a correction creates a new unverified proposal. Rejecting evidence
invalidates an active approval; verifying again still requires fresh approval.
Stale/concurrent saves cannot overwrite history. Journal replay applies the same
rules and fails closed on invalid events. Previous decision/correction journals
remain readable. Samples use the same policy with temporary browser state.

Approval applies only to a correction, not the whole product. It does not change
catalog records, clear import errors, or publish anything. Local storage is not
production-ready or tamper-proof. Human verification means the reviewer reads
the source; the app does not automatically fetch or verify it. Self-verification
by an Owner is allowed for this single-owner development workflow.

Validation: all 38 tests, production build/TypeScript and ESLint passed. Tests
cover missing verification, Owner-only approval, rejection/re-verification,
revocation, replacement correction invalidation, and stale approval attempts.
Live browser verification awaits launching the new port 3005 build.

Live Owner verification passed September 29, 2026: approval disabled before verification; verification, approval, and revocation succeeded; approval and revocation persisted after refresh with actor/reason history retained. Temporary synthetic packet and all four journal revisions removed. No catalog or database changes made.
