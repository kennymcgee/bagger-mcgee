import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseVendorCsv,csvHeaders} from '../src/ingestion/csv.ts';
const header=csvHeaders.join(',')+'\r\n';
const row='SKU,Product,Brand,PART,{},https://example.com,12.50,USD,1,aftermarket,new';
test('CSV accepts BOM/CRLF and quoted JSON/commas and marks fictional sample preview-only',async()=>{
 const text=await readFile(new URL('../public/vendor-files/Bagger-McGee-FICTIONAL-Example.csv',import.meta.url),'utf8');
 const parsed=parseVendorCsv(text);assert.equal(parsed.validation.validRows,3);assert.equal(parsed.fictional,true);assert.equal(parsed.feed.rows[0].variantAttributes.finish,'black');assert.match(parsed.feed.rows[0].name,/, black$/);
});
test('CSV rejects malformed headers, quotes, column count and variants',()=>{
 for(const text of ['bad\n'+row,header+'"unfinished',header+'"SKU"junk,Product',header+row+',extra',header+row.replace('{}','not-json')]) assert.throws(()=>parseVendorCsv(text),/CSV:/);
});
test('CSV validates duplicate SKUs, noninteger quantities, blank files and invalid prices',()=>{
 assert.equal(parseVendorCsv(header+row+'\n'+row).validation.rejectedRows,2);
 assert.equal(parseVendorCsv(header+row.replace(',1,',',1.5,')).validation.rejectedRows,1);
 assert.equal(parseVendorCsv(header+row.replace('12.50','-1')).validation.rejectedRows,1);
 assert.equal(parseVendorCsv(header).validation.status,'blocked');
 assert.equal(parseVendorCsv(header+row+'\n\n').validation.validRows,1);
});
test('CSV caps rows/size and does not silently accept extra data after quoted fields',()=>{
 assert.throws(()=>parseVendorCsv(header+(row+'\n').repeat(10001)),/10,000/);
 assert.throws(()=>parseVendorCsv('x'.repeat(5*1024*1024+1)),/5 MiB/);
 assert.throws(()=>parseVendorCsv(header+'"SKU"x,'),/closing quote/);
});
