import {
  bufferCV,
  ClarityValue,
  contractPrincipalCV,
  cvToString,
  deserializeCV,
  falseCV,
  IntCV,
  intCV,
  listCV,
  noneCV,
  responseErrorCV,
  responseOkCV,
  serializeCV,
  someCV,
  standardPrincipalCV,
  StringAsciiCV,
  stringAsciiCV,
  StringUtf8CV,
  stringUtf8CV,
  trueCV,
  TupleCV,
  tupleCV,
  UIntCV,
  uintCV,
} from 'micro-stacks/clarity';
import { compare, utf8ToBytes } from 'micro-stacks/common';

const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

function serializeDeserialize<T extends ClarityValue>(value: T): ClarityValue {
  return deserializeCV(serializeCV(value));
}

describe('Serialize Then Deserialize', () => {
  test('TrueCV', () => {
    const t = trueCV();
    const serializedDeserialized = serializeDeserialize(t);
    expect(serializedDeserialized).toEqual(t);
  });

  test('FalseCV', () => {
    const f = falseCV();
    const serializedDeserialized = serializeDeserialize(f);
    expect(serializedDeserialized).toEqual(f);
  });

  test('NoneCV', () => {
    const n = noneCV();
    const serializedDeserialized = serializeDeserialize(n);
    expect(serializedDeserialized).toEqual(n);
  });

  test('SomeCV', () => {
    const maybeTrue = someCV(trueCV());
    const serializedDeserialized = serializeDeserialize(maybeTrue);
    expect(serializedDeserialized).toEqual(maybeTrue);
  });

  test('BufferCV', () => {
    const buffer = utf8ToBytes('this is a test');
    const buf = bufferCV(buffer);
    const serializedDeserialized = serializeDeserialize(buf);
    expect(serializedDeserialized).toEqual(buf);
  });

  test('IntCV', () => {
    const int = intCV(10);
    const serializedDeserialized = serializeDeserialize(int) as IntCV;
    expect(cvToString(serializedDeserialized)).toEqual(cvToString(int));
  });

  test('UIntCV', () => {
    const uint = uintCV(10);
    const serializedDeserialized = serializeDeserialize(uint) as UIntCV;
    expect(cvToString(serializedDeserialized)).toEqual(cvToString(uint));
  });

  test('Standard Principal', () => {
    const standardPrincipal = standardPrincipalCV(ADDRESS);
    const serializedDeserialized = serializeDeserialize(standardPrincipal);
    expect(serializedDeserialized).toEqual(standardPrincipal);
  });

  test('Contract Principal', () => {
    const contractPrincipal = contractPrincipalCV(ADDRESS, 'test-contract');
    const serializedDeserialized = serializeDeserialize(contractPrincipal);
    expect(serializedDeserialized).toEqual(contractPrincipal);
  });

  test('Response Ok', () => {
    const responseOk = responseOkCV(trueCV());
    const serializedDeserialized = serializeDeserialize(responseOk);
    expect(serializedDeserialized).toEqual(responseOk);
  });

  test('Response Error', () => {
    const responseErr = responseErrorCV(trueCV());
    const serializedDeserialized = serializeDeserialize(responseErr);
    expect(serializedDeserialized).toEqual(responseErr);
  });

  test('ListCV', () => {
    const list = listCV([trueCV(), falseCV(), trueCV()]);
    const serializedDeserialized = serializeDeserialize(list);
    expect(serializedDeserialized).toEqual(list);
  });

  test('TupleCV', () => {
    const tuple = tupleCV({
      c: trueCV(),
      b: falseCV(),
      a: trueCV(),
    });
    const serializedDeserialized = serializeDeserialize(tuple) as TupleCV;
    expect(serializedDeserialized).toEqual(tuple);

    // Test lexicographic ordering of tuple keys
    const lexicographic = Object.keys(tuple.data).sort((a, b) => {
      const bufA = utf8ToBytes(a);
      const bufB = utf8ToBytes(b);
      return compare(bufA, bufB);
    });
    expect(Object.keys(serializedDeserialized.data)).toEqual(lexicographic);
  });

  test('StringAsciiCV', () => {
    const str = stringAsciiCV('hello world');
    const serializedDeserialized = serializeDeserialize(str) as StringAsciiCV;
    expect(serializedDeserialized).toEqual(str);
  });

  test('StringUtf8CV', () => {
    const str = stringUtf8CV('hello 🌾');
    const serializedDeserialized = serializeDeserialize(str) as StringUtf8CV;
    expect(serializedDeserialized).toEqual(str);
  });
});
