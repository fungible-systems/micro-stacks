var splitUri = function (uri: string) {
  var splitted = uri.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
  return splitted;
};

function is_iri(value: any) {
  if (!value) {
    return;
  }

  // check for illegal characters
  if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value)) return;

  // check for hex escapes that aren't complete
  if (/%[^0-9a-f]/i.test(value)) return;
  if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return;

  var splitted: any = [];
  var scheme = '';
  var authority = '';
  var path = '';
  var query = '';
  var fragment = '';
  var out = '';

  // from RFC 3986
  splitted = splitUri(value);
  scheme = splitted[1];
  authority = splitted[2];
  path = splitted[3];
  query = splitted[4];
  fragment = splitted[5];

  // scheme and path are required, though the path can be empty
  if (!(scheme && scheme.length && path.length >= 0)) return;

  // if authority is present, the path must be empty or begin with a /
  if (authority && authority.length) {
    if (!(path.length === 0 || /^\//.test(path))) return;
  } else {
    // if authority is not present, the path must not start with //
    if (/^\/\//.test(path)) return;
  }

  // scheme must begin with a letter, then consist of letters, digits, +, ., or -
  if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase())) return;

  // re-assemble the URL per section 5.3 in RFC 3986
  out += scheme + ':';
  if (authority && authority.length) {
    out += '//' + authority;
  }

  out += path;

  if (query && query.length) {
    out += '?' + query;
  }

  if (fragment && fragment.length) {
    out += '#' + fragment;
  }

  return out;
}

function is_http_iri(value: any, allowHttps?: any) {
  if (!is_iri(value)) {
    return;
  }

  var splitted: any = [];
  var scheme = '';
  var authority: any = '';
  var path = '';
  var port = '';
  var query = '';
  var fragment = '';
  var out = '';

  // from RFC 3986
  splitted = splitUri(value);
  scheme = splitted[1];
  authority = splitted[2];
  path = splitted[3];
  query = splitted[4];
  fragment = splitted[5];

  if (!scheme) return;

  if (allowHttps) {
    if (scheme.toLowerCase() != 'https') return;
  } else {
    if (scheme.toLowerCase() != 'http') return;
  }

  // fully-qualified URIs must have an authority section that is
  // a valid host
  if (!authority) {
    return;
  }

  // enable port component
  if (/:(\d+)$/.test(authority)) {
    port = authority.match(/:(\d+)$/)[0];
    authority = authority.replace(/:\d+$/, '');
  }

  out += scheme + ':';
  out += '//' + authority;

  if (port) {
    out += port;
  }

  out += path;

  if (query && query.length) {
    out += '?' + query;
  }

  if (fragment && fragment.length) {
    out += '#' + fragment;
  }

  return out;
}

function is_https_iri(value: any) {
  return is_http_iri(value, true);
}

function is_web_iri(value: any) {
  return is_http_iri(value) || is_https_iri(value);
}

export {
  is_iri,
  is_http_iri,
  is_https_iri,
  is_web_iri,
  is_iri as isUri,
  is_http_iri as isHttpUri,
  is_https_iri as isHttpsUri,
  is_web_iri as isWebUri,
};
