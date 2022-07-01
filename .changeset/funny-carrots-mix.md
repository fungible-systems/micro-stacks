---
"micro-stacks": minor
---

This update changes the required params for our functions to verify a signature and message. Previously, you would be able to pass a signature with no public key and it would verify correctly. However, this was incorrect. If you passed any arbitrary message with this signature, it will always return valid, and that is expected. The reason this is expected is because the public key is expected to be trusted. Often times you are recovering a public key from a signature because you only have access to a Stacks address, but not their public key. With this, I've made it such that you need to pass the expected Stacks address of the account that signed the message, OR the public key.
