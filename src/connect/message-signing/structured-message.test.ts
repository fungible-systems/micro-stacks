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
  'c6ace1349f59b024dec0925df0a15baf8d27fc43a357ce61f48fdc8fa461e7b9';
const EXPECTED_DOMAIN_HASH = '2538b5dc06c5ae2f11549261d7ae174d9f77a55a92b00f330884695497be5065';
const EXPECTED_MESSAGE_HASH = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
const EXPECTED_EMPTY_MESSAGE_HASH =
  '3c8f1b104592e3ebb2b2602b3979a27e77f586fb4c655369fa4eccb6d545a0f8';

const PRIVATE_KEY = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
const EXPECTED_SIGNATURE =
  'fd1c62aae1b12c07571d6c7e379a20c3858005877306914da80ae6ee8c748a6d133fcd9169cac5684fe635a5a375960827bf2184849f6cde6ed828b370c72d1b00';

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
