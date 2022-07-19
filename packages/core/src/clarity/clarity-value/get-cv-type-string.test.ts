import { oneLineTrim } from 'common-tags';
import {
  bufferCV,
  contractPrincipalCV,
  falseCV,
  getCVTypeString,
  intCV,
  listCV,
  noneCV,
  responseErrorCV,
  responseOkCV,
  someCV,
  standardPrincipalCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from 'micro-stacks/clarity';
import { utf8ToBytes } from 'micro-stacks/common';

const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

describe('Clarity Types to String', () => {
  test('Complex Tuple', () => {
    const tuple = tupleCV({
      a: intCV(-1),
      b: uintCV(1),
      c: bufferCV(utf8ToBytes('test')),
      d: trueCV(),
      e: someCV(trueCV()),
      f: noneCV(),
      g: standardPrincipalCV(ADDRESS),
      h: contractPrincipalCV(ADDRESS, 'test'),
      i: responseOkCV(trueCV()),
      j: responseErrorCV(falseCV()),
      k: listCV([trueCV(), falseCV()]),
      l: tupleCV({
        a: trueCV(),
        b: falseCV(),
      }),
      m: stringAsciiCV('hello world'),
      n: stringUtf8CV('hello \u{1234}'),
      o: listCV([]),
    });

    const typeString = getCVTypeString(tuple);
    expect(typeString).toEqual(oneLineTrim`
      (tuple 
        (a int) 
        (b uint) 
        (c (buff 4)) 
        (d bool) 
        (e (optional bool)) 
        (f (optional none)) 
        (g principal) 
        (h principal) 
        (i (response bool UnknownType)) 
        (j (response UnknownType bool)) 
        (k (list 2 bool)) 
        (l (tuple (a bool) (b bool))) 
        (m (string-ascii 11)) 
        (n (string-utf8 9)) 
        (o (list 0 UnknownType)))
      `);
  });
});
