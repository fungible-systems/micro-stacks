export enum MicroStacksErrors {
  AppDetailsNotDefined = 'App details are not defined for you app. Most functionality (authentication, signing requests) require details be passed to the wallet. Add them to your MicroStacksClient config.',
  StacksProviderNotFund = 'The injected `StacksProvider` cannot be found. This is typically because there is no Stacks wallet available, such as the Hiro web wallet extension or the iOS/Android wallet Xverse.',
  StxAddressNotAvailable = 'No current Stacks address can be found. This could be because a session has been invalidated, or the user is not signed in.',
  NoSession = 'There is not current user session available. Please make sure the user has signed in before attempting this action.',
  NoMessagePassedToSignMessage = 'No message found -- a message is required when requesting a message signature.',
  JWTCouldNotBeMade = 'Transaction JWT could not be created',
  NoAppPrivateKey = 'The current user session has no `appPrivateKey` defined. Certain actions require an `appPrivateKey`, such as using gaia or encryption.',
}
