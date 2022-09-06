# @micro-stacks/client

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
