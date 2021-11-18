# micro-stacks

## 0.1.2

### Patch Changes

- [#40](https://github.com/fungible-systems/micro-stacks/pull/40) [`b3fedc9`](https://github.com/fungible-systems/micro-stacks/commit/b3fedc9c86bc00b368aa2472346380ef71b16455) Thanks [@aulneau](https://github.com/aulneau)! - Fixed an issue with `sponsorTransaction`, where the transaction's signature could not be validated when broadcasted.

## 0.1.1

### Patch Changes

- [#34](https://github.com/fungible-systems/micro-stacks/pull/34) [`86d6c30`](https://github.com/fungible-systems/micro-stacks/commit/86d6c3058b1b5f3e644479a771d89e9c0617f5b5) Thanks [@aulneau](https://github.com/aulneau)! - This refactors some of the code for read only contract calls.

* [#36](https://github.com/fungible-systems/micro-stacks/pull/36) [`b7e5f2e`](https://github.com/fungible-systems/micro-stacks/commit/b7e5f2e3db9817636edc433f2fe2e2920da071d9) Thanks [@aulneau](https://github.com/aulneau)! - This update adds a new version of `cvToValue` where it returns the true values for a given clarity value, rather than an object in some places. Additionally, all cvToX functions have been updated to be sync.

## 0.1.0

### Minor Changes

- [#31](https://github.com/fungible-systems/micro-stacks/pull/31) [`4a8c22e`](https://github.com/fungible-systems/micro-stacks/commit/4a8c22ed82d7892439fa934cb2a98b67eeb9f094) Thanks [@aulneau](https://github.com/aulneau)! - This update removes the `/react` sub-module, moving it to `@micro-stacks/react`. This is a BREAKING change for any react modules used in this package. With this change, we no longer have any optional peer deps.

## 0.0.36

### Patch Changes

- [#25](https://github.com/fungible-systems/micro-stacks/pull/25) [`3f04cf1`](https://github.com/fungible-systems/micro-stacks/commit/3f04cf1f088431784108fa635c52b901a7571e90) Thanks [@aulneau](https://github.com/aulneau)! - This update starts work to improve the react integration of micro-stacks, making way for a nextjs specific export"

## 0.0.35

### Patch Changes

- [`13283e5`](https://github.com/fungible-systems/micro-stacks/commit/13283e5e249f58a62d0cda2d1ed995a55dffb2cb) Thanks [@aulneau](https://github.com/aulneau)! - This is a minor refactor to avoid direct usage of any noble package ouside of the crypto/transactions modules.

* [`e245489`](https://github.com/fungible-systems/micro-stacks/commit/e245489d0d11e01a42e6366aabf212958ab14517) Thanks [@aulneau](https://github.com/aulneau)! - verifySingleSig() and verifyMultiSig() work like the rust code

- [#23](https://github.com/fungible-systems/micro-stacks/pull/23) [`dffd15c`](https://github.com/fungible-systems/micro-stacks/commit/dffd15cff093bce5d18e47ca9bf2dcd543fdb642) Thanks [@aulneau](https://github.com/aulneau)! - This update extends the MicroStacksProvider component to allow for the passing of additional initialValues to the underlying Jotai Provider component.

## 0.0.32

### Patch Changes

- [#19](https://github.com/fungible-systems/micro-stacks/pull/19) [`cd797a0`](https://github.com/fungible-systems/micro-stacks/commit/cd797a01d58547b4a264d4faed9bf7855a338575) Thanks [@aulneau](https://github.com/aulneau)! - This update moves all the api fetchers from the react module into their own module, `micro-stacks/api`

## 0.0.31

### Patch Changes

- [#16](https://github.com/fungible-systems/micro-stacks/pull/16) [`3c53d5a`](https://github.com/fungible-systems/micro-stacks/commit/3c53d5abe0accbbe31b600c39fa4dcf86ffd6a3b) Thanks [@aulneau](https://github.com/aulneau)! - This update fixes some typing issues with some hooks, adds some user data to a useUser hook, and improves the api client atoms.

* [#7](https://github.com/fungible-systems/micro-stacks/pull/7) [`e6bc52e`](https://github.com/fungible-systems/micro-stacks/commit/e6bc52e51efafdff4abacedc8e1ef8673ddaeda6) Thanks [@aviculturist](https://github.com/aviculturist)! - This patch adds StacksMocknet to the React MicroStacksProvider which makes it easier to connect to a localnet environment using the global atom builder.

- [#18](https://github.com/fungible-systems/micro-stacks/pull/18) [`73b7c6b`](https://github.com/fungible-systems/micro-stacks/commit/73b7c6be28feef7ea550be798fbc86020db4d016) Thanks [@aulneau](https://github.com/aulneau)! - This update removes some vendored code and replaces it with various modules found in noble-hashes.
