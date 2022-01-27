---
'micro-stacks': patch
---

This fixes a small bug where the public key for iss in the gaia hub config was set as a Uint8Array, rather than a hex string. Additionally, this cleans up that function to not have any type casting.
