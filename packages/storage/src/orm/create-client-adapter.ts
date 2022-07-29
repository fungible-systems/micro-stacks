import type { KvAdapter } from './types';
import { withJson } from '../utils';
import { Storage } from '../storage';

export function createClientAdapter(storage: Storage): KvAdapter {
  return {
    async get(key: string): Promise<string | null> {
      try {
        const result = await storage.getFile(withJson(key), { decrypt: true });
        return result as unknown as string;
      } catch (e) {
        return null;
      }
    },
    async set(key: string, value: string): Promise<void> {
      try {
        await storage.putFile(withJson(key), value, { encrypt: true });
      } catch (e) {
        console.log(e);
      }
    },
    async list(prefix: string): Promise<string[]> {
      return await storage.listFiles({ prefix });
    },
    async delete(key: string): Promise<void> {
      await storage.deleteFile(withJson(key));
    },
  };
}
