import { oneLineTrim } from 'common-tags';
import {
  trueCV,
  falseCV,
  noneCV,
  someCV,
  bufferCV,
  intCV,
  uintCV,
  standardPrincipalCV,
  contractPrincipalCV,
  responseOkCV,
  responseErrorCV,
  listCV,
  tupleCV,
  stringAsciiCV,
  stringUtf8CV,
} from 'micro-stacks/clarity';

import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import { cvToString } from './cv-to-string';

const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

describe('Clarity Value To Clarity String Literal', () => {
  test('Complex Tuple', async () => {
    const tuple = tupleCV({
      a: intCV(-1),
      b: uintCV(1),
      c: bufferCV(Buffer.from('test')),
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
    });

    const tupleString = await cvToString(tuple);

    expect(tupleString).toEqual(
      oneLineTrim`
        (tuple 
          (a -1) 
          (b u1) 
          (c 0x74657374) 
          (d true) 
          (e (some true)) 
          (f none) 
          (g SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B) 
          (h SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.test) 
          (i (ok true)) 
          (j (err false)) 
          (k (list true false)) 
          (l (tuple (a true) (b false))) 
          (m "hello world") 
          (n u"hello \u{1234}"))`
    );
  });

  test('Hex Buffers', async () => {
    expect(await cvToString(bufferCV(asciiToBytes('\n')))).toEqual('0x0a');
    expect(await cvToString(bufferCV(hexToBytes('00')))).toEqual('0x00');
    expect(await cvToString(bufferCV(Uint8Array.from([127])))).toEqual('0x7f');
  });
});
