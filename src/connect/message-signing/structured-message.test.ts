import { makeClarityHash, makeDomainTuple, makeStructuredDataHash } from './structured-message';
import { stringAsciiCV } from 'micro-stacks/clarity';
import { bytesToHex } from '@noble/hashes/utils';
import { hexToBytes } from 'micro-stacks/common';
import { signWithKey } from 'micro-stacks/transactions';

const NAME = 'Test App';
const VERSION = '1.0.0';
const CHAIN_ID = 1;
const MESSAGE = 'Hello World';

const EXPECTED_STRUCTURED_MESSAGE_HASH =
  '1bfdab6d4158313ce34073fbb8d6b0fc32c154d439def12247a0f44bb2225259';

const EXPECTED_DOMAIN_HASH = '2538b5dc06c5ae2f11549261d7ae174d9f77a55a92b00f330884695497be5065';
const EXPECTED_MESSAGE_HASH = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
const EXPECTED_EMPTY_MESSAGE_HASH =
  '3c8f1b104592e3ebb2b2602b3979a27e77f586fb4c655369fa4eccb6d545a0f8';

const PRIVATE_KEY = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
const EXPECTED_SIGNATURE =
  '8b94e45701d857c9f1d1d70e8b2ca076045dae4920fb0160be0642a68cd78de072ab527b5c5277a593baeb2a8b657c216b99f7abb5d14af35b4bf12ba6460ba401';

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

describe('test cases from sip document', () => {
  it('correctly hashes clarity values', () => {
    const domain = makeClarityHash(makeDomainTuple(NAME, VERSION, CHAIN_ID));
    const message = makeClarityHash(stringAsciiCV(MESSAGE));
    const empty_message = makeClarityHash(stringAsciiCV(''));
    expect(bytesToHex(domain)).toEqual(EXPECTED_DOMAIN_HASH);
    expect(bytesToHex(empty_message)).toEqual(EXPECTED_EMPTY_MESSAGE_HASH);
    expect(bytesToHex(message)).toEqual(EXPECTED_MESSAGE_HASH);
  });

  it('correctly hashes with prefix', () => {
    const domain = makeClarityHash(makeDomainTuple(NAME, VERSION, CHAIN_ID));
    const message = makeClarityHash(stringAsciiCV(MESSAGE));
    const hashBytes = makeStructuredDataHash(domain, message);
    expect(bytesToHex(hashBytes)).toEqual(EXPECTED_STRUCTURED_MESSAGE_HASH);
  });

  it('signs and validates correctly', async () => {
    const domain = makeClarityHash(makeDomainTuple(NAME, VERSION, CHAIN_ID));
    const message = makeClarityHash(stringAsciiCV(MESSAGE));
    const hashBytes = makeStructuredDataHash(domain, message);

    const signature = await signWithKey(
      { data: hexToBytes(PRIVATE_KEY), compressed: true },
      bytesToHex(hashBytes)
    );

    expect(signatureVrsToRsv(signature.data)).toEqual(EXPECTED_SIGNATURE);
  });
});
