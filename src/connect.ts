export * from './connect/common/constants';
export * from './connect/common/provider';
export * from './connect/common/utils';
export * from './connect/tx/index';
export * from './connect/tx/types';
export * from './connect/authentication';

export * from './connect/auth/types';
export * from './connect/auth/decode-auth-response';
export * from './connect/popup';
export { genericTransactionPopupFactory } from './connect/popup-helper';

// sign messages
export {
  handleSignMessageRequest,
  generateSignMessagePayload,
} from './connect/message-signing/sign-message';
export {
  handleSignStructuredDataRequest,
  generateSignStructuredDataPayload,
} from './connect/message-signing/structured-message';
export { hashMessage, encodeMessage, decodeMessage } from './connect/message-signing/encoding';
export {
  verifyMessageSignature,
  recoverSignature,
  getPublicKeyFromSignature,
} from './connect/message-signing/verify';
export type {
  SignatureRequestOptions,
  StructuredSignatureRequestOptions,
  SignedOptionsWithOnHandlers,
} from './connect/message-signing/types';
