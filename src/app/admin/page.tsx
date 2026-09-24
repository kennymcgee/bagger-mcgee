import { notFound } from "next/navigation";

// Fail closed until Supabase Auth and server-verified admin roles are configured.
export default function AdminPage() {
  notFound();
}
