"use client";
import { useState } from "react";
import Link from "next/link";
import { previewCsv, importCsv, addUploadVendor } from "./upload-actions";
type Preview=NonNullable<Awaited<ReturnType<typeof previewCsv>>["preview"]>;
export function UploadForm({initialVendors}:{initialVendors:{id:string;name:string}[]}) {
  const [vendors,setVendors]=useState(initialVendors); const [vendor,setVendor]=useState("");
  const [file,setFile]=useState<File|null>(null); const [preview,setPreview]=useState<Preview|null>(null);
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [name,setName]=useState(""); const [website,setWebsite]=useState("");
  async function processFile(importing:boolean) {
    setBusy(true);setMessage("");
    try {
      const data=new FormData(); if(file)data.set('file',file);data.set('vendorId',vendor);data.set('previewHash',preview?.hash??'');
      if(importing) {const result=await importCsv(data);setMessage('error' in result ? result.error : result.message); if('message' in result)setPreview(null);}
      else {setPreview(null);const result=await previewCsv(data); if(result.preview)setPreview(result.preview);setMessage(result.error??'Preview complete. No records have been imported.');}
    } catch {setMessage('The request did not finish. Preview again before retrying.');setPreview(null);}
    finally {setBusy(false);}
  }
  async function addVendor(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setMessage("");
    try {const result=await addUploadVendor(name,website); if(result.vendor){const v=result.vendor;setVendors(old=>old.some(x=>x.id===v.id)?old:[...old,v]);setVendor(v.id);setName("");setWebsite("");setMessage('Vendor saved as inactive. It is selected for this upload.');}else setMessage(result.error??'Could not save vendor.');}
    catch {setMessage('Could not save vendor. Try again.');} finally{setBusy(false);}
  }
  return <>
    <p><a href="/vendor-files/Bagger-McGee-Vendor-Template.csv" download>Download blank CSV</a>{" · "}<a href="/vendor-files/Bagger-McGee-FICTIONAL-Example.csv" download>Download fictional example</a>{" · "}<a href="/vendor-files/Vendor-Instructions.md" download>Download instructions</a></p>
    <label htmlFor="csv-file">Choose vendor CSV (UTF-8, up to 5 MiB)</label><input id="csv-file" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]??null);setPreview(null);setMessage('');}} />
    <button type="button" disabled={busy||!file} onClick={()=>processFile(false)}>{busy?'Working…':'Preview file'}</button>
    {preview && <section><h2>File preview</h2><p>{preview.total} product rows · {preview.valid} valid · {preview.rejected} rejected</p>
      {preview.fictional && <p>This is the fictional example. You can preview it, but it cannot enter the real review queue.</p>}
      {preview.issueCount>0 ? <><p role="alert">Fix the issues below and preview the file again. Showing {preview.issues.length} of {preview.issueCount} issues.</p><ul>{preview.issues.map((issue,i)=><li key={i}>Product row {issue.row}: {issue.field} — {issue.code.replaceAll('_',' ')}</li>)}</ul></> : <p>Format checks passed. Product identity, fitment, links, and claims still require review.</p>}
      <label htmlFor="csv-vendor">Assign this file to a vendor</label><select id="csv-vendor" value={vendor} disabled={busy} onChange={e=>setVendor(e.target.value)}><option value="">Choose a vendor</option>{vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select>
      <p>Import creates private review items only. It does not approve products or publish offers.</p>
      <button type="button" disabled={busy||!vendor||preview.issueCount>0||preview.fictional} onClick={()=>processFile(true)}>Import into private review queue</button>
    </section>}
    <details><summary>Add a vendor</summary><form onSubmit={addVendor}><p>For your first real file, add the vendor name and public website. This creates an inactive vendor record.</p><label htmlFor="vendor-name">Vendor name</label><input id="vendor-name" required maxLength={200} value={name} disabled={busy} onChange={e=>setName(e.target.value)} /><label htmlFor="vendor-site">Vendor website</label><input id="vendor-site" required type="url" maxLength={2048} placeholder="https://" value={website} disabled={busy} onChange={e=>setWebsite(e.target.value)} /><button disabled={busy}>Save inactive vendor</button></form></details>
    <p role="status">{message}</p><Link href="/admin">Return to review queue</Link>
  </>;
}


