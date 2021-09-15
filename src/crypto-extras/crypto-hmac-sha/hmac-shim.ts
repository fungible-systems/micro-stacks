// Pure JS shim for perform hmac-sha2 operations for runtimes that don't support it (deno)

// Vendored from https://github.com/chiefbiiko/hmac

/** An interface representation of a hash algorithm implementation. */
export interface Hash {
  hashSize: number;
  init(): Hash;
  update(msg: Uint8Array): Hash;
  digest(): Uint8Array;
}

/** A class representation of the HMAC algorithm. */
export class Hmac {
  readonly hashSize: number;
  readonly B: number;
  readonly iPad: number;
  readonly oPad: number;

  private iKeyPad!: Uint8Array;
  private oKeyPad!: Uint8Array;
  private hasher: Hash;

  /** Creates a new HMAC instance. */
  constructor(hasher: Hash, key?: Uint8Array) {
    this.hashSize = hasher.hashSize;
    this.hasher = hasher;
    this.B = this.hashSize <= 32 ? 64 : 128; // according to RFC4868
    this.iPad = 0x36;
    this.oPad = 0x5c;

    if (key) {
      this.init(key);
    }
  }

  /** Initializes an HMAC instance. */
  init(key: Uint8Array): Hmac {
    if (!key) {
      key = new Uint8Array(0);
    }

    // process the key
    let _key: Uint8Array = new Uint8Array(key);

    if (_key.length > this.B) {
      // keys longer than blocksize are shortened
      this.hasher.init();
      _key = this.hasher.update(key).digest();
    }

    // zeropadr
    if (_key.byteLength < this.B) {
      const tmp: Uint8Array = new Uint8Array(this.B);
      tmp.set(_key, 0);
      _key = tmp;
    }

    // setup the key pads
    this.iKeyPad = new Uint8Array(this.B);
    this.oKeyPad = new Uint8Array(this.B);

    for (let i = 0; i < this.B; ++i) {
      this.iKeyPad[i] = this.iPad ^ _key[i];
      this.oKeyPad[i] = this.oPad ^ _key[i];
    }

    // blackout key
    _key.fill(0);

    // initial hash
    this.hasher.init();
    this.hasher.update(this.iKeyPad);

    return this;
  }

  /** Update the HMAC with additional message data. */
  update(msg: Uint8Array = new Uint8Array(0)): Hmac {
    this.hasher.update(msg);
    return this;
  }

  /** Finalize the HMAC with additional message data. */
  digest(): Uint8Array {
    const sum1: Uint8Array = this.hasher.digest(); // get sum 1
    this.hasher.init();
    return this.hasher.update(this.oKeyPad).update(sum1).digest();
  }
}
