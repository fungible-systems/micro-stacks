---
'micro-stacks': patch
---

This update makes two quality of life improvements to some of our clarity helper functions: `contractPrincipalCV` and the new `boolCV`.

With `contractPrincipalCV`, you can now pass only a `contract_id` (CONTRACT_ADDRESS.CONTRACT_NAME) and it will parse it automatically for you.

With the new `boolCV`, you can now pass a boolean value to it, and it will return the correct boolean clarity value. Previously we only had access to either a `trueCV` or `falseCV`.

