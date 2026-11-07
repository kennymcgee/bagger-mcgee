"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/auth/admin";
import { localAdminEnabled } from "@/lib/auth/policy";

export type FormState = { error?: string; qr?: string; secret?: string; factorId?: string };
const signInError = { error: "Sign-in was not completed. Check your details and owner-account setup, then try again." };

export async function signIn(_previous: FormState, form: FormData): Promise<FormState> {
  if (!localAdminEnabled(process.env)) return signInError;
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 ||
      !email.includes("@") || password.length < 1 || password.length > 1024) return signInError;
  try {
    const client = await createClient(true);
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return signInError;
    const access = await getAdminAccess();
    if (access.state === "denied" || access.state === "signed_out") {
      await client.auth.signOut({ scope: "local" });
      return signInError;
    }
  } catch { return signInError; }
  redirect("/admin");
}

export async function signOut() {
  const client = await createClient(true);
  await client.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}

export async function enroll(_previous: FormState): Promise<FormState> {
  void _previous;
  const access = await getAdminAccess();
  if (access.state !== "mfa_required") return { error: "Sign in with an authorized administrator account first." };
  try {
    const client = await createClient(true);
    const { data: factors, error } = await client.auth.mfa.listFactors();
    if (error || factors.totp.some(factor => factor.status === "verified")) {
      return { error: "Your account already has an authenticator. Reload this page and enter its code." };
    }
    // Restart only unfinished TOTP enrollment; verified factors are never removed here.
    for (const factor of factors.all) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (error) return { error: "Authenticator setup could not restart. Please try again." };
      }
    }
    const { data, error: enrollmentError } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Bagger McGee administrator" });
    if (enrollmentError) return { error: "Authenticator setup could not start. Please try again." };
    return { qr: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
  } catch { return { error: "Authenticator setup is temporarily unavailable. Please try again." }; }
}

export async function verify(_previous: FormState, form: FormData): Promise<FormState> {
  const access = await getAdminAccess();
  if (access.state !== "mfa_required" && access.state !== "allowed") return { error: "Sign in again to continue." };
  const factorId = form.get("factorId");
  const code = form.get("code");
  if (typeof factorId !== "string" || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return { error: "Enter the six-digit code from your authenticator." };
  }
  try {
    const client = await createClient(true);
    const { data: factors, error } = await client.auth.mfa.listFactors();
    if (error || !factors.all.some(factor => factor.id === factorId && factor.factor_type === "totp")) {
      return { error: "Authenticator not found. Reload this page and try again." };
    }
    const { error: verificationError } = await client.auth.mfa.challengeAndVerify({ factorId, code });
    if (verificationError) return { error: "That code did not verify. Try the latest code from your authenticator." };
    if ((await getAdminAccess()).state !== "allowed") return { error: "Access could not be verified. Sign in again." };
  } catch { return { error: "Verification is temporarily unavailable. Please try again." }; }
  redirect("/admin");
}
