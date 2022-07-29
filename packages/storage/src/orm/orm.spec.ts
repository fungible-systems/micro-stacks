import { GaiaORM } from './orm';
import { makeTestAdapter } from '../../test/test-adapter';

const TYPE = 'ACCOUNT';
const VALUE = {
  name: 'thomas',
};
const makeTestOrm = () => new GaiaORM(makeTestAdapter(new Map()));

describe('ORM tests', () => {
  it('can set and get a value', async () => {
    const TEST_ORM = makeTestOrm();
    const result = await TEST_ORM.save(TYPE, VALUE);

    const value = await TEST_ORM.findById(TYPE, result._id);

    expect(value).toEqual(result);
  });

  it('can set many and list the correct amount', async () => {
    const TEST_ORM = makeTestOrm();
    const promises: Promise<any>[] = [
      TEST_ORM.save(TYPE, VALUE),
      TEST_ORM.save(TYPE, VALUE),
      TEST_ORM.save(TYPE, VALUE),
      TEST_ORM.save(TYPE, VALUE),
      TEST_ORM.save(TYPE, VALUE),
    ];

    await Promise.all(promises);

    const ids = await TEST_ORM.list(TYPE);

    expect(Object.keys(ids).length).toEqual(promises.length);
  });

  it('can save many', async () => {
    const TEST_ORM = makeTestOrm();
    const v = await TEST_ORM.saveMany(TYPE, [VALUE, VALUE, VALUE, VALUE]);
    const ids = await TEST_ORM.list(TYPE);

    expect(Object.keys(ids).length).toEqual(v.length);
  });
});
