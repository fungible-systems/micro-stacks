---
'micro-stacks': patch
---

This update fixes an issue where certain message signing related functions were not exported correctly from `micro-stacks/connect`. `verifyStructuredMessageSignature` should now be exported, along with some helper functions to generate structured data hashes.
