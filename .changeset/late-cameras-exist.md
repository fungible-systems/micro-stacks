---
'@micro-stacks/client': minor
---

This updates the way in which the network is used in the `@micro-stacks/client` package. Previously, the `network` value in the config would only set the value as long as there was no current session in the users application data. This would lead to unexpected states when folks would try to change the network globally, but some users would have their old network state persisted.

**Please note!!**

If you want to allow your users to change their network in-app, you must pass `enableNetworkSwitching` to your client config for micro-stacks.
