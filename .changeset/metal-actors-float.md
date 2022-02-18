---
'micro-stacks': patch
---

Adds the `tip` query parameter to read-only API calls. `tip` was already a parameter to the `callReadOnlyFunction` function, but it wasn't actually passed to the API call.
