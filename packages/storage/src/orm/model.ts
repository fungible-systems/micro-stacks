import { GaiaORM } from './orm';
import { KvAdapter, WithMeta } from './types';

const listCache = new Map<string, number>();
const cache = new Map<string, number>();

export class Model<Schema> {
  private readonly type: string;
  private readonly makeId?: (value: Schema) => string;
  private driver: GaiaORM<typeof this.type, Schema>;
  private listCache: Map<string, number>;
  private cache: Map<string, number>;

  constructor({
    type,
    adapter,
    makeId,
  }: {
    type: string;
    adapter: KvAdapter;
    makeId?: (value: Schema) => string;
  }) {
    this.type = type;
    this.driver = new GaiaORM<typeof type, Schema>(adapter, { fileExtension: '.json' });
    this.makeId = makeId;
    this.cache = cache;
    this.listCache = listCache;
  }

  private getLastSaveCount = () => {
    return this.cache.get('saveCount') ?? null;
  };
  private getListFetchSaveCount = () => {
    return this.cache.get('listCount') ?? 0;
  };
  private incrementSaveNonce = () =>
    this.cache.set('saveCount', (this.cache.get('saveCount') ?? 0) + 1);
  private setListFetchCount = () => this.cache.set('listCount', this.cache.get('saveCount') ?? 0);

  private getCanUseCachedList = () => {
    const lastSaveCount = this.getLastSaveCount();
    const lastListCount = this.getListFetchSaveCount();
    if (lastSaveCount === null) return true;
    return lastListCount === lastSaveCount;
  };
  private getHasListCache = () => {
    return [...this.listCache.keys()].length > 0;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Save
   *  ------------------------------------------------------------------------------------------------------------------
   */
  save = async (value: WithMeta<Schema>): Promise<WithMeta<Schema>> => {
    const id = value._id ?? this.makeId?.(value);
    if (id && !value._id) value['_id'] = id;
    const result = await this.driver.save(this.type, value);
    this.incrementSaveNonce();

    if (this.getHasListCache()) {
      this.listCache.set(result._id, result._createdAt);
      this.setListFetchCount();
    }
    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Save many
   *  ------------------------------------------------------------------------------------------------------------------
   */
  saveMany = async (values: WithMeta<Schema>[]): Promise<WithMeta<Schema>[]> => {
    const results = await this.driver.saveMany(
      this.type,
      values.map(value => {
        const id = value._id ?? this.makeId?.(value);
        if (id && !value._id) value['_id'] = id;
        return value;
      })
    );
    this.incrementSaveNonce();
    if (this.getHasListCache()) {
      for (const item of results) {
        this.listCache.set(item._id, item._createdAt);
      }
      this.setListFetchCount();
    }

    return results;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   findById
   *  ------------------------------------------------------------------------------------------------------------------
   */
  findById = async (id: string): Promise<Schema | null> => {
    const createdAt = this.listCache.get(id);
    if (createdAt) return this.driver.findExact(this.type, id, createdAt);
    return this.driver.findById(this.type, id);
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   findMany
   *  ------------------------------------------------------------------------------------------------------------------
   */
  findMany = async (options?: {
    orderBy?: 'created_at_desc' | 'created_at_asc' | ((a: Schema, b: Schema) => number);
  }): Promise<WithMeta<Schema>[]> => {
    return this.driver.findMany(this.type, options);
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   List
   *  ------------------------------------------------------------------------------------------------------------------
   */
  list = async (options?: { orderBy?: 'created_at_desc' | 'created_at_asc' }) => {
    const results: { id: string; createdAt: number }[] = [];

    if (this.getCanUseCachedList() && this.getHasListCache()) {
      // if we have fetched list since last save and we have cache
      for (const [id, createdAt] of this.listCache.entries()) {
        results.push({ id, createdAt });
      }
    } else {
      for (const [id, createdAt] of Object.entries(await this.driver.list(this.type))) {
        this.listCache.set(id, createdAt);
        results.push({
          id,
          createdAt,
        });
      }
      this.setListFetchCount();
    }

    if (options?.orderBy)
      return results.sort((a, b) =>
        options?.orderBy === 'created_at_asc'
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt
      );
    return results;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Delete
   *  ------------------------------------------------------------------------------------------------------------------
   */
  delete = async (id: string) => {
    await this.driver.delete(this.type, id);
  };
}
