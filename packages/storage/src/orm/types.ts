export interface KvItem {
  _id?: string;
  _createdAt?: string;

  [key: string]: any;
}

export interface KvAdapter {
  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<string | null>;

  delete(key: string): Promise<void>;

  list(prefix?: string): Promise<string[]>;
}

export type WithMeta<T> = T & { _id?: string; _createdAt?: number };
