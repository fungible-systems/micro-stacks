function deepCopy(obj: any) {
  // Check for immutable primitives
  // https://developer.mozilla.org/en-US/docs/Glossary/Primitive
  // string, number, bigint, boolean, undefined, symbol, and null.
  switch (typeof obj) {
    case 'string':
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'function': // also don't attempt to "clone" a function
      return obj;
  }
  if (obj === null) {
    return obj;
  }

  // Support deep cloning TypedArrays like Uint8Array
  if (ArrayBuffer.isView(obj)) {
    // Womp: https://github.com/microsoft/TypeScript/issues/15402
    return (obj as any).slice();
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj: Record<string, any>, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj)));
  }
}

export function cloneDeep<T>(value: T): T {
  return deepCopy(value) as T;
}

export function omit<T, K extends keyof T>(obj: T, prop: K): Omit<T, K> {
  const clone = cloneDeep<T>(obj);
  delete clone[prop];
  return clone;
}
