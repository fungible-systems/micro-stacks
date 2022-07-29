import { extractCreatedAtFromField, extractField, extractId, uuidv4 } from './utils';
import { KvAdapter, KvItem } from './types';

export class GaiaORM<Type extends string, Schema extends KvItem> {
  private adapter: KvAdapter;
  private fileExtension?: string;
  private kvIgnoredFields: string[] = ['_id'];
  private serialize: <T>(v: T) => string;
  private deserialize: <T>(v: string) => T;

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

  private cleanPath = (path: string) =>
    typeof this.fileExtension === 'string' ? path.replace(this.fileExtension, '') : path;

  private withExtension = (path: string) =>
    !this.fileExtension || path.endsWith(this.fileExtension)
      ? path
      : `${path}${this.fileExtension ?? ''}`;

  /**
   * Save entry
   * @param type
   * @param contents
   * @param isNew
   */
  async save(type: Type, contents: Schema, isNew?: boolean) {
    const id = contents._id || uuidv4();

    const createdAt = Date.now();

    const promises: Promise<any>[] = isNew
      ? [this.adapter.set(`${type}__${id}__${createdAt}`, this.serialize(null))]
      : [];

    for (const [fieldKey, value] of Object.entries(contents)) {
      if (!this.kvIgnoredFields.includes(fieldKey)) {
        promises.push(
          this.adapter.set(
            this.withExtension(
              `${type}:${id}:${fieldKey}${isNew ? `:${createdAt.toString()}` : ''}`
            ),
            this.serialize(value)
          )
        );
      }
    }

    await Promise.all(promises);

    return {
      ...contents,
      _id: id,
      _createdAt: createdAt,
    };
  }

  /**
   * Delete file
   * @param type
   * @param id
   */
  async delete(type: Type, id: string) {
    const keys = await this.adapter.list(`${type}:${id}:`);

    const promises: Promise<any>[] = [];

    for (const key of keys) await this.adapter.delete(key);

    await Promise.all(promises);
  }

  /**
   * List ids of type
   * @param type
   * @param orderBy
   */
  async listIdsOfType(type: Type, orderBy?: 'created_at_desc' | 'created_at_asc') {
    const prefix = `${type}__`;
    const keys = (await this.adapter.list(prefix)).map(path => {
      const [_type, id, createdAt] = this.cleanPath(path).split('__');
      return {
        id,
        createdAt: parseInt(createdAt),
      };
    });
    if (orderBy) {
      return keys
        .sort((a, b) =>
          orderBy === 'created_at_asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
        )
        .map(v => v.id);
    }
    return keys.map(v => v.id);
  }

  /**
   * Find by ID
   * @param type
   * @param id
   */
  async findById(type: Type, id: string) {
    const prefix = `${type}:${id}:`;
    const keys = await this.adapter.list(prefix);
    if (keys.length === 0) return null;

    const data: KvItem = await keys.reduce(async (obj, key) => {
      const value = await this.adapter.get(key);
      const fieldName = extractField(this.cleanPath(key));
      const createdAt = extractCreatedAtFromField(this.cleanPath(key));
      if (value === null || typeof fieldName === 'undefined') return obj;
      return {
        ...(await obj),
        [fieldName]: this.deserialize(value),
        _createdAt: createdAt,
      };
    }, Promise.resolve({}));

    data._id = id;

    return data as Schema;
  }

  /**
   * Find many of type
   * @param type
   * @param options
   */
  async findMany(
    type: Type,
    options?: {
      orderBy?: 'created_at_desc' | 'created_at_asc' | ((a: Schema, b: Schema) => number);
    }
  ) {
    const prefix = `${type}:`;

    const keys = await this.adapter.list(prefix);
    const data: { [key: string]: KvItem } = await keys.reduce(
      async (obj: Promise<{ [key: string]: KvItem }>, key) => {
        const value = await this.adapter.get(key);
        const id = extractId(key);
        const fieldName = extractField(this.cleanPath(key));
        const createdAt = extractCreatedAtFromField(this.cleanPath(key));
        if (value === null || typeof fieldName === 'undefined') return obj;

        let current = (await obj)[id];
        if (typeof current === 'undefined') current = {};
        current[fieldName] = this.deserialize(value);
        current['_createdAt'] = createdAt;

        return {
          ...(await obj),
          [id]: current,
        };
      },
      Promise.resolve({})
    );

    const results = Object.entries(data).map(([key, value]) => ({
      _id: key,
      ...value,
    }));
    if (options?.orderBy) {
      return results.sort(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof options.orderBy === 'function'
          ? options.orderBy
          : (a, b) =>
              options.orderBy === 'created_at_asc'
                ? parseInt(a._createdAt!) - parseInt(b._createdAt!)
                : parseInt(b._createdAt!) - parseInt(a._createdAt!)
      );
    }
    return results;
  }

  /**
   * Check if exists
   * @param type
   * @param id
   */
  async exists(type: Type, id: string) {
    const keys = await this.adapter.list(`${type}:${id}:`);
    return keys.length > 0;
  }

  /**
   * Find a single field data
   * @param type
   * @param id
   * @param attribute
   */
  async findField(type: Type, id: string, attribute: keyof Schema) {
    const value = await this.adapter.get(`${type}:${id}:${String(attribute)}`);
    if (value === null) return null;
    return this.deserialize<Schema[typeof attribute]>(value);
  }

  /**
   * find all fields for a given id
   * @param type
   * @param id
   */
  async findAllFields(type: Type, id: string) {
    const prefix = `${type}:${id}:`;
    const keys = await this.adapter.list(prefix);
    if (keys.length === 0) return null;
    return keys.map(key => this.cleanPath(key.replace(prefix, '')));
  }
}
