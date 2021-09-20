# micro-stacks/react

This document outlines how to get started with micro-stacks in a react application.

## Installation

The react integration is highly opinionated, and as such, you'll need to install some extra dependencies to use this
module:

```shell
yarn add micro-stacks jotai jotai-query-toolkit react-query micro-memoize
```

## Integration

### Client side apps

If you are building a client side app, you'll need to wrap your application with the `MicroStacksProvider` component and
pass it some options:

```tsx
// app.tx

import { MicroStacksProvider } from "./react";

const authOptions = {
  appDetails: {
    name: 'my cool app',
    icon: '/some-logo.png'
  }
}

const network = 'testnet' // or mainnet, or new StacksNetwork()

const MyApp = () => (
  <MicroStacksProvider authOptions={authOptions} network={network}>
    {/* the rest of your app */}
    <Router />
  </MicroStacksProvider>
);
```

### Next.js apps

If you are not making use of `withInitialQueries`, you can use `MicroStacksProvider` as described above. However, if you
are making use of `jotai-query-toolkit` and `withInitialQueries`, you'll have to modify your application. Due to the
inability to nest Jotai `Providers`, micro-stacks exports a helper function, `appProviderAtomBuilder`.

Rather than using the `MicroStacksProvider` in `_app.tsx`, on each of your pages that makes use of `withInitialQueries`,
you should do this:

```tsx
import { appProviderAtomBuilder } from "./react";

const authOptions = {
  appDetails: {
    name: 'my cool app',
    icon: '/some-logo.png'
  }
}

const network = 'testnet' // or mainnet, or new StacksNetwork()

const atomBuilder = appProviderAtomBuilder({
  network,
  authOptions,
});

const queries: GetQueries<any> = () => [["some-key", () => "hello"]];

export default withInitialQueries(MyNextjsPageComponent, atomBuilder)(queries);
```

## Adding authentication

To add authentication via a wallet (currently only the Hiro Web Wallet is supported), you can use the hook `useAuth`. Here is an example wallet connect button.

```tsx
import { useAuth } from "micro-stacks/react";

export const WalletConnectButton = () => {
  const { isSignedIn, handleSignIn, handleSignOut, isLoading } = useAuth();
  return (
    <button onClick={isSignedIn ? handleSignOut : handleSignIn}>
      {isLoading
        ? "Loading..."
        : isSignedIn
        ? "Sign out"
        : "Connect Stacks Wallet"}
    </button>
  );
};
```
