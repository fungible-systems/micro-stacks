import { Model } from '../src';

export const createTestModel = <T = { hello: string }>() =>
  new Model<T>({
    type: 'SomeModel',
    adapter: makeTestAdapter(new Map()),
  });

export async function delay(time = 10) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const makeTestAdapter = (map: Map<string, string | null>) => ({
  async get(key: string): Promise<string | null> {
    await delay(getRandomArbitrary(10, 30));
    return new Promise(resolve => {
      resolve(map.get(key) ?? null);
    });
  },
  async set(key: string, value: string): Promise<void> {
    await delay(getRandomArbitrary(10, 30));
    return new Promise(resolve => {
      map.set(key, value);
      resolve();
    });
  },
  async list(prefix?: string): Promise<string[]> {
    await delay(getRandomArbitrary(10, 30));
    return new Promise(resolve => {
      const keys = Array.from(map.keys());
      if (!prefix) {
        resolve(keys);
      } else {
        resolve(keys.filter(key => key.startsWith(prefix)));
      }
    });
  },
  async delete(key: string): Promise<void> {
    await delay(getRandomArbitrary(10, 30));
    return new Promise(resolve => {
      map.delete(key);
      resolve();
    });
  },
});
