# Local administrator authentication

Implements the sign-in portion of MVP-AS1/AS2. `/admin/login` accepts an existing
administrator's email and password. `/admin/verify` enrolls or challenges a TOTP
authenticator. `/admin` requires a verified identity, current administrator role,
a verified TOTP factor, and a signature-verified token with AAL2.

Roles are read from the fresh Auth server user record's `app_metadata.bagger_role`
(`owner` or `reviewer`), never from client-editable user metadata or a submitted
form. `getUser()` checks the current account and `getClaims()` verifies the token;
their user IDs must match. Role revocation is checked on each protected request.
Future admin data operations must repeat this guard and enforce role-specific
permissions. The current authenticated page exposes no catalog data or mutations.

The Next.js proxy refreshes session cookies on `/admin` paths. Responses use
private/no-store cache headers. Server actions handle cookie writes and rely on
Next.js same-origin action protections. Error text is generic and credentials,
tokens, OTPs, and enrollment secrets are not logged. The QR code/setup key are
shown only to the signed-in administrator during enrollment. This setup action
can restart unfinished TOTP enrollment but never removes verified factors.

## Owner setup handoff

1. The owner privately creates their Auth user in the isolated Supabase development
   project's Authentication > Users > Add user > Create new user form.
2. After verifying that user's identity and UUID, explicitly provision its trusted
   `app_metadata.bagger_role` as `owner` using privileged administration. Creating
   an Auth user alone never grants an administrator role. No user was granted a
   role by this code change, and there is no automatic first-user promotion.
3. Run the app locally, sign in, privately enroll an authenticator, and verify the
   code. Then test logout/relogin, incorrect-code rejection, and session renewal.

Authentication is restricted to the existing development Supabase project and
disabled in Vercel/other environments. No paid service or migration is required.
Use the owner-controlled dashboard for account recovery during development; a
documented and tested recovery process remains a production prerequisite.

## Validation and limits

September 25, 2026: 27 tests pass, including denied/missing roles, user-metadata
spoofing, mismatched user/token, AAL1, unverified factors, and deployment guards.
Build, TypeScript, and ESLint pass. Signed-out HTTP checks: `/admin` and
`/admin/verify` redirect to `/admin/login`; login returns 200 with no-store;
health returns 200. The login page was visually inspected.

These policy tests are not a substitute for real Auth integration testing.
Owner creation, role assignment, actual password sign-in, MFA enrollment/verification,
refresh/revocation and recovery are still pending user-assisted end-to-end tests.
Network restrictions on the agent's local process may require starting the app
from the user's ordinary PowerShell for those live tests. There is no Auth signup
surface in this application; review project-level signup and abuse settings before
hosting. Review queue UI, durable audit records, sensitive-action reconfirmation,
and catalog mutation permissions are not implemented. Do not deploy publicly yet.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs),
[TOTP flow](https://supabase.com/docs/guides/auth/auth-mfa/totp).
