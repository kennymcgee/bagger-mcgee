import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateAdminAccess, localAdminEnabled } from "../src/lib/auth/policy.ts";

const user = {
  id: "owner-id", app_metadata: { bagger_role: "owner" },
  factors: [{ factor_type: "totp", status: "verified" }],
};
const claims = { sub: "owner-id", aal: "aal2" };
test("missing or mismatched verified identity cannot enter admin", () => {
  for (const [account, token] of [[null, claims], [user, null], [user, { ...claims, sub: "different" }]]) {
    assert.equal(evaluateAdminAccess(account, token).state, "signed_out");
  }
});
test("client editable metadata never grants admin", () => {
  const account = { ...user, app_metadata: {}, user_metadata: { bagger_role: "owner" } };
  assert.equal(evaluateAdminAccess(account, claims).state, "denied");
});
test("revoked and unknown roles fail closed even with AAL2", () => {
  for (const role of [undefined, null, "admin", "OWNER", "", { owner: true }]) {
    assert.equal(evaluateAdminAccess({ ...user, app_metadata: { bagger_role: role } }, claims).state, "denied");
  }
});
test("password-only session and missing or unverified factors need MFA", () => {
  for (const aal of [undefined, "aal1", "aal3"]) {
    assert.equal(evaluateAdminAccess(user, { ...claims, aal }).state, "mfa_required");
  }
  for (const factors of [undefined, [], [{ factor_type: "totp", status: "unverified" }]]) {
    assert.equal(evaluateAdminAccess({ ...user, factors }, claims).state, "mfa_required");
  }
});
test("verified owner and reviewer retain their distinct roles", () => {
  for (const role of ["owner", "reviewer"]) {
    assert.deepEqual(evaluateAdminAccess({ ...user, app_metadata: { bagger_role: role } }, claims),
      { state: "allowed", role, userId: user.id });
  }
});
test("admin login is restricted to the configured isolated development project", () => {
  const env = { APP_ENV: "development", NEXT_PUBLIC_SUPABASE_URL: "https://selvtumjitqxtwpmgcgb.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-only" };
  assert.equal(localAdminEnabled(env), true);
  for (const change of [{ APP_ENV: "production" }, { VERCEL_ENV: "preview" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co" }, { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" }]) {
    assert.equal(localAdminEnabled({ ...env, ...change }), false);
  }
});
