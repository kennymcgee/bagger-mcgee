import "server-only";
import { createClient } from "@/lib/supabase/server";
import { evaluateAdminAccess, localAdminEnabled, type Access } from "./policy";

export async function getAdminAccess(): Promise<Access> {
  if (!localAdminEnabled(process.env)) return { state: "denied" };
  try {
    const client = await createClient();
    // Fetch the current role from Auth so revocation does not wait for JWT expiry.
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { state: "signed_out" };
    const { data: claimsData, error: claimsError } = await client.auth.getClaims();
    if (claimsError || !claimsData) return { state: "signed_out" };
    return evaluateAdminAccess(userData.user, claimsData.claims);
  } catch {
    return { state: "signed_out" };
  }
}
