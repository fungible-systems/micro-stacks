---
'micro-stacks': minor
---

This update fixes a bug where the network was not passed to the signed message token payload, resulting in the wallet UI to always default to testnet. This has no affect on the signed messages, and was only a UI issue.
