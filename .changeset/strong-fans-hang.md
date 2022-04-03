---
"micro-stacks": minor
---

This update removes in the internal libraries bip32 and bip39 with https://github.com/paulmillr/scure-bip32 and https://github.com/paulmillr/scure-bip39. These packages have been adutied and are very small in size. They are now listed as peer deps, so if you want to make use of the `micro-stacks/wallet-sdk` module, you'll need to install these dependencies.

Additionally, this update adds a lot of addition wallet related functionality.
