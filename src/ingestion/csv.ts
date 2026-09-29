import { validateFeed } from "./validate.ts";
export const csvHeaders = ["vendorSku","name","brandName","manufacturerPartNumber","variantAttributes","destinationUrl","itemPrice","currency","quantity","origin","condition"];
export function parseVendorCsv(text: string) {
  if (new TextEncoder().encode(text).length > 5*1024*1024) throw new Error("CSV: the file exceeds 5 MiB.");
  text = text.replace(/^\uFEFF/, "");
  const records: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false; let closed = false;
  function endCell() {row.push(cell); cell=""; closed=false; if(row.length>11) throw new Error("CSV: a row has too many columns.");}
  function endRow() {endCell(); if(row.some(v=>v!=="")) records.push(row); row=[]; if(records.length>10001) throw new Error("CSV: maximum 10,000 product rows.");}
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted) {if(c==='"') {if(text[i+1]==='"') {cell+='"';i++;} else {quoted=false;closed=true;}} else cell+=c; continue;}
    if(c===',') {endCell();continue;}
    if(c==='\r'||c==='\n') {if(c==='\r'&&text[i+1]==='\n') i++; endRow();continue;}
    if(closed) throw new Error("CSV: unexpected text after a closing quote.");
    if(c==='"') {if(cell) throw new Error("CSV: a quote must begin a quoted field.");quoted=true;} else cell+=c;
  }
  if(quoted) throw new Error("CSV: a quoted field is unfinished.");
  if(cell||row.length||closed) endRow();
  if(JSON.stringify(records[0])!==JSON.stringify(csvHeaders)) throw new Error("CSV: use the template's eleven column names in their original order.");
  const rows=records.slice(1).map((values,index)=>{
    if(values.length!==11) throw new Error(`CSV: product row ${index+1} must have eleven columns.`);
    let variants: unknown;
    try {variants=JSON.parse(values[4]);} catch {throw new Error(`CSV: product row ${index+1} has invalid variant details. Use a JSON object, such as {}.`);}
    return {vendorSku:values[0],name:values[1],brandName:values[2],manufacturerPartNumber:values[3],variantAttributes:variants,destinationUrl:values[5],itemPrice:values[6],currency:values[7],quantity:/^[0-9]+$/.test(values[8])?Number(values[8]):null,origin:values[9]||null,condition:values[10]||null};
  });
  const feed={formatVersion:1,rows}; const validation=validateFeed(feed);
  return {feed,validation,fictional:rows.some(r=>r.name.startsWith("FICTIONAL ")&&r.vendorSku.startsWith("DEMO-"))};
}
