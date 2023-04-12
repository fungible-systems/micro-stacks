# @micro-stacks/client

## 1.2.1

### Patch Changes

- Updated dependencies [[`dd4aad69`](https://github.com/fungible-systems/micro-stacks/commit/dd4aad69ce65b4db9d102b4b182bb46b99779bee)]:
  - micro-stacks@1.2.1

## 1.2.0

### Minor Changes

- [#175](https://github.com/fungible-systems/micro-stacks/pull/175) [`85526f19`](https://github.com/fungible-systems/micro-stacks/commit/85526f194de3c1ca88e0f1157e3157c27b713d64) Thanks [@aulneau](https://github.com/aulneau)! - Adds support for PSBT signing in wallets that support it.

- [#182](https://github.com/fungible-systems/micro-stacks/pull/182) [`501e8ccd`](https://github.com/fungible-systems/micro-stacks/commit/501e8ccd6eacb6291b2a599d1fa1e2178723a718) Thanks [@pradel](https://github.com/pradel)! - Export SignInWithStacksMessage class.

### Patch Changes

- [#181](https://github.com/fungible-systems/micro-stacks/pull/181) [`993bc132`](https://github.com/fungible-systems/micro-stacks/commit/993bc13204860aaea23af7681c32d7d99dd8ba86) Thanks [@pradel](https://github.com/pradel)! - Allow custom statement for getSignInMessage.

- [#184](https://github.com/fungible-systems/micro-stacks/pull/184) [`cb3f3087`](https://github.com/fungible-systems/micro-stacks/commit/cb3f3087260fa3d913a06043eed7042c82870e95) Thanks [@pradel](https://github.com/pradel)! - Fix default version in getSignInMessage.

- Updated dependencies [[`85526f19`](https://github.com/fungible-systems/micro-stacks/commit/85526f194de3c1ca88e0f1157e3157c27b713d64)]:
  - micro-stacks@1.2.0

## 1.1.3

### Patch Changes

- Updated dependencies [[`579aefe4`](https://github.com/fungible-systems/micro-stacks/commit/579aefe4d82c9e26b8d58e76c2d2948e36af58a6)]:
  - micro-stacks@1.1.5

## 1.1.2

### Patch Changes

- Updated dependencies [[`472bbd9c`](https://github.com/fungible-systems/micro-stacks/commit/472bbd9cb750c2adeadd3763725c346eaa435992)]:
  - micro-stacks@1.1.4

## 1.1.1

### Patch Changes

- Updated dependencies [[`339abb66`](https://github.com/fungible-systems/micro-stacks/commit/339abb6647e14ea6b004c458d0a7687709292d9d)]:
  - micro-stacks@1.1.3

## 1.1.0

### Minor Changes

- [#159](https://github.com/fungible-systems/micro-stacks/pull/159) [`22bd7401`](https://github.com/fungible-systems/micro-stacks/commit/22bd7401c3a2d038036b1f43782e202aa140708d) Thanks [@aulneau](https://github.com/aulneau)! - This updates the way in which the network is used in the `@micro-stacks/client` package. Previously, the `network` value in the config would only set the value as long as there was no current session in the users application data. This would lead to unexpected states when folks would try to change the network globally, but some users would have their old network state persisted.

  **Please note!!**

  If you want to allow your users to change their network in-app, you must pass `enableNetworkSwitching` to your client config for micro-stacks.

## 1.0.3

### Patch Changes

- Updated dependencies [[`f1296ab6`](https://github.com/fungible-systems/micro-stacks/commit/f1296ab6166f2bc6c35454520047163d28f6425b)]:
  - micro-stacks@1.1.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`2aef106a`](https://github.com/fungible-systems/micro-stacks/commit/2aef106a80a4476ccb4997f0199690a72732eeb1)]:
  - micro-stacks@1.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`2abc5dfc`](https://github.com/fungible-systems/micro-stacks/commit/2abc5dfc6a825e22cbacd9d27cac3eace8363456)]:
  - micro-stacks@1.1.0

## 1.0.0-beta.0

### Major Changes

- This is the first major version release of the new micro-stacks client and react libraries!
