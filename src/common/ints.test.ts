import { intToBigInt } from 'micro-stacks/common';
import BN from 'bn.js';

const bn = new BN(10);
describe(intToBigInt.name, () => {
  test('can convert hex', () => {
    const value = intToBigInt(0x01);
    expect(value).toBe(1n);
  });
  test('can convert hex string', () => {
    const value = intToBigInt('0x01');
    expect(value).toBe(1n);
  });

  it('will throw if incorrect string value is passed', () => {
    expect(() => {
      intToBigInt('asdfasdfs');
    }).toThrow("Invalid value. String integer 'asdfasdfs' is not finite.");
  });

  it('will throw if float is passed', () => {
    expect(() => {
      intToBigInt(0.654);
    }).toThrow("Invalid value. Values of type 'number' must be an integer.");
  });

  it('will throw non type is passed', () => {
    expect(() => {
      // @ts-expect-error: ensuring it will throw
      intToBigInt({});
    }).toThrow(TypeError);
  });

  it('can convert BN', () => {
    const value = intToBigInt(bn as any);
    expect(value).toBe(10n);
  });
});
