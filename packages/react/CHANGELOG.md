# @micro-stacks/react

## 1.0.0-beta.0

### Major Changes

- This is the first major version release of the new micro-stacks client and react libraries!

### Patch Changes

- Updated dependencies []:
  - @micro-stacks/client@1.0.0-beta.0

## 0.2.1

### Patch Changes

- [#37](https://github.com/fungible-systems/micro-stacks-react/pull/37) [`aacacb0`](https://github.com/fungible-systems/micro-stacks-react/commit/aacacb0c034a404ace301f3c054b6a73df872050) Thanks [@aulneau](https://github.com/aulneau)! - This update implements signed messages now that the Hiro Web Wallet supports arbitrary message signing! Yay!

## 0.2.0

### Minor Changes

- [#35](https://github.com/fungible-systems/micro-stacks-react/pull/35) [`00e5f45`](https://github.com/fungible-systems/micro-stacks-react/commit/00e5f457c2abdccecdb2235dfa8fd0cdb8bbe6c7) Thanks [@aulneau](https://github.com/aulneau)! - This updates the micro-stacks version that is required for all packages, and improves the session cookie that is saved when a user signs in (persists the gaia bucket address).

## 0.1.2

### Patch Changes

- [#32](https://github.com/fungible-systems/micro-stacks-react/pull/32) [`e9e82de`](https://github.com/fungible-systems/micro-stacks-react/commit/e9e82de7848817bf2b53e3e24e6bc13c2879f6e6) Thanks [@aulneau](https://github.com/aulneau)! - This updates the build tooling around how we bundle our packages. this should improve tree shaking and bundle size of apps that use these libraries

## 0.1.1

### Patch Changes

- [#28](https://github.com/fungible-systems/micro-stacks-react/pull/28) [`069640e`](https://github.com/fungible-systems/micro-stacks-react/commit/069640e8114fa478c36942a3f1424fed21353edc) Thanks [@aulneau](https://github.com/aulneau)! - Update dependencies accross all packages.

## 0.1.0

### Minor Changes

- [#23](https://github.com/fungible-systems/micro-stacks-react/pull/23) [`ce11c60`](https://github.com/fungible-systems/micro-stacks-react/commit/ce11c60582b598436918ca28c66afb520c1db50b) Thanks [@aviculturist](https://github.com/aviculturist)! - Removes the Regtest network settings as this node has been permanently deprecated

### Patch Changes

- [#27](https://github.com/fungible-systems/micro-stacks-react/pull/27) [`66a1143`](https://github.com/fungible-systems/micro-stacks-react/commit/66a11435f29219b0048ed9734218ec2e54e9595f) Thanks [@aulneau](https://github.com/aulneau)! - This update expands the options available to be passed for a useContractCall's handleContractCall method.

## 0.0.8

### Patch Changes

- [#19](https://github.com/fungible-systems/micro-stacks-react/pull/19) [`24469a8`](https://github.com/fungible-systems/micro-stacks-react/commit/24469a8b7cb144ef60649fbcb31663728fd171c0) Thanks [@aulneau](https://github.com/aulneau)! - This update adds back in `MicroStacksProvider`.

## 0.0.7

### Patch Changes

- [#11](https://github.com/fungible-systems/micro-stacks-react/pull/11) [`6f73bf6`](https://github.com/fungible-systems/micro-stacks-react/commit/6f73bf6db66cdf58ff772747e0c5fa488bbb85f9) Thanks [@aulneau](https://github.com/aulneau)! - This update introduces three new hooks:

  - `useContractCall`
  - `useContractDeploy`
  - `useStxTransfer`

  Using these hooks instead of the previous `useTransactionPopup` makes for a better experience, as there is built-in loading state that can be shared between all instances of a given contract/hook combination.

* [#13](https://github.com/fungible-systems/micro-stacks-react/pull/13) [`1d07f46`](https://github.com/fungible-systems/micro-stacks-react/commit/1d07f46b918ee1511943d7657b5db0d5af8138cb) Thanks [@aulneau](https://github.com/aulneau)! - This update improves some internal workings around how things get persisted, and adds a feature around tab-syncing when certain actions take place, such as signing in or changing networks.

## 0.0.6

### Patch Changes

- [`cd36e4c`](https://github.com/fungible-systems/micro-stacks-react/commit/cd36e4c6f6e24119006d37986ee7e56d7f0e9896) Thanks [@aulneau](https://github.com/aulneau)! - Updates peer dep resolution for external deps.

## 0.0.5

### Patch Changes

- [#8](https://github.com/fungible-systems/micro-stacks-react/pull/8) [`48525fd`](https://github.com/fungible-systems/micro-stacks-react/commit/48525fd0edd7a43baf7df8524a9c1119a95ebd70) Thanks [@aulneau](https://github.com/aulneau)! - Fixes a conditional logic bug where session would not be returned correctly.

## 0.0.4

### Patch Changes

- [#5](https://github.com/fungible-systems/micro-stacks-react/pull/5) [`e88fd70`](https://github.com/fungible-systems/micro-stacks-react/commit/e88fd7089c33334e323054dc26a6429216ee72a0) Thanks [@aulneau](https://github.com/aulneau)! - Minor fix around deps for each package.

## 0.0.3

### Patch Changes

- [#3](https://github.com/fungible-systems/micro-stacks-react/pull/3) [`1dc8d71`](https://github.com/fungible-systems/micro-stacks-react/commit/1dc8d71ac4e7c04403bc918ccf72a2851440fb2d) Thanks [@aulneau](https://github.com/aulneau)! - Fixed a bug where handleSignIn required an empty object to be passed.

## 0.0.2

### Patch Changes

- [#1](https://github.com/fungible-systems/micro-stacks-react/pull/1) [`98e8a13`](https://github.com/fungible-systems/micro-stacks-react/commit/98e8a1397854767471334d20462c05640ce9ae69) Thanks [@aulneau](https://github.com/aulneau)! - Initial release.
