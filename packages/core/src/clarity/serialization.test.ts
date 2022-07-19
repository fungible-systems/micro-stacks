import { deserializeAddress } from './common/utils';
import {
  bufferCV,
  contractPrincipalCVFromStandard,
  falseCV,
  intCV,
  listCV,
  noneCV,
  responseErrorCV,
  responseOkCV,
  serializeCV,
  someCV,
  standardPrincipalCVFromAddress,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from 'micro-stacks/clarity';

import { BufferReader, bytesToHex, concatByteArrays } from 'micro-stacks/common';

describe('Serialization Test Vectors', () => {
  test('Int 1 Vector', () => {
    const int = intCV(1);
    const serialized = bytesToHex(serializeCV(int));
    expect(serialized).toEqual('0000000000000000000000000000000001');
  });

  test('Int -1 Vector', () => {
    const int = intCV(-1);
    const serialized = bytesToHex(serializeCV(int));
    expect(serialized).toEqual('00ffffffffffffffffffffffffffffffff');
  });

  test('UInt 1 Vector', () => {
    const uint = uintCV(1);
    const serialized = bytesToHex(serializeCV(uint));
    expect(serialized).toEqual('0100000000000000000000000000000001');
  });

  test('Buffer Vector', () => {
    const buffer = bufferCV(Uint8Array.from([0xde, 0xad, 0xbe, 0xef]));
    const serialized = bytesToHex(serializeCV(buffer));
    expect(serialized).toEqual('0200000004deadbeef');
  });

  test('True Vector', () => {
    const t = trueCV();
    const serialized = bytesToHex(serializeCV(t));
    expect(serialized).toEqual('03');
  });

  test('False Vector', () => {
    const f = falseCV();
    const serialized = bytesToHex(serializeCV(f));
    expect(serialized).toEqual('04');
  });

  test('Standard Principal Vector', () => {
    const addressBuffer = Uint8Array.from([
      0x11, 0xde, 0xad, 0xbe, 0xef, 0x11, 0xab, 0xab, 0xff, 0xff, 0x11, 0xde, 0xad, 0xbe, 0xef,
      0x11, 0xab, 0xab, 0xff, 0xff,
    ]);
    const bufferReader = new BufferReader(
      concatByteArrays([Uint8Array.from([0x00]), addressBuffer])
    );
    const standardPrincipal = standardPrincipalCVFromAddress(deserializeAddress(bufferReader));
    const serialized = bytesToHex(serializeCV(standardPrincipal));
    expect(serialized).toEqual('050011deadbeef11ababffff11deadbeef11ababffff');
  });

  test('Contract Principal Vector', () => {
    const addressBuffer = Uint8Array.from([
      0x11, 0xde, 0xad, 0xbe, 0xef, 0x11, 0xab, 0xab, 0xff, 0xff, 0x11, 0xde, 0xad, 0xbe, 0xef,
      0x11, 0xab, 0xab, 0xff, 0xff,
    ]);
    const contractName = 'abcd';
    const bufferReader = new BufferReader(
      concatByteArrays([Uint8Array.from([0x00]), addressBuffer])
    );
    const standardPrincipal = standardPrincipalCVFromAddress(deserializeAddress(bufferReader));
    const contractPrincipal = contractPrincipalCVFromStandard(standardPrincipal, contractName);
    const serialized = bytesToHex(serializeCV(contractPrincipal));
    expect(serialized).toEqual('060011deadbeef11ababffff11deadbeef11ababffff0461626364');
  });

  test('Response Ok Vector', () => {
    const ok = responseOkCV(intCV(-1));
    const serialized = bytesToHex(serializeCV(ok));
    expect(serialized).toEqual('0700ffffffffffffffffffffffffffffffff');
  });

  test('Response Err Vector', () => {
    const err = responseErrorCV(intCV(-1));
    const serialized = bytesToHex(serializeCV(err));
    expect(serialized).toEqual('0800ffffffffffffffffffffffffffffffff');
  });

  test('None Vector', () => {
    const none = noneCV();
    const serialized = bytesToHex(serializeCV(none));
    expect(serialized).toEqual('09');
  });

  test('Some Vector', () => {
    const some = someCV(intCV(-1));
    const serialized = bytesToHex(serializeCV(some));
    expect(serialized).toEqual('0a00ffffffffffffffffffffffffffffffff');
  });

  test('List Vector', () => {
    const list = listCV([intCV(1), intCV(2), intCV(3), intCV(-4)]);
    const serialized = bytesToHex(serializeCV(list));
    expect(serialized).toEqual(
      '0b0000000400000000000000000000000000000000010000000000000000000000000000000002000000000000000000000000000000000300fffffffffffffffffffffffffffffffc'
    );
  });

  test('Tuple Vector', () => {
    const tuple = tupleCV({
      baz: noneCV(),
      foobar: trueCV(),
    });
    const serialized = bytesToHex(serializeCV(tuple));
    expect(serialized).toEqual('0c000000020362617a0906666f6f62617203');
  });

  test('Ascii String Vector', () => {
    const str = stringAsciiCV('hello world');
    const serialized = bytesToHex(serializeCV(str));
    expect(serialized).toEqual('0d0000000b68656c6c6f20776f726c64');
  });

  test('Ascii String Escaped Length', () => {
    const strings = [
      stringAsciiCV('\\'),
      stringAsciiCV('"'),
      stringAsciiCV('\n'),
      stringAsciiCV('\t'),
      stringAsciiCV('\r'),
      stringAsciiCV('\0'),
    ];
    const serialized = strings.map(serializeCV);
    serialized.forEach(ser => {
      const reader = new BufferReader(ser);
      const serializedStringLenByte = reader.readBuffer(5)[4];
      expect(serializedStringLenByte).toEqual(1);
      expect(ser.length).toEqual(6);
    });
  });

  test('Utf8 String Vector', () => {
    const str = stringUtf8CV('hello world');
    const serialized = bytesToHex(serializeCV(str));
    expect(serialized).toEqual('0e0000000b68656c6c6f20776f726c64');
  });
});
