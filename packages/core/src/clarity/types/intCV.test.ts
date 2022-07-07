import { intCV } from 'micro-stacks/clarity';

describe(intCV.name, () => {
  it('should do a thing', () => {
    const intNegativeTen = intCV(-10);
    expect(intNegativeTen.value.toString()).toEqual('-10');
  });
});
