export type AdminRole = "owner" | "reviewer";
export type Access =
  | { state: "signed_out" }
  | { state: "denied" }
  | { state: "mfa_required" | "allowed"; userId: string; role: AdminRole };

// Inputs must come from getUser() and signature-verified getClaims(), never form data.
export function evaluateAdminAccess(
  user: { id: string; app_metadata?: Record<string, unknown>; factors?: { status: string; factor_type: string }[] } | null,
  claims: { sub?: unknown; aal?: unknown } | null,
): Access {
  if (!user || !claims || claims.sub !== user.id) return { state: "signed_out" };
  const role = user.app_metadata?.bagger_role;
  if (role !== "owner" && role !== "reviewer") return { state: "denied" };
  const verifiedFactor = user.factors?.some(factor => factor.factor_type === "totp" && factor.status === "verified");
  return {
    state: claims.aal === "aal2" && verifiedFactor ? "allowed" : "mfa_required",
    userId: user.id, role,
  };
}

export function localAdminEnabled(env: Record<string, string | undefined>) {
  return env.APP_ENV === "development" && !env.VERCEL_ENV &&
    env.NEXT_PUBLIC_SUPABASE_URL === "https://selvtumjitqxtwpmgcgb.supabase.co" &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
