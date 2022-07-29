import { createTestModel } from '../../test/test-adapter';

describe('Model tests', () => {
  it('list simple', async () => {
    const model = createTestModel('something_1');
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
    const model = createTestModel('something_2');
    const ids: Record<string, number> = {};
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const number of arr) {
      const { _id, _createdAt } = await model.save({ hello: number.toString() });
      ids[_id] = _createdAt;
    }

    const list = await model.list({ orderBy: 'created_at_asc' });

    expect(list.length).toEqual(Object.keys(ids).length);
    expect(list.map(i => i.id)).toEqual(Object.keys(ids));

    const item = await model.findById(Object.keys(ids)[0]);
    expect(item?.hello).toEqual('1');
  });

  it('list orderBy desc', async () => {
    const model = createTestModel('asdasd');
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
    const model = createTestModel('asdasdasd');
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
