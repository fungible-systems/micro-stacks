import { oneLineTrim } from 'common-tags';
import {
  bufferCV,
  contractPrincipalCV,
  falseCV,
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

import { asciiToBytes, utf8ToBytes } from 'micro-stacks/common';
import { cvToJSON } from './cv-to-json';

const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

describe('Clarity value to JSON', () => {
  test('Complex Tuple', () => {
    const g = standardPrincipalCV(ADDRESS);
    const h = contractPrincipalCV(ADDRESS, 'test');
    const tuple = tupleCV({
      a: intCV(-1),
      b: uintCV(1),
      c: bufferCV(utf8ToBytes('test')),
      d: trueCV(),
      e: someCV(trueCV()),
      f: noneCV(),
      g,
      h,
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

    const json = cvToJSON(tuple);
    const tupleString = JSON.stringify(json);

    expect(tupleString).toEqual(
      oneLineTrim`
          {"type":"(tuple (a int) (b uint) (c (buff 4)) (d bool) (e (optional bool)) 
            (f (optional none)) (g principal) (h principal) (i (response bool UnknownType)) 
            (j (response UnknownType bool)) (k (list 2 bool)) (l (tuple (a bool) (b bool))) 
            (m (string-ascii 11)) (n (string-utf8 9)))",
            "value":{
              "a":{"type":"int","value":"-1"},
              "b":{"type":"uint","value":"1"},
              "c":{"type":"(buff 4)","value":"0x74657374"},
              "d":{"type":"bool","value":true},
              "e":{"type":"(optional bool)","value":{"type":"bool","value":true}},
              "f":{"type":"(optional none)","value":null},
              "g":{"type":"principal","value":"SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B"},
              "h":{"type":"principal","value":"SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B.test"},
              "i":{"type":"(response bool UnknownType)","value":{"type":"bool","value":true},"success":true},
              "j":{"type":"(response UnknownType bool)","value":{"type":"bool","value":false},"success":false},
              "k":{"type":"(list 2 bool)","value":[{"type":"bool","value":true},{"type":"bool","value":false}]},
              "l":{"type":"(tuple (a bool) (b bool))",
                "value":{"a":{"type":"bool","value":true},"b":{"type":"bool","value":false}}},
              "m":{"type":"(string-ascii 11)","value":"hello world"},
              "n":{"type":"(string-utf8 9)","value":"hello \u{1234}"}}
            }`
    );
  });

  test('Hex Buffer', () => {
    expect(JSON.stringify(cvToJSON(bufferCV(asciiToBytes('\n'))))).toEqual(
      oneLineTrim`
        {"type":"(buff 1)",
        "value":"0x0a"}
        `
    );
  });
});
