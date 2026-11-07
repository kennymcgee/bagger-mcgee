import { redirect, notFound } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { EnrollmentForm, VerificationForm } from "../forms";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";
export default async function VerifyPage() {
  const access = await getAdminAccess();
  if (access.state === "signed_out") redirect("/admin/login");
  if (access.state === "denied") notFound();
  if (access.state === "allowed") redirect("/admin");
  const client = await createClient();
  const { data, error } = await client.auth.mfa.listFactors();
  const factor = data?.totp.find(factor => factor.status === "verified");
  return <main className="admin-shell"><p className="eyebrow">BAGGER McGEE · PRIVATE ADMIN</p>
    <h1>Verify it’s you</h1>
    {error ? <p role="alert">Authenticator details could not load. Reload this page to try again.</p>
      : factor ? <VerificationForm factorId={factor.id} /> : <EnrollmentForm />}
    <form action={signOut}><button className="secondary">Sign out</button></form>
  </main>;
}
