export interface KvItem {
  _id?: string;
  _createdAt?: number;

  [key: string]: any;
}

export interface IndexEntryRequirements {
  _createdAt: number;
}

export interface KvAdapter {
  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<string | null>;

  delete(key: string): Promise<void>;

  list(prefix?: string): Promise<string[]>;
}

export type WithCreatedAt<T> = T & { _createdAt: number };
export type WithMeta<T> = T & { _id: string; _createdAt: number };
export type WithMetaOptional<T> = T & { _id?: string; _createdAt?: number };
