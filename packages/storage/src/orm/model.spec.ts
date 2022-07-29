import { createTestModel } from '../../test/test-adapter';

describe('Model tests', () => {
  it('list simple', async () => {
    const model = createTestModel();
    const results = await model.saveMany([
      { hello: 'world' },
      { hello: 'world' },
      { hello: 'world' },
      { hello: 'world' },
      { hello: 'world' },
    ]);
    const list = await model.list();
    expect(results.map(i => ({ id: i._id, createdAt: i._createdAt }))).toEqual(list);
  });
  it('list orderBy asc', async () => {
    const model = createTestModel();
    const ids: string[] = [];

    ids.push((await model.save({ hello: '1' }))._id);
    ids.push((await model.save({ hello: '2' }))._id);
    ids.push((await model.save({ hello: '3' }))._id);
    ids.push((await model.save({ hello: '4' }))._id);
    ids.push((await model.save({ hello: '5' }))._id);
    ids.push((await model.save({ hello: '6' }))._id);
    ids.push((await model.save({ hello: '7' }))._id);
    ids.push((await model.save({ hello: '8' }))._id);
    ids.push((await model.save({ hello: '9' }))._id);
    ids.push((await model.save({ hello: '10' }))._id);

    const list = await model.list({ orderBy: 'created_at_asc' });
    expect(list.map(i => i.id)).toEqual([...ids]);

    const item = await model.findById(ids[0]);
    expect(item?.hello).toEqual('1');
  });
  it('list orderBy desc', async () => {
    const model = createTestModel();
    const ids: string[] = [];

    ids.push((await model.save({ hello: '1' }))._id);
    ids.push((await model.save({ hello: '2' }))._id);
    ids.push((await model.save({ hello: '3' }))._id);
    ids.push((await model.save({ hello: '4' }))._id);
    ids.push((await model.save({ hello: '5' }))._id);
    ids.push((await model.save({ hello: '6' }))._id);
    ids.push((await model.save({ hello: '7' }))._id);
    ids.push((await model.save({ hello: '8' }))._id);
    ids.push((await model.save({ hello: '9' }))._id);
    ids.push((await model.save({ hello: '10' }))._id);

    ids.reverse();

    const list = await model.list({
      orderBy: 'created_at_desc',
    });
    expect(list.map(i => i.id)).toEqual([...ids]);

    const item = await model.findById(ids[0]);
    expect(item?.hello).toEqual('10');
  });

  it('findMany orderBy fn', async () => {
    const model = createTestModel();
    const ids: string[] = [];

    ids.push((await model.save({ hello: '1' }))._id);
    ids.push((await model.save({ hello: '2' }))._id);
    ids.push((await model.save({ hello: '3' }))._id);
    ids.push((await model.save({ hello: '4' }))._id);
    ids.push((await model.save({ hello: '5' }))._id);
    ids.push((await model.save({ hello: '6' }))._id);
    ids.push((await model.save({ hello: '7' }))._id);
    ids.push((await model.save({ hello: '8' }))._id);
    ids.push((await model.save({ hello: '9' }))._id);
    ids.push((await model.save({ hello: '10' }))._id);

    ids.reverse();

    const list = await model.findMany({
      orderBy: (a, b) => (parseInt(a.hello) > parseInt(b.hello) ? -1 : 1),
    });

    expect(list[0]?.hello).toEqual('10');
  });
});
