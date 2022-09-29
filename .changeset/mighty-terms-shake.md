---
'micro-stacks': patch
'@micro-stacks/react': patch
'@micro-stacks/storage': patch
---

This update introduces new storage primitives in the package `@micro-stacks/storage`.

- a new `Storage` class, which consumes an instance of the `MicroStacksClient` OR takes a `privateKey`
- a new `Model` class, which takes a storage _adapter_ and makes working with Gaia much easier

Additionally, there have been some non-breaking changes done to `micro-stacks` to allow for passing fetch functions to
the inner workings of various functions.
