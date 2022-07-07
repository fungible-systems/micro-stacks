export interface Pbkdf2 {
  derive(
    password: string,
    salt: Uint8Array,
    iterations: number,
    keyLength: number,
    digest: Pbkdf2Digests
  ): Promise<Uint8Array>;
}

export type Pbkdf2Digests = 'sha512' | 'sha256';
