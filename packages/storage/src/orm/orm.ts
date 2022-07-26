import { createClientAdapter } from './client-adapter';
import { MicroStacksClient } from '@micro-stacks/client';
import { extractField, extractId, noop, uuidv4 } from './utils';

export interface KvItem {
  _id?: string;

  [key: string]: any;
}

export interface KvAdapter {
  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<string | null>;

  delete(key: string): Promise<void>;

  list(prefix?: string): Promise<string[]>;
}

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

  async save(type: Type, obj: Schema) {
    const id = obj._id || uuidv4();

    await Promise.all(
      Object.entries(obj).map(async ([fieldKey, value]) => {
        if (this.kvIgnoredFields.includes(fieldKey)) return;

        const key = this.withExtension(`${type}:${id}:${fieldKey}`);
        await this.adapter.set(key, this.serialize(value));
      })
    );

    return id;
  }

  async delete(type: Type, id: string) {
    const keys = await this.adapter.list(`${type}:${id}:`);

    await Promise.all(
      keys.map(async key => {
        await this.adapter.delete(key);
      })
    );
  }

  async getIds(type: Type) {
    const prefix = `${type}:`;
    const keys = await this.adapter.list(prefix);
    return [...new Set(keys.map(extractId))];
  }

  async findOne(type: Type, id: string) {
    const prefix = `${type}:${id}:`;
    const keys = await this.adapter.list(prefix);
    if (keys.length === 0) return null;

    const data: KvItem = await keys.reduce(async (obj, key) => {
      const value = await this.adapter.get(key);
      const fieldName = extractField(this.cleanPath(key));
      if (value === null || typeof fieldName === 'undefined') return obj;
      return {
        ...(await obj),
        [fieldName]: this.deserialize(value),
      };
    }, Promise.resolve({}));

    data._id = id;

    return data;
  }

  async findAll(type: Type) {
    const prefix = `${type}:`;

    const keys = await this.adapter.list(prefix);
    const data: { [key: string]: KvItem } = await keys.reduce(
      async (obj: Promise<{ [key: string]: KvItem }>, key) => {
        const value = await this.adapter.get(key);
        const id = extractId(key);
        const fieldName = extractField(this.cleanPath(key));
        if (value === null || typeof fieldName === 'undefined') return obj;

        let current = (await obj)[id];
        if (typeof current === 'undefined') current = {};
        current[fieldName] = this.deserialize(value);

        return {
          ...(await obj),
          [id]: current,
        };
      },
      Promise.resolve({})
    );

    return Object.entries(data).map(([key, value]) => ({
      _id: key,
      ...value,
    }));
  }

  async exists(type: Type, id: string) {
    const keys = await this.adapter.list(`${type}:${id}:`);
    return keys.length > 0;
  }

  async getAttributes(type: Type, id: string) {
    const prefix = `${type}:${id}:`;
    const keys = await this.adapter.list(prefix);
    if (keys.length === 0) return null;
    return keys.map(key => key.replace(prefix, '').replace('.json', ''));
  }

  async getAttribute(type: Type, id: string, attribute: keyof Schema) {
    const value = await this.adapter.get(`${type}:${id}:${String(attribute)}`);

    if (value === null) return null;

    return this.deserialize<Schema[typeof attribute]>(value);
  }
}

export class Model<Schema> {
  private type: string;
  private storage: GaiaORM<typeof this.type, Schema>;
  private getId?: (value: Schema) => string;
  private setIsLoading?: (value: boolean) => void;

  constructor({
                type,
                client,
                getId,
                setIsLoading,
              }: {
    type: string;
    client: MicroStacksClient;
    getId?: (value: Schema) => string;
    setIsLoading?: (v: boolean) => void;
    fetcher?: any;
  }) {
    this.type = type;
    this.storage = new GaiaORM<typeof type, Schema>(createClientAdapter(client));
    this.getId = getId;
    this.setIsLoading = setIsLoading ?? noop;
  }

  create = async (value: Schema) => {
    this.setIsLoading?.(true);
    const _id = this.getId?.(value);
    await this.storage.save(this.type, { ...value, _id });
    this.setIsLoading?.(false);
  };

  update = async (value: { _id: string } & Partial<Omit<Schema, '_id'>>) => {
    this.setIsLoading?.(true);
    await this.storage.save(this.type, value as any);
    this.setIsLoading?.(false);
  };

  findUnique = async (id: string) => {
    this.setIsLoading?.(true);
    const result = await this.storage.findOne(this.type, id);
    this.setIsLoading?.(false);
    return result;
  };

  findProperty = async (id: string, key: keyof Schema) => {
    this.setIsLoading?.(true);
    const result = await this.storage.getAttribute(this.type, id, key);
    this.setIsLoading?.(false);
    return result;
  };

  findMany = async () => {
    this.setIsLoading?.(true);
    const result = await this.storage.findAll(this.type);
    this.setIsLoading?.(false);
    return result;
  };

  listAllIds = async () => {
    this.setIsLoading?.(true);
    const result = await this.storage.getIds(this.type);
    this.setIsLoading?.(false);
    return result;
  };

  listProperties = async (id: string) => {
    this.setIsLoading?.(true);
    const result = await this.storage.getAttributes(this.type, id);
    this.setIsLoading?.(false);
    return result;
  };

  delete = async (id: string) => {
    this.setIsLoading?.(true);
    await this.storage.delete(this.type, id);
    this.setIsLoading?.(false);
  };
}
