import {
  addressToString,
  BufferCV,
  deserializeCV,
  IntCV,
  ListCV,
  SomeCV,
  StandardPrincipalCV,
  StringAsciiCV,
  TupleCV,
  UIntCV,
} from 'micro-stacks/clarity';
import { bytesToUtf8 } from 'micro-stacks/common';

test('Deserialize with type generics', () => {
  const serializedClarityValue =
    '0x0c00000003096e616d6573706163650200000003666f6f0a70726f706572746965730c000000061963616e2d7570646174652d70726963652d66756e6374696f6e030b6c61756e636865642d61740a0100000000000000000000000000000006086c69666574696d65010000000000000000000000000000000c106e616d6573706163652d696d706f7274051a164247d6f2b425ac5771423ae6c80c754f7172b00e70726963652d66756e6374696f6e0c0000000504626173650100000000000000000000000000000001076275636b6574730b00000010010000000000000000000000000000000101000000000000000000000000000000010100000000000000000000000000000001010000000000000000000000000000000101000000000000000000000000000000010100000000000000000000000000000001010000000000000000000000000000000101000000000000000000000000000000010100000000000000000000000000000001010000000000000000000000000000000101000000000000000000000000000000010100000000000000000000000000000001010000000000000000000000000000000101000000000000000000000000000000010100000000000000000000000000000001010000000000000000000000000000000105636f6566660100000000000000000000000000000001116e6f2d766f77656c2d646973636f756e740100000000000000000000000000000001116e6f6e616c7068612d646973636f756e7401000000000000000000000000000000010b72657665616c65642d61740100000000000000000000000000000003067374617475730d000000057265616479';

  // The old way of deserializing without type generics - verbose, hard to read, frustrating to define 🤢
  function parseWithManualTypeAssertions() {
    const deserializedCv = deserializeCV(serializedClarityValue);
    const clVal = deserializedCv as TupleCV;
    const namespaceCV = clVal.data['namespace'] as BufferCV;
    const statusCV = clVal.data['status'] as StringAsciiCV;
    const properties = clVal.data['properties'] as TupleCV;
    const launchedAtCV = properties.data['launched-at'] as SomeCV;
    const launchAtIntCV = launchedAtCV.value as UIntCV;
    const lifetimeCV = properties.data['lifetime'] as IntCV;
    const revealedAtCV = properties.data['revealed-at'] as IntCV;
    const addressCV = properties.data['namespace-import'] as StandardPrincipalCV;
    const priceFunction = properties.data['price-function'] as TupleCV;
    const baseCV = priceFunction.data['base'] as IntCV;
    const coeffCV = priceFunction.data['coeff'] as IntCV;
    const noVowelDiscountCV = priceFunction.data['no-vowel-discount'] as IntCV;
    const nonalphaDiscountCV = priceFunction.data['nonalpha-discount'] as IntCV;
    const bucketsCV = priceFunction.data['buckets'] as ListCV;
    const buckets: number[] = [];
    const listCV = bucketsCV.list;
    for (let i = 0; i < listCV.length; i++) {
      const cv = listCV[i] as UIntCV;
      buckets.push(Number(cv.value));
    }
    return {
      namespace: bytesToUtf8(namespaceCV.buffer),
      status: statusCV.data,
      launchedAt: Number(launchAtIntCV.value),
      lifetime: Number(lifetimeCV.value),
      revealedAt: Number(revealedAtCV.value),
      address: addressToString(addressCV.address),
      base: Number(baseCV.value),
      coeff: Number(coeffCV.value),
      noVowelDiscount: Number(noVowelDiscountCV.value),
      nonalphaDiscount: Number(nonalphaDiscountCV.value),
      buckets,
    };
  }

  // The new way of deserializing with type generics 🙂
  function parseWithTypeDefinition() {
    // (tuple
    //   (namespace (buff 3))
    //   (status (string-ascii 5))
    //   (properties (tuple
    //     (launched-at (optional uint))
    //     (namespace-import principal)
    //     (lifetime uint)
    //     (revealed-at uint)
    //     (price-function (tuple
    //       (base uint)
    //       (coeff uint)
    //       (no-vowel-discount uint)
    //       (nonalpha-discount uint)
    //       (buckets (list 16 uint))
    //
    // Easily map the Clarity type string above to the Typescript definition:
    type BnsNamespaceCV = TupleCV<{
      ['namespace']: BufferCV;
      ['status']: StringAsciiCV;
      ['properties']: TupleCV<{
        ['launched-at']: SomeCV<UIntCV>;
        ['namespace-import']: StandardPrincipalCV;
        ['lifetime']: IntCV;
        ['revealed-at']: IntCV;
        ['price-function']: TupleCV<{
          ['base']: IntCV;
          ['coeff']: IntCV;
          ['no-vowel-discount']: IntCV;
          ['nonalpha-discount']: IntCV;
          ['buckets']: ListCV<UIntCV>;
        }>;
      }>;
    }>;
    const cv = deserializeCV<BnsNamespaceCV>(serializedClarityValue);
    // easy, fully-typed access into the Clarity value properties
    const namespaceProps = cv.data.properties.data;
    const priceProps = namespaceProps['price-function'].data;
    return {
      namespace: bytesToUtf8(cv.data.namespace.buffer),
      status: cv.data.status.data,
      launchedAt: Number(namespaceProps['launched-at'].value.value),
      lifetime: Number(namespaceProps.lifetime.value),
      revealedAt: Number(namespaceProps['revealed-at'].value),
      address: addressToString(namespaceProps['namespace-import'].address),
      base: Number(priceProps.base.value),
      coeff: Number(priceProps.coeff.value),
      noVowelDiscount: Number(priceProps['no-vowel-discount'].value),
      nonalphaDiscount: Number(priceProps['nonalpha-discount'].value),
      buckets: priceProps.buckets.list.map(b => Number(b.value)),
    };
  }

  const parsed1 = parseWithManualTypeAssertions();
  const parsed2 = parseWithTypeDefinition();
  const expected = {
    namespace: 'foo',
    status: 'ready',
    launchedAt: 6,
    lifetime: 12,
    revealedAt: 3,
    address: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
    base: 1,
    coeff: 1,
    noVowelDiscount: 1,
    nonalphaDiscount: 1,
    buckets: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  };
  expect(parsed1).toEqual(expected);
  expect(parsed2).toEqual(expected);
});
