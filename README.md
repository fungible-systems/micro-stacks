# micro-stacks

`micro-stacks` is an all-in-one TypeScript SDK for interacting with the Stacks ecosystem. With `micro-stacks` you can
build software that can: interact with Clarity, the smart contract langauge on Stacks, build apps that interact with
Stacks based wallets, construct transactions, post conditions, and more!

## Documentation

[Overview](https://micro-stacks.dev/docs/overview) · [Get Started](https://micro-stacks.dev/docs/getting-started)
· [Guides](https://micro-stacks.dev/guides/stacks-apps)
· [Core](https://micro-stacks.dev/reference/core)

## Features

- Core has only 2 dependencies (and those have 0)
- Modular: take what you need, leave what you don't
- ESM based, works with all modern bundlers
- Un-opinionated core
- Robust framework integrations
  - React
  - Svelte _(coming soon)_
  - Vue _(coming soon)_
  - React Jotai
- Built from the ground up to work with Wallet-based authentication
- Highly typed -- written in typescript
- Well tested
- Audited

## Monorepo overview

This project is a `pnpm` monorepo that uses Turbo.

### Apps

This is where non-library packages live, such as the docs that live at https://micro-stacks.dev

### Packages

All libraries are contained within the `packages` directory.

#### Core

This is the main `micro-stacks` library that contains all the lower level primitives for things like working with
Clarity or constructing transactions.

#### Client

This is another lower level package that any framework specific packages will implement. The client module handles
things like interacting with Stacks wallets, subscribing to state changes, etc.

#### React

This library is the official micro-stacks React bindings. If you're building a React app, you should be
using `@micro-stacks/react`.

##### Jotai

This library exposes all the functionality and same API as our other framework bindings, but as `atoms`.

#### Svelte

This library is the official micro-stacks Svelte bindings. If you're building a Svelte app, you should be
using `@micro-stacks/svelte`.

#### Vue

This library is the official micro-stacks Vue bindings. If you're building a Vue app, you should be
using `@micro-stacks/vue`.

#### Solid.js

This library is the official micro-stacks Solid.js bindings. If you're building a Solid.js app, you should be
using `@micro-stacks/solidjs`.

## Community

<p style="display: flex; align-items: center; justify-content: center; gap: 10px">
  <img alt="stars" src="https://badgen.net/github/stars/fungible-systems/micro-stacks" className="inline-block mr-2"/>
  <img alt="downloads" src="https://badgen.net/npm/dt/micro-stacks" className="inline-block mr-2"/>
  <img alt="license" src="https://badgen.net/npm/license/micro-stacks" className="inline-block mr-2"/>
</p>

`micro-stacks` is created and maintained by [Fungible Systems](https://fungible.systems), a web3-focused design and
engineering studio.

Follow [@FungibleSystems](https://twitter.com/FungibleSystems) on Twitter for updates and memes :~)
