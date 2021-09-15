import { getPublicKey } from 'noble-secp256k1';
import {
  BufferReader,
  concatByteArrays,
  copy,
  decodeB58,
  encodeB58,
  readUInt32BE,
  readUInt8,
  utf8ToBytes,
} from 'micro-stacks/common';
import { hmacSha512 } from 'micro-stacks/crypto-hmac-sha';

import {
  derivePrivateKey,
  derivePublicKey,
  hash160,
  makeChecksum,
  validateBIP32Path,
  validateChecksum,
  validateUInt31,
  validateUint32,
} from './utils';
import { BITCOIN, EMPTY_BUFFER, HARDENED_INDEX_BASE } from './constants';

export class HDKeychain {
  privateKey: Uint8Array = EMPTY_BUFFER;
  publicKey: Uint8Array = EMPTY_BUFFER;
  chainCode: Uint8Array = EMPTY_BUFFER;
  index = 0x00000000;
  depth = 0x00000000;
  identifier: Uint8Array = EMPTY_BUFFER;
  fingerprint = 0x00000000;
  parentFingerprint = 0x00000000;
  network = BITCOIN;

  public static fromBase58 = (base58EncodedString: string, network = BITCOIN) => {
    const buffer = validateChecksum(decodeB58(base58EncodedString));
    if (buffer.length !== 78) throw new TypeError('Invalid buffer length');

    // 4 bytes: version bytes
    const version = readUInt32BE(buffer, 0);
    if (version !== network.bip32.private && version !== network.bip32.public)
      throw new TypeError('Invalid network version');

    // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
    const depth = buffer[4];

    // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
    const parentFingerprint = readUInt32BE(buffer, 5);
    if (depth === 0) {
      if (parentFingerprint !== 0x00000000) throw new TypeError('Invalid parent fingerprint');
    }

    // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
    // This is encoded in MSB order. (0x00000000 if master key)
    const index = readUInt32BE(buffer, 9);
    if (depth === 0 && index !== 0) throw new TypeError('Invalid index');

    // 32 bytes: the chain code
    const chainCode = buffer.slice(13, 45);

    // 33 bytes: private key data (0x00 + k)
    if (version === network.bip32.private) {
      if (readUInt8(buffer, 45) !== 0x00) throw new TypeError('Invalid private key');
      const privateKey = buffer.slice(46, 78);
      const keychain = HDKeychain.fromPrivateKey(privateKey, chainCode);
      keychain.network = network;
      keychain.depth = depth;
      keychain.index = index;
      keychain.parentFingerprint = parentFingerprint;

      return keychain;
    } else {
      // 33 bytes: public key data (0x02 + X or 0x03 + X)
      const publicKey = buffer.slice(45, 78);
      const keychain = HDKeychain.fromPublicKey(publicKey, chainCode);
      keychain.network = network;
      keychain.depth = depth;
      keychain.index = index;
      keychain.parentFingerprint = parentFingerprint;

      return keychain;
    }
  };
  public static fromSeed = async (seed: Uint8Array) => {
    if (seed.length < 16) throw new TypeError('Seed should be at least 128 bits');
    if (seed.length > 64) throw new TypeError('Seed should be at most 512 bits');

    const I = await hmacSha512(utf8ToBytes('Bitcoin seed'), seed);
    const IL = I.slice(0, 32);
    const IR = I.slice(32);

    const keychain = new HDKeychain(IL, IR);
    keychain.calculateFingerprint();
    return keychain;
  };
  public static fromPrivateKey = (privateKey: Uint8Array, chainCode: Uint8Array): HDKeychain => {
    const keychain = new HDKeychain(privateKey, chainCode);
    keychain.calculateFingerprint();
    return keychain;
  };
  public static fromPublicKey = (
    publicKey: Uint8Array,
    chainCode: Uint8Array,
    path?: string
  ): HDKeychain => {
    const keychain = new HDKeychain(EMPTY_BUFFER, chainCode);
    keychain.publicKey = publicKey;
    keychain.calculateFingerprint();

    if (path) {
      const pathComponents = path.split('/');
      keychain.depth = pathComponents.length - 1;
      keychain.index = parseInt(pathComponents[pathComponents.length - 1], 10);
    }

    return keychain;
  };

  constructor(privateKey: Uint8Array, chainCode: Uint8Array) {
    this.privateKey = privateKey;
    this.chainCode = chainCode;
    if (!this.isNeutered()) this.publicKey = getPublicKey(this.privateKey, true);
  }

  public isNeutered = () => this.privateKey === EMPTY_BUFFER;

  public calculateFingerprint = () => {
    const reader = new BufferReader(hash160(this.publicKey).slice(0, 4));
    this.fingerprint = reader.readUInt32BE(0);
  };

  public deriveChild = async (index = 0, isHardened = index >= HARDENED_INDEX_BASE || false) => {
    if (typeof index !== 'number' || !validateUint32(index))
      throw new TypeError('Incorrect index passed to deriveChild, expected Uint32');

    if (isHardened && !validateUInt31(index))
      throw new TypeError(
        'Incorrect index passed to deriveChild, expected Uint31 for hardened child'
      );

    const indexBuffer = new ArrayBuffer(4);
    const idxDv = new DataView(indexBuffer);
    index = isHardened ? Number(BigInt(index) + HARDENED_INDEX_BASE) : index;
    idxDv.setUint32(0, index);

    const data = isHardened
      ? // data = 0x00 || ser256(kpar) || ser32(index)
        new Uint8Array([0, ...this.privateKey, ...new Uint8Array(indexBuffer)])
      : // data = serP(point(kpar)) || ser32(index)
        //      = serP(Kpar) || ser32(index)
        new Uint8Array([...this.publicKey, ...new Uint8Array(indexBuffer)]);

    const I = await hmacSha512(this.chainCode, data);
    // factor
    const IL = I.slice(0, 32);
    // chain code
    const IR = I.slice(32);

    let child;
    if (this.isNeutered()) {
      if (isHardened) throw new TypeError('Missing private key for hardened child key');

      child = HDKeychain.fromPublicKey(derivePublicKey(this.publicKey, IL), IR);
    } else {
      child = HDKeychain.fromPrivateKey(derivePrivateKey(this.privateKey, IL), IR);
    }

    child.index = index;
    child.depth = this.depth + 1;
    child.parentFingerprint = this.fingerprint;
    return child;
  };

  public deriveFromPath = async (path: string) => {
    if (!path || !validateBIP32Path(path)) throw TypeError(`Expected BIP32 path, got ${path}`);

    const master = [`m`, `/`, ``];
    if (master.includes(path)) return this;

    let derived: HDKeychain | null = null;
    let entries = path.split('/');
    if (entries[0] === `m`) {
      if (this.parentFingerprint) throw new TypeError('Expected master, got child');
      entries = entries.slice(1);
    }

    for (const c of entries) {
      const isHardened = c.endsWith(`'`);
      const index = parseInt(c, 10);
      derived = await (derived || this).deriveChild(index, isHardened);
    }
    return derived as HDKeychain;
  };

  toBase58 = (): string => {
    const network = this.network;
    const version = !this.isNeutered() ? network.bip32.private : network.bip32.public;
    const buffer = new Uint8Array(78);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // 4 bytes: version bytes
    view.setUint32(0, version);

    // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ....
    view.setUint8(4, this.depth);

    // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
    view.setUint32(5, this.parentFingerprint);

    // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
    // This is encoded in big endian. (0x00000000 if master key)
    view.setUint32(9, this.index);

    // 32 bytes: the chain code
    copy(this.chainCode, buffer, 13);

    // 33 bytes: the public key or private key data
    if (!this.isNeutered()) {
      if (!this.privateKey) throw new TypeError('Missing private key');

      // 0x00 + k for private keys
      view.setUint8(45, 0x00);
      copy(this.privateKey, buffer, 46);

      // 33 bytes: the public key
    } else {
      // X9.62 encoding for public keys
      copy(this.publicKey, buffer, 45);
    }
    const checksum = makeChecksum(buffer);
    return encodeB58(concatByteArrays([buffer, checksum]));
  };
}
