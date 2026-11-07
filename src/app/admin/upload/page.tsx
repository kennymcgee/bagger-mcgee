import { notFound,redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { listUploadVendors } from "../upload-actions";
import { UploadForm } from "../upload-form";
export const dynamic="force-dynamic";
export default async function UploadPage() {
  const access=await getAdminAccess();
  if(access.state==='signed_out')redirect('/admin/login');
  if(access.state==='mfa_required')redirect('/admin/verify');
  if(access.state!=='allowed'||access.role!=='owner')notFound();
  const result=await listUploadVendors();
  return <main className="admin-shell review-shell"><p className="eyebrow">BAGGER McGEE · PRIVATE ADMIN</p><h1>Upload vendor CSV</h1><p>Preview the file, choose its vendor, then import it for review.</p>{result.error?<p role="alert">{result.error}</p>:<UploadForm initialVendors={result.vendors??[]} />}</main>;
}
