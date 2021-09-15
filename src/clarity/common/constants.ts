export const MAX_STRING_LENGTH_BYTES = 128;
export const CLARITY_INT_SIZE = 128;
export const COINBASE_BUFFER_LENGTH_BYTES = 32;
export const RECOVERABLE_ECDSA_SIG_LENGTH_BYTES = 65;
export const COMPRESSED_PUBKEY_LENGTH_BYTES = 32;
export const UNCOMPRESSED_PUBKEY_LENGTH_BYTES = 64;
export const MEMO_MAX_LENGTH_BYTES = 34;
export enum PostConditionPrincipalID {
  Origin = 0x01,
  Standard = 0x02,
  Contract = 0x03,
}
/**
 * Type IDs corresponding to each of the Clarity value types as described here:
 * {@link https://github.com/blockstack/blockstack-core/blob/sip/sip-005/sip/sip-005-blocks-and-transactions.md#clarity-value-representation}
 */
export enum ClarityType {
  Int = 0x00,
  UInt = 0x01,
  Buffer = 0x02,
  BoolTrue = 0x03,
  BoolFalse = 0x04,
  PrincipalStandard = 0x05,
  PrincipalContract = 0x06,
  ResponseOk = 0x07,
  ResponseErr = 0x08,
  OptionalNone = 0x09,
  OptionalSome = 0x0a,
  List = 0x0b,
  Tuple = 0x0c,
  StringASCII = 0x0d,
  StringUTF8 = 0x0e,
}
