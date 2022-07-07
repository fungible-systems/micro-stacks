/**
 * Returns the global scope `Window`, `WorkerGlobalScope`, or `NodeJS.Global` if available in the
 * currently executing environment.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/self
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope
 *
 * This could be switched to `globalThis` once it is standardized and widely available.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
 * @ignore
 */
export function getGlobalScope(): Window {
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  // This function is meant to be called when accessing APIs that are typically only available in
  // web-browser/DOM environments, but we also want to support situations where running in Node.js
  // environment, and a polyfill was added to the Node.js `global` object scope without adding the
  // `window` global object as well.
  if (typeof global !== 'undefined') {
    return global as unknown as Window;
  }
  throw new Error(
    'Unexpected runtime environment - no supported global scope (`window`, `self`, `global`) available'
  );
}

export function getTokenFileUrl(zoneFileJson: any): string | null {
  if (!zoneFileJson.hasOwnProperty('uri')) {
    return null;
  }
  if (!Array.isArray(zoneFileJson.uri)) {
    return null;
  }
  if (zoneFileJson.uri.length < 1) {
    return null;
  }
  const firstUriRecord = zoneFileJson.uri[0];

  if (!firstUriRecord.hasOwnProperty('target')) {
    return null;
  }
  let tokenFileUrl = firstUriRecord.target;

  if (tokenFileUrl.startsWith('https')) {
    // pass
  } else if (tokenFileUrl.startsWith('http')) {
    // pass
  } else {
    tokenFileUrl = `https://${tokenFileUrl}`;
  }

  return tokenFileUrl;
}
