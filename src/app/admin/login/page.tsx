import { redirect, notFound } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { localAdminEnabled } from "@/lib/auth/policy";
import { LoginForm } from "../forms";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (!localAdminEnabled(process.env)) notFound();
  const access = await getAdminAccess();
  if (access.state === "allowed") redirect("/admin");
  if (access.state === "mfa_required") redirect("/admin/verify");
  return <main className="admin-shell"><p className="eyebrow">BAGGER McGEE · PRIVATE ADMIN</p>
    <h1>Administrator sign-in</h1>
    <p>Use your Bagger McGee administrator account. Your Supabase dashboard sign-in is separate.</p>
    <LoginForm />
    <p className="admin-note">Access is by invitation. Account setup and recovery are handled by the owner.</p>
  </main>;
}
