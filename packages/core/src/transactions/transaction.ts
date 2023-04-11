import {
  BufferArray,
  BufferReader,
  bytesToHex,
  hexToBytes,
  writeUInt32BE,
  IntegerType,
  intToBigInt,
  cloneDeep,
  SerializationError,
  SigningError,
  ChainID,
  DEFAULT_CHAIN_ID,
  TransactionVersion,
} from 'micro-stacks/common';

import { AnchorMode, AuthType, PostConditionMode, PubKeyEncoding } from './common/constants';

import {
  Authorization,
  createMessageSignature,
  createTransactionAuthField,
  intoInitialSighashAuth,
  isSingleSig,
  nextSignature,
  setFee,
  setNonce,
  setSponsorNonce,
  setSponsor,
  SingleSigSpendingCondition,
  SpendingConditionOpts,
  verifyOrigin,
  serializeAuthorization,
  deserializeAuthorization,
} from './authorization';

import { txidFromData } from './common/utils';

import {
  deserializePayload,
  Payload,
  PayloadInput,
  PayloadType,
  serializePayload,
} from './payload';

import { createLPList, deserializeLPList, LengthPrefixedList, serializeLPList } from './types';

import { isCompressed, isPrivateKeyCompressed, StacksPrivateKey, StacksPublicKey } from './keys';
import { StacksMessageType } from 'micro-stacks/clarity';

export class StacksTransaction {
  version: TransactionVersion;
  chainId: ChainID;
  auth: Authorization;
  anchorMode: AnchorMode;
  payload: Payload;
  postConditionMode: PostConditionMode;
  postConditions: LengthPrefixedList;

  constructor(
    version: TransactionVersion,
    auth: Authorization,
    payload: PayloadInput,
    postConditions?: LengthPrefixedList,
    postConditionMode?: PostConditionMode,
    anchorMode?: AnchorMode,
    chainId?: ChainID
  ) {
    this.version = version;
    this.auth = auth;
    if ('amount' in payload) {
      this.payload = {
        ...payload,
        amount: intToBigInt(payload.amount, false),
      };
    } else {
      this.payload = payload;
    }
    this.chainId = chainId ?? DEFAULT_CHAIN_ID;
    this.postConditionMode = postConditionMode ?? PostConditionMode.Deny;
    this.postConditions = postConditions ?? createLPList([]);

    if (anchorMode) {
      this.anchorMode = anchorMode;
    } else {
      switch (payload.payloadType) {
        case PayloadType.Coinbase:
        case PayloadType.PoisonMicroblock: {
          this.anchorMode = AnchorMode.OnChainOnly;
          break;
        }
        case PayloadType.ContractCall:
        case PayloadType.SmartContract:
        case PayloadType.VersionedSmartContract:
        case PayloadType.TokenTransfer: {
          this.anchorMode = AnchorMode.Any;
          break;
        }
      }
    }
  }

  signBegin() {
    const tx = cloneDeep(this);
    tx.auth = intoInitialSighashAuth(tx.auth);
    return tx.txid();
  }

  verifyBegin() {
    const tx = cloneDeep(this);
    tx.auth = intoInitialSighashAuth(tx.auth);
    return tx.txid();
  }

  createTxWithSignature(signature: string | Uint8Array): StacksTransaction {
    const parsedSig = typeof signature === 'string' ? signature : bytesToHex(signature);
    const tx = cloneDeep<StacksTransaction>(this);
    if (!tx.auth.spendingCondition) {
      throw new Error('Cannot set signature on transaction without spending condition');
    }
    (tx.auth.spendingCondition as SingleSigSpendingCondition).signature =
      createMessageSignature(parsedSig);
    return tx;
  }

  verifyOrigin(): string {
    return verifyOrigin(this.auth, this.verifyBegin());
  }

  async signNextOrigin(sigHash: string, privateKey: StacksPrivateKey): Promise<string> {
    if (this.auth.spendingCondition === undefined) {
      throw new Error('"auth.spendingCondition" is undefined');
    }
    if (this.auth.authType === undefined) {
      throw new Error('"auth.authType" is undefined');
    }
    return this.signAndAppend(this.auth.spendingCondition, sigHash, AuthType.Standard, privateKey);
  }

  async signNextSponsor(sigHash: string, privateKey: StacksPrivateKey): Promise<string> {
    if (this.auth.authType === AuthType.Sponsored) {
      const sig = await this.signAndAppend(
        this.auth.sponsorSpendingCondition,
        sigHash,
        AuthType.Sponsored,
        privateKey
      );
      return sig;
    } else {
      throw new Error('"auth.sponsorSpendingCondition" is undefined');
    }
  }

  appendPubkey(publicKey: StacksPublicKey) {
    const cond = this.auth.spendingCondition;
    if (cond && !isSingleSig(cond)) {
      const compressed = isCompressed(publicKey);
      cond.fields.push(
        createTransactionAuthField(
          compressed ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed,
          publicKey
        )
      );
    } else {
      throw new Error(`Can't append public key to a singlesig condition`);
    }
  }

  async signAndAppend(
    condition: SpendingConditionOpts,
    curSigHash: string,
    authType: AuthType,
    privateKey: StacksPrivateKey
  ): Promise<string> {
    const { nextSig, nextSigHash } = await nextSignature(
      curSigHash,
      authType,
      condition.fee,
      condition.nonce,
      privateKey
    );
    if (isSingleSig(condition)) {
      condition.signature = nextSig;
    } else {
      const compressed = privateKey.compressed || isPrivateKeyCompressed(privateKey.data);
      condition.fields.push(
        createTransactionAuthField(
          compressed ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed,
          nextSig
        )
      );
    }

    return nextSigHash;
  }

  txid(): string {
    const serialized = this.serialize();
    return txidFromData(serialized);
  }

  setSponsor(sponsorSpendingCondition: SpendingConditionOpts) {
    if (this.auth.authType != AuthType.Sponsored) {
      throw new SigningError('Cannot sponsor sign a non-sponsored transaction');
    }

    this.auth = setSponsor(this.auth, sponsorSpendingCondition);
  }

  /**
   * Set the total fee to be paid for this transaction
   *
   * @param fee - the fee amount in microstacks
   */
  setFee(amount: IntegerType) {
    this.auth = setFee(this.auth, amount);
  }

  /**
   * Set the transaction nonce
   *
   * @param nonce - the nonce value
   */
  setNonce(nonce: IntegerType) {
    this.auth = setNonce(this.auth, nonce);
  }

  /**
   * Set the transaction sponsor nonce
   *
   * @param nonce - the sponsor nonce value
   */
  setSponsorNonce(nonce: IntegerType) {
    if (this.auth.authType != AuthType.Sponsored) {
      throw new SigningError('Cannot sponsor sign a non-sponsored transaction');
    }

    this.auth = setSponsorNonce(this.auth, nonce);
  }

  serialize(): Uint8Array {
    if (this.version === undefined) {
      throw new SerializationError('"version" is undefined');
    }
    if (this.chainId === undefined) {
      throw new SerializationError('"chainId" is undefined');
    }
    if (this.auth === undefined) {
      throw new SerializationError('"auth" is undefined');
    }
    if (this.anchorMode === undefined) {
      throw new SerializationError('"anchorMode" is undefined');
    }
    if (this.payload === undefined) {
      throw new SerializationError('"payload" is undefined');
    }

    const bufferArray: BufferArray = new BufferArray();

    bufferArray.appendByte(this.version);
    const chainIdBuffer = new Uint8Array(4);
    writeUInt32BE(chainIdBuffer, this.chainId, 0);
    bufferArray.push(chainIdBuffer);
    bufferArray.push(serializeAuthorization(this.auth));
    bufferArray.appendByte(this.anchorMode);
    bufferArray.appendByte(this.postConditionMode);
    bufferArray.push(serializeLPList(this.postConditions));
    bufferArray.push(serializePayload(this.payload));

    return bufferArray.concatBuffer();
  }
}

/**
 * @param data Buffer or hex string
 */
export function deserializeTransaction(data: BufferReader | Uint8Array | string) {
  let bufferReader: BufferReader;
  if (typeof data === 'string') {
    if (data.slice(0, 2).toLowerCase() === '0x') {
      bufferReader = new BufferReader(hexToBytes(data.slice(2)));
    } else {
      bufferReader = new BufferReader(hexToBytes(data));
    }
  } else if (data instanceof Uint8Array) {
    bufferReader = new BufferReader(data);
  } else {
    bufferReader = data;
  }
  const version = bufferReader.readUInt8Enum(TransactionVersion, n => {
    throw new Error(`Could not parse ${n} as TransactionVersion`);
  });
  const chainId = bufferReader.readUInt32BE();
  const auth = deserializeAuthorization(bufferReader);

  const anchorMode = bufferReader.readUInt8Enum(AnchorMode, n => {
    throw new Error(`Could not parse ${n} as AnchorMode`);
  });
  const postConditionMode = bufferReader.readUInt8Enum(PostConditionMode, n => {
    throw new Error(`Could not parse ${n} as PostConditionMode`);
  });
  const postConditions = deserializeLPList(bufferReader, StacksMessageType.PostCondition);
  const payload = deserializePayload(bufferReader);

  return new StacksTransaction(
    version,
    auth,
    payload,
    postConditions,
    postConditionMode,
    anchorMode,
    chainId
  );
}
