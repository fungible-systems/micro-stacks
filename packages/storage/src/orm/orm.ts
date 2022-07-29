import { uuidv4 } from './utils';
import { KvAdapter, KvItem, WithMeta } from './types';
import PQueue from 'p-queue';

export class GaiaORM<Type extends string, Schema extends KvItem> {
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
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Internal functions
   *  ------------------------------------------------------------------------------------------------------------------
   */

  private withExtension = (path: string) =>
    !this.fileExtension || path.endsWith(this.fileExtension)
      ? path
      : `${path}${this.fileExtension ?? ''}`;

  private makeIndexFilename = (type: Type) => this.withExtension(`${type}.orm_index`);

  private makeFilename = (type: Type, id: string, createdAt: string | number) =>
    this.withExtension(`${type}:${id}:${createdAt}`);

  private async updateIndex(type: Type, id: string, createdAt: number) {
    const filename = this.makeIndexFilename(type);
    const current = await this.adapter.get(filename);
    const obj: Record<string, number> = current ? JSON.parse(current) : {};
    const match = obj[id];
    if (!match)
      await this.adapter.set(
        filename,
        JSON.stringify({
          ...obj,
          [id]: createdAt,
        })
      );
  }

  private async updateIndexMany(type: Type, entries: Record<string, number>) {
    const filename = this.makeIndexFilename(type);
    const current = await this.adapter.get(filename);
    const obj: Record<string, number> = current ? JSON.parse(current) : {};
    const nonMatches: Record<string, number> = {};
    for (const [id, createdAt] of Object.entries(entries)) {
      const match = obj[id];
      if (!match) nonMatches[id] = createdAt;
    }
    if (Object.keys(nonMatches).length) {
      await this.adapter.set(
        filename,
        JSON.stringify({
          ...obj,
          ...nonMatches,
        })
      );
    }
  }

  private async fetchIndex(type: Type): Promise<Record<string, number>> {
    const filename = this.makeIndexFilename(type);
    const index = await this.adapter.get(filename);
    if (!index) {
      void this.adapter.set(filename, JSON.stringify({}));
      return {};
    }
    return JSON.parse(index);
  }

  private async getFile(type: Type, id: string, createdAt: string | number) {
    const value = await this.adapter.get(this.makeFilename(type, id, createdAt));
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
  async save(type: Type, contents: Schema) {
    const isNew = !contents._id && !contents._createdAt;
    const _id: string = contents._id ?? uuidv4();
    const _createdAt: number = contents._createdAt ? parseInt(contents._createdAt) : Date.now();

    const filename = this.makeFilename(type, _id, _createdAt);

    await this.fileQueue.add(() => this.adapter.set(filename, this.serialize(contents)));

    if (isNew) await this.indexQueue.add(() => this.updateIndex(type, _id, _createdAt));

    return {
      _id,
      _createdAt,
      ...contents,
    };
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Save many model entries
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async saveMany(type: Type, entries: Schema[]) {
    const files: Record<string, [Schema, { _id: string; _createdAt: number }]> = {};
    const indexUpdates: Record<string, number> = {};

    for (const contents of entries) {
      const isNew = !contents._id && !contents._createdAt;
      const _id: string = contents._id ?? uuidv4();
      const _createdAt: number = contents._createdAt ? parseInt(contents._createdAt) : Date.now();
      const filename = this.makeFilename(type, _id, _createdAt);
      if (isNew) indexUpdates[_id] = _createdAt;
      files[filename] = [contents, { _id, _createdAt }];
    }

    await Promise.all([
      this.indexQueue.add(() => this.updateIndexMany(type, indexUpdates)),
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
    const index = await this.fetchIndex(type);
    const createdAt = index[id];
    if (!createdAt) {
      console.warn('cannot find file to delete');
      return;
    }
    await this.adapter.delete(this.makeFilename(type, id, createdAt));
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   List model entries (id, createdAt)
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async list(
    type: Type,
    options?: { orderBy?: 'created_at_desc' | 'created_at_asc' }
  ): Promise<Record<string, number>> {
    const index = await this.fetchIndex(type);

    if (Object.keys(index).length === 0) return {};

    if (!options?.orderBy) return index;

    const sorted: Record<string, number> = {};

    for (const [id, createdAt] of Object.entries(index).sort((a, b) =>
      options?.orderBy === 'created_at_asc' ? a[1] - b[1] : b[1] - a[1]
    )) {
      sorted[id] = createdAt;
    }

    return sorted;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Find entry by ID
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async findById(
    type: Type,
    _id: string
  ): Promise<(Schema & { _id: string; _createdAt: number }) | null> {
    const _createdAt = (await this.fetchIndex(type))[_id];
    if (_createdAt) return this.findExact(type, _id, _createdAt);
    return null;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Find entry by ID & createdAt
   *  ------------------------------------------------------------------------------------------------------------------
   */
  async findExact(
    type: Type,
    _id: string,
    _createdAt: number
  ): Promise<(Schema & { _id: string; _createdAt: number }) | null> {
    const value = await this.getFile(type, _id, _createdAt);
    if (value)
      return {
        _id,
        _createdAt,
        ...value,
      };
    return null;
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

    for (const [_id, _createdAt] of Object.entries(index)) {
      const value = await this.getFile(type, _id, _createdAt);
      if (value)
        results.push({
          _id,
          _createdAt,
          ...value,
        });
    }

    if (typeof options?.orderBy === 'function') return results.sort(options.orderBy);

    return results;
  }
}
