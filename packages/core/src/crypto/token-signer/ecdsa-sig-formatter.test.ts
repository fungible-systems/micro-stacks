import { derToJoseES256, joseToDerES256 } from './ecdsa-sig-formatter';

const CLASS_UNIVERSAL = 0,
  PRIMITIVE_BIT = 0x20,
  TAG_SEQ = 0x10 | PRIMITIVE_BIT | (CLASS_UNIVERSAL << 6),
  TAG_INT = 0x02 | (CLASS_UNIVERSAL << 6);

function getParamSize(keySize: number) {
  return ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
}

type Keys = 'ES256' | 'ES384' | 'ES512';

const paramBytesForAlg: Record<Keys, number> = {
  ES256: getParamSize(256),
  ES384: getParamSize(384),
  ES512: getParamSize(521),
};

function getParamBytesForAlg(alg: Keys) {
  const paramBytes = paramBytesForAlg[alg];
  if (paramBytes) return paramBytes;
  throw new Error('Unknown algorithm "' + alg + '"');
}

const alg = 'ES256';

describe(derToJoseES256.name, function () {
  describe('should throw for', function () {
    it('no signature', function () {
      function fn() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return derToJoseES256();
      }

      expect(fn).toThrow(TypeError);
    });

    it('no seq', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ + 1; // not seq

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/expected "seq"/);
    });

    it('seq length exceeding input', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 10;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/length/);
    });

    it('r is not marked as int', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 8;
      input[2] = TAG_INT + 1; // not int

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/expected "int".+"r"/);
    });

    it('r length exceeds available input', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 8;
      input[2] = TAG_INT;
      input[3] = 5;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/"r".+length/);
    });

    it('r length exceeds sensical param length', function () {
      const input = Buffer.alloc(getParamBytesForAlg(alg) + 2 + 6);
      input[0] = TAG_SEQ;
      input[1] = getParamBytesForAlg(alg) + 2 + 4;
      input[2] = TAG_INT;
      input[3] = getParamBytesForAlg(alg) + 2;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/"r".+length.+acceptable/);
    });

    it('s is not marked as int', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 8;
      input[2] = TAG_INT;
      input[3] = 2;
      input[4] = 0;
      input[5] = 0;
      input[6] = TAG_INT + 1; // not int

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/expected "int".+"s"/);
    });

    it('s length exceeds available input', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 8;
      input[2] = TAG_INT;
      input[3] = 2;
      input[4] = 0;
      input[5] = 0;
      input[6] = TAG_INT;
      input[7] = 3;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/"s".+length/);
    });

    it('s length does not consume available input', function () {
      const input = Buffer.alloc(10);
      input[0] = TAG_SEQ;
      input[1] = 8;
      input[2] = TAG_INT;
      input[3] = 2;
      input[4] = 0;
      input[5] = 0;
      input[6] = TAG_INT;
      input[7] = 1;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/"s".+length/);
    });

    it('s length exceeds sensical param length', function () {
      const input = Buffer.alloc(getParamBytesForAlg(alg) + 2 + 8);
      input[0] = TAG_SEQ;
      input[1] = getParamBytesForAlg(alg) + 2 + 6;
      input[2] = TAG_INT;
      input[3] = 2;
      input[4] = 0;
      input[5] = 0;
      input[6] = TAG_INT;
      input[7] = getParamBytesForAlg(alg) + 2;

      function fn() {
        derToJoseES256(input);
      }

      expect(fn).toThrow(/"s".+length.+acceptable/);
    });
  });
});

describe('ES256', function () {
  it('should jose -> der -> jose', function () {
    // Made with WebCrypto
    // converted from base64 to base64url
    const expected =
      'hZcxeeUZb6O0SuUP0ov_95-siZtQ6Ok9Z9dxhhw0PbcmuqkgQwnLyVzFt0aOzvLZZp7iP_H-jjpP1dCeaHZaOA';
    const der = joseToDerES256(expected);
    const actual = derToJoseES256(der);
    expect(actual).toEqual(expected);
  });

  it('should der -> jose -> der', function () {
    // Made with OpenSSL
    // converted from base64 to base64url
    const expected =
      'MEUCIQCFlzF55Rlvo7RK5Q_Si__3n6yJm1Do6T1n13GGHDQ9twIgJrqpIEMJy8lcxbdGjs7y2Wae4j_x_o46T9XQnmh2Wjg';
    const jose = derToJoseES256(expected);
    const actual = joseToDerES256(jose);

    expect(actual).toEqual(expected);
  });
});
