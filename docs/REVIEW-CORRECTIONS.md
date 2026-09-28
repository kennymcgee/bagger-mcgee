# Product corrections and evidence

The local review form can append one proposed field correction per save, with a
required review note, public HTTPS evidence URL, and evidence summary. Supported
fields: name, brand, part number, item price, quantity, OEM/aftermarket identity,
condition, and item link. Variant/fitment/merge/Shipping Score edits remain outside
this slice. Corrections do not approve, publish, alter the import packet, or resolve
validation issues automatically. Evidence is a reviewer claim, not auto-verified.

The comparison table keeps original vendor data, initial proposed values, and
latest reviewer corrections separate. Each correction shares the decision journal's
revision, authenticated actor, role, timestamp, and concurrency protection. History
retains old corrections and evidence; ordinary status saves do not erase them.
Old decision-only journal entries remain readable. Browser samples are temporary.
Evidence links reject credentials/query/fragment parameters and are displayed as
text without fetching them. Saved notes/evidence are private local files, not Git.
This storage is not tamper-proof and requires local backup; hosting remains deferred.

Validation: 36 tests passed, including correction persistence across status changes,
previous correction tracking, stale revision rejection, and invalid evidence/value
rejection. Production build, TypeScript, and ESLint passed. Signed-in browser
verification of correction submission remains pending the port 3004 launch.
