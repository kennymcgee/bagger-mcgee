"use server";
import { createHash } from "node:crypto";
import { getAdminAccess } from "@/lib/auth/admin";
import { reviewConnection } from "@/lib/database-reviews";
import { parseVendorCsv } from "@/ingestion/csv";
import { prepareReview } from "@/ingestion/review";
import { transferPacket } from "@/db/review-store";

async function owner() {
  const access=await getAdminAccess();
  if(access.state!=="allowed"||access.role!=="owner") throw new Error("Upload: sign in as Owner with two-factor verification.");
  return access;
}
async function readUpload(data:FormData) {
  const file=data.get("file");
  if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.csv')||!file.size||file.size>5*1024*1024) throw new Error("Upload: select a CSV file no larger than 5 MiB.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  let text:string; try {text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);} catch {throw new Error("Upload: save the file as CSV UTF-8.");}
  return {...parseVendorCsv(text),hash:createHash('sha256').update(bytes).digest('hex')};
}
const safeError=(e:unknown)=>e instanceof Error && /^(CSV:|Upload:)/.test(e.message)?e.message:"Upload: the operation could not finish. No partial import was saved. Try again after checking the database connection.";
export async function previewCsv(data:FormData) {
  try {await owner(); const p=await readUpload(data);return {preview:{hash:p.hash,total:p.validation.totalRows,valid:p.validation.validRows,rejected:p.validation.rejectedRows,fictional:p.fictional,issues:p.validation.issues.slice(0,100),issueCount:p.validation.issues.length}};}
  catch(e) {return {error:safeError(e)};}
}
export async function listUploadVendors() {
  try {await owner();const rows=await reviewConnection()`select id,name from public.vendors order by name,id limit 500`;return {vendors:rows.map(row=>({id:String(row.id),name:String(row.name)}))};}
  catch(e) {return {error:safeError(e)};}
}
export async function addUploadVendor(name:string,website:string) {
  try {
    await owner(); name=name.trim(); website=website.trim();
    if(!name||name.length>200||/[\u0000-\u001f]/.test(name)) throw new Error("Upload: enter a vendor name of 1–200 characters.");
    let url:URL; try {url=new URL(website);} catch {throw new Error("Upload: enter a public HTTPS vendor website.");}
    if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||website.length>2048) throw new Error("Upload: use an HTTPS website without credentials or parameters.");
    const slug='intake-'+createHash('sha256').update(name.toLowerCase()+'|'+url.origin).digest('hex');
    const client=reviewConnection();
    const vendor=await client.begin(async tx=>{
      await tx`insert into public.vendors(name,slug,website_url,is_active) values(${name},${slug},${url.href},false) on conflict(slug) do nothing`;
      const [row]=await tx`select id,name from public.vendors where slug=${slug}`;return {id:String(row.id),name:String(row.name)};
    });return {vendor};
  } catch(e) {return {error:safeError(e)};}
}
export async function importCsv(data:FormData) {
  try {
    const access=await owner(); const p=await readUpload(data);
    if(p.hash!==data.get('previewHash')) throw new Error("Upload: the file changed. Preview it again before importing.");
    if(p.validation.status==='blocked') throw new Error("Upload: fix all validation errors and preview again.");
    if(p.fictional) throw new Error("Upload: the fictional example is for preview only. Select real vendor data to import.");
    const vendorId=String(data.get('vendorId')??'');
    if(!/^[a-f0-9-]{36}$/i.test(vendorId)) throw new Error("Upload: choose a vendor first.");
    const packet={...prepareReview(JSON.stringify(p.feed),vendorId,new Date().toISOString()),uploadedBy:access.userId,sourceCsvHash:p.hash};
    const client=reviewConnection();
    return await client.begin(async tx=>{
      const vendors=await tx`select id from public.vendors where id=${vendorId} for share`;
      if(!vendors.length) throw new Error("Upload: vendor no longer exists. Choose a vendor again.");
      await tx`select pg_advisory_xact_lock(hashtextextended(${packet.packetId},0))`;
      const existing=await tx`select id from public.review_packets where id=${packet.packetId}`;
      if(existing.length) return {message:"This vendor file is already in the queue. Its existing reviews were kept."};
      await transferPacket(tx,packet,packet.packetId,{});
      return {message:`Imported ${packet.items.length} item(s) into the private review queue. Nothing was published.`};
    });
  } catch(e) {return {error:safeError(e)};}
}
