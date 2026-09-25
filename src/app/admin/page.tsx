import { notFound, redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const access = await getAdminAccess();
  if (access.state === "denied") notFound();
  if (access.state === "signed_out") redirect("/admin/login");
  if (access.state === "mfa_required") redirect("/admin/verify");
  return <main className="admin-shell"><p className="eyebrow">BAGGER McGEE · PRIVATE ADMIN</p>
    <h1>Welcome back</h1><p>Signed in as {access.role === "owner" ? "Owner" : "Reviewer"}, with two-factor verification.</p>
    <section className="notice"><p>Your review workspace is being built. Vendor review packets are currently prepared locally; there are no publishing controls here yet.</p></section>
    <form action={signOut}><button className="secondary">Sign out</button></form>
  </main>;
}
