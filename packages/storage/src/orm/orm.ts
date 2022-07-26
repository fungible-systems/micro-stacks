import { uuidv4 } from './utils';
import { KvAdapter, KvItem, WithCreatedAt, WithMeta } from './types';
import PQueue from 'p-queue';

const cache = new Map();

function buildIndexEntry<Schema extends KvItem, IndexSchema extends Record<string, any>>(
  contents: WithMeta<Schema>
): WithCreatedAt<IndexSchema> {
  return {
    _createdAt: contents._createdAt,
  } as WithCreatedAt<IndexSchema>;
}

export class GaiaORM<
  Type extends string,
  Schema extends KvItem,
  IndexSchema extends { [key: string]: any; _createdAt: number }
> {
  private adapter: KvAdapter;
  private fileExtension?: string;
  private serialize: <T = Schema>(v: T) => string;
  private deserialize: <T = Schema>(v: string) => T;
  private indexQueue = new PQueue({
    concurrency: 1,
  });
  private fileQueue = new PQueue({
    concurrency: 10,
  });

  private cache: Map<string, any>;

  constructor(
    adapter: KvAdapter,
    options?: {
      fileExtension?: string;
      serialize?: <T>(v: T) => string;
      deserialize?: <T>(v: string) => T;
      fetcher?: any;
    }
  ) {
    this.adapter = adapter;

    this.serialize = options?.serialize ?? JSON.stringify;
    this.deserialize = options?.deserialize ?? JSON.parse;

    if (options?.fileExtension)
      this.fileExtension = `${!options.fileExtension.startsWith('.') ? '.' : ''}${
        options?.fileExtension
      }`;

    this.cache = cache;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Internal functions
   *  ------------------------------------------------------------------------------------------------------------------
   */

  private withExtension = (path: string) =>
    !this.fileExtension || path.endsWith(this.fileExtension)
      ? path
      : `${path}${this.fileExtension ?? ''}`;

  private buildIndexFilename = (type: Type) => this.withExtension(`${type}.index`);
  private buildIndexEntry = (value: WithMeta<Schema>): IndexSchema => buildIndexEntry(value);
  private buildEntryFilename = (type: Type, id: string) => this.withExtension(`${type}:${id}`);

  private async updateIndexSingle(type: Type, value: WithMeta<Schema>) {
    const filename = this.buildIndexFilename(type);
    const index = await this.fetchIndex(type);
    if (!index[value._id]) {
      const newIndex: Record<string, IndexSchema> = {
        ...index,
        ...this.buildIndexEntry(value),
      };
      await this.adapter.set(filename, JSON.stringify(newIndex));
      this.cache.set('index', newIndex);
    }
  }

  private async updateIndexMany(type: Type, entries: WithMeta<Schema>[]) {
    const filename = this.buildIndexFilename(type);
    const index = await this.fetchIndex(type);
    const nonMatches: Record<string, IndexSchema> = {};
    for (const entry of entries) {
      const match = index[entry._id];
      if (!match) nonMatches[entry._id] = this.buildIndexEntry(entry)[entry._id];
    }
    if (Object.keys(nonMatches).length) {
      await this.adapter.set(
        filename,
        JSON.stringify({
          ...index,
          ...nonMatches,
        })
      );
    }
  }

  private async fetchIndex(type: Type): Promise<Record<string, IndexSchema>> {
    const filename = this.buildIndexFilename(type);
    const index = await this.adapter.get(filename);
    if (!index) {
      await this.adapter.set(filename, JSON.stringify({}));
      this.cache.set('index', {});
      return {};
    }
    const parsed = JSON.parse(index);
    this.cache.set('index', parsed);
    return parsed;
  }

  private async getFile(type: Type, id: string): Promise<WithMeta<Schema> | null> {
    const value = await this.adapter.get(this.buildEntryFilename(type, id));
    if (!value) return null;
    return this.deserialize(value);
  }

  private cleanContents(contents: Schema) {
    const { _id, _createdAt, ...rest } = contents;
    return rest;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Save model entry
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async save(type: Type, contents: Schema): Promise<WithMeta<Schema>> {
    const isNew = !contents._id || !contents._createdAt;

    const _id: string = typeof contents._id === 'undefined' ? uuidv4() : contents._id;
    const _createdAt: number = contents._createdAt
      ? typeof contents._createdAt === 'string'
        ? parseInt(contents._createdAt)
        : contents._createdAt
      : Date.now();

    const contentsWithMeta = {
      ...contents,
      _id,
      _createdAt,
    };

    const filename = this.buildEntryFilename(type, _id);

    await this.fileQueue.add(() => this.adapter.set(filename, this.serialize(contentsWithMeta)));

    // only update if is new, and we don't have a cached version :)
    if (isNew && !this.cache.get('index')?.[_id])
      await this.indexQueue.add(() => this.updateIndexSingle(type, contentsWithMeta));

    return contentsWithMeta;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Save many model entries
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async saveMany(type: Type, entries: Schema[]): Promise<WithMeta<Schema>[]> {
    const files: Record<string, [Schema, { _id: string; _createdAt: number }]> = {};
    const indexUpdates: Record<string, WithMeta<Schema>> = {};

    for (const contents of entries) {
      // ID or created at, id is truthy if someone constructs their own ID
      const isNew = !contents._id || !contents._createdAt;
      const _id: string = contents._id ?? uuidv4();
      const _createdAt: number = contents._createdAt || Date.now();
      const filename = this.buildEntryFilename(type, _id);
      if (isNew)
        indexUpdates[_id] = {
          ...contents,
          _id,
          _createdAt,
        };
      files[filename] = [contents, { _id, _createdAt }];
    }

    await Promise.all([
      this.indexQueue.add(() => this.updateIndexMany(type, Object.values(indexUpdates))),
      this.fileQueue.addAll(
        Object.entries(files).map(([filename, [contents]]) => {
          return () => this.adapter.set(filename, this.serialize(this.cleanContents(contents)));
        })
      ),
    ]);

    return Object.values(files).map(([contents, meta]) => ({ ...contents, ...meta }));
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Delete model entry
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async delete(type: Type, id: string) {
    await this.adapter.delete(this.buildEntryFilename(type, id));
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   List model entries (id, createdAt)
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async list(
    type: Type,
    options?: { orderBy?: 'created_at_desc' | 'created_at_asc' }
  ): Promise<Record<string, IndexSchema>> {
    const index = await this.fetchIndex(type);

    if (Object.keys(index).length === 0) return {};

    if (!options?.orderBy) return index;

    const sorted: Record<string, IndexSchema> = {};

    for (const [id, value] of Object.entries(index).sort((a, b) =>
      options?.orderBy === 'created_at_asc'
        ? a[1]!._createdAt - b[1]!._createdAt
        : b[1]!._createdAt - a[1]!._createdAt
    )) {
      sorted[id] = value;
    }

    return sorted;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Find entry by ID
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async findById(type: Type, _id: string): Promise<WithMeta<Schema> | null> {
    return this.getFile(type, _id);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Find many of model
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async findMany(
    type: Type,
    options?: {
      orderBy?: 'created_at_desc' | 'created_at_asc' | ((a: Schema, b: Schema) => number);
    }
  ): Promise<WithMeta<Schema>[]> {
    const index = await this.list(type, {
      orderBy: typeof options?.orderBy === 'string' ? options?.orderBy : undefined,
    });

    const results: WithMeta<Schema>[] = [];

    for (const [_id] of Object.entries(index)) {
      const value = await this.findById(type, _id);
      if (value) results.push(value);
    }

    if (typeof options?.orderBy === 'function') return results.sort(options.orderBy);

    return results;
  }
}
