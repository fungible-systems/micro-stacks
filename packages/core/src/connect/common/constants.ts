export const IS_BROWSER = typeof document !== 'undefined';

export enum PersistedDataKeys {
  SessionStorageKey = 'stacks-session',
  NetworkStorageKey = 'stacks-network',
}
