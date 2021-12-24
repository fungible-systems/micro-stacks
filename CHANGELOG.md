# micro-stacks

## 0.1.17

### Patch Changes

- [#72](https://github.com/fungible-systems/micro-stacks/pull/72) [`65a04522`](https://github.com/fungible-systems/micro-stacks/commit/65a045225995301ce2c3e7443defb1a8613d676a) Thanks [@aulneau](https://github.com/aulneau)! - Fixes the top level import for @noble/hashes, bumps versions

## 0.1.16

### Patch Changes

- [#71](https://github.com/fungible-systems/micro-stacks/pull/71) [`496b9074`](https://github.com/fungible-systems/micro-stacks/commit/496b90747dccf2bc0b0bbe2e44b4101603a364b4) Thanks [@aulneau](https://github.com/aulneau)! - This removes a hidden usage of Buffer, and reverts the build changes"

* [#66](https://github.com/fungible-systems/micro-stacks/pull/66) [`a6d30cb6`](https://github.com/fungible-systems/micro-stacks/commit/a6d30cb609687d18ef82435e58916f1123797c1e) Thanks [@aviculturist](https://github.com/aviculturist)! - Adds a number of missing accounts api fetchers and tests for: fetchAccountTransactionWithTransfers, fetchAccountNonces, fetchAccountAssets, fetchAccountStxInbound, fetchAccountNftEvents, fetchAccountInfo

## 0.1.15

### Patch Changes

- [#68](https://github.com/fungible-systems/micro-stacks/pull/68) [`1744101b`](https://github.com/fungible-systems/micro-stacks/commit/1744101bb5bb2041023a2e519d150237d55335f2) Thanks [@aulneau](https://github.com/aulneau)! - This fixes a small enum export issue related to building external libs.

## 0.1.13

### Patch Changes

- [#64](https://github.com/fungible-systems/micro-stacks/pull/64) [`caa64be`](https://github.com/fungible-systems/micro-stacks/commit/caa64be5458fcf924b0da772b983577a11fe6994) Thanks [@aulneau](https://github.com/aulneau)! - Passes strictJsonCompat to all recursive calls.

## 0.1.12

### Patch Changes

- [#62](https://github.com/fungible-systems/micro-stacks/pull/62) [`d60c6d1`](https://github.com/fungible-systems/micro-stacks/commit/d60c6d1e066eb48c988877e67daa4ffb2090f1ab) Thanks [@aulneau](https://github.com/aulneau)! - This adds the ability to pass strictJsonCompat to `fetchReadOnlyFunction` to the underlying cvToTrueValue helper.

## 0.1.11

### Patch Changes

- [#60](https://github.com/fungible-systems/micro-stacks/pull/60) [`6e84dff`](https://github.com/fungible-systems/micro-stacks/commit/6e84dff4108dc303c9da7891e3f4b4eb7636385b) Thanks [@aulneau](https://github.com/aulneau)! - This update removes the duplicate callReadOnlyFunction methods and adds a new fetchReadOnlyFunction which handles parsing the clarity values for you automatically.

## 0.1.10

### Patch Changes

- [#57](https://github.com/fungible-systems/micro-stacks/pull/57) [`9ffa8b5`](https://github.com/fungible-systems/micro-stacks/commit/9ffa8b5662abe7261ee7d7b9c68d728643bcd4da) Thanks [@aulneau](https://github.com/aulneau)! - Fixes import paths for `@noble/hashes` package

* [#56](https://github.com/fungible-systems/micro-stacks/pull/56) [`09874e3`](https://github.com/fungible-systems/micro-stacks/commit/09874e3a26f6beff3062a2d2408823d7bba81c16) Thanks [@aviculturist](https://github.com/aviculturist)! - This update adds support for the 'unanchored' param to accounts fetchers, and fixes the see docs links to point to the new micro-stacks docs site https://docs.micro-stacks.dev

## 0.1.9

### Patch Changes

- [#54](https://github.com/fungible-systems/micro-stacks/pull/54) [`b062e33`](https://github.com/fungible-systems/micro-stacks/commit/b062e3308884353f1bd5894eb693387804835d8d) Thanks [@aulneau](https://github.com/aulneau)! - Updates `@noble` deps again :)

## 0.1.8

### Patch Changes

- [#52](https://github.com/fungible-systems/micro-stacks/pull/52) [`0bbb167`](https://github.com/fungible-systems/micro-stacks/commit/0bbb1673bea3c06d8d3b9657de75c214c5beea72) Thanks [@aulneau](https://github.com/aulneau)! - Updates the @noble/hashes dep to its latest version (fixes some ESM compat issues)

## 0.1.7

### Patch Changes

- [#50](https://github.com/fungible-systems/micro-stacks/pull/50) [`ee6ecb9`](https://github.com/fungible-systems/micro-stacks/commit/ee6ecb94aee7ac27f7204ba9142d2ee0f2aef4e9) Thanks [@aulneau](https://github.com/aulneau)! - This removes an accidental inclusion of a dependency that is not needed.

## 0.1.6

### Patch Changes

- [#48](https://github.com/fungible-systems/micro-stacks/pull/48) [`dad0118`](https://github.com/fungible-systems/micro-stacks/commit/dad0118e07261f6c97ba9bf8b43ba6f523cc5112) Thanks [@aulneau](https://github.com/aulneau)! - This update adds a couple helper functions to `micro-stacks/clarity`: `hexToValue` and `hexToCvValue`.

* [#48](https://github.com/fungible-systems/micro-stacks/pull/48) [`866fbfc`](https://github.com/fungible-systems/micro-stacks/commit/866fbfc0e276b071293547616c2a40c57366b9aa) Thanks [@aulneau](https://github.com/aulneau)! - This updates the math used for some default clarity value limits related to ints, this should fix any BigInt bugs that users might have when using micro-stacks/clarity. Additionally, the code for the micro-stacks/transactions lib has been cleaned up and better organized.

## 0.1.5

### Patch Changes

- [#46](https://github.com/fungible-systems/micro-stacks/pull/46) [`57f27bc`](https://github.com/fungible-systems/micro-stacks/commit/57f27bcfcb05490877c37daaa0aeb0def63fa3a9) Thanks [@aulneau](https://github.com/aulneau)! - This updates our two dependencies on the noble packages to use the new `@noble` namespace versions.

## 0.1.4

### Patch Changes

- [#44](https://github.com/fungible-systems/micro-stacks/pull/44) [`843f48b`](https://github.com/fungible-systems/micro-stacks/commit/843f48b552d366518996a3dd7c15316ec8f2f539) Thanks [@aulneau](https://github.com/aulneau)! - This update makes two quality of life improvements to some of our clarity helper functions: `contractPrincipalCV` and the new `boolCV`.

  With `contractPrincipalCV`, you can now pass only a `contract_id` (CONTRACT_ADDRESS.CONTRACT_NAME) and it will parse it automatically for you.

  With the new `boolCV`, you can now pass a boolean value to it, and it will return the correct boolean clarity value. Previously we only had access to either a `trueCV` or `falseCV`.

## 0.1.3

### Patch Changes

- [#42](https://github.com/fungible-systems/micro-stacks/pull/42) [`6e67723`](https://github.com/fungible-systems/micro-stacks/commit/6e67723342a7119d482320a8fa36d4436cff7b46) Thanks [@aviculturist](https://github.com/aviculturist)! - Removes the Regtest network settings as this node has been permanently deprecated

* [`36a48de`](https://github.com/fungible-systems/micro-stacks/commit/36a48de1743d534af5c9d0bf1cf10ce92a4041ec) Thanks [@aulneau](https://github.com/aulneau)! - Exports `cvToTrueValue`.

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
