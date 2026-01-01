var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-H3LOJa/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input2, init) {
  const request = new Request(input2, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form2, key, value) => {
  if (form2[key] !== void 0) {
    if (Array.isArray(form2[key])) {
      ;
      form2[key].push(value);
    } else {
      form2[key] = [form2[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form2[key] = value;
    } else {
      form2[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form2, key, value) => {
  let nestedForm = form2;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var escapeRe = /[&<>'"]/;
var stringBufferToString = /* @__PURE__ */ __name(async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
}, "stringBufferToString");
var escapeToBuffer = /* @__PURE__ */ __name((str, buffer) => {
  const match2 = str.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
}, "escapeToBuffer");
var resolveCallbackSync = /* @__PURE__ */ __name((str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
}, "resolveCallbackSync");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html2, arg, headers) => {
    const res = /* @__PURE__ */ __name((html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input2, requestInit, Env, executionCtx) => {
    if (input2 instanceof Request) {
      return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
    }
    input2 = input2.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// src/index.tsx
import manifest from "__STATIC_CONTENT_MANIFEST";

// src/api.ts
var API_BASE = "https://your-api.example.com";
async function fetchApi(endpoint, options = {}) {
  try {
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        "User-Agent": "PromptBase-Client/1.0",
        "Accept": "application/json"
      }
    };
    const res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
    if (!res.ok) {
      const text = await res.text();
      console.error(`API Error ${res.status} on ${endpoint}:`, text.slice(0, 200));
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`Fetch failed for ${endpoint}:`, e);
    throw e;
  }
}
__name(fetchApi, "fetchApi");
function recursiveParse(obj) {
  if (typeof obj === "string") {
    const trimmed = obj.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(obj);
        return recursiveParse(parsed);
      } catch (e) {
        return obj;
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveParse);
  }
  if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = recursiveParse(obj[key]);
    }
    return newObj;
  }
  return obj;
}
__name(recursiveParse, "recursiveParse");
function extractPromptData(item) {
  if (item.prompt_data) {
    try {
      let data = item.prompt_data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      const parsedData = recursiveParse(data);
      return JSON.stringify(parsedData, null, 2);
    } catch (e) {
      return typeof item.prompt_data === "string" ? item.prompt_data : JSON.stringify(item.prompt_data, null, 2);
    }
  }
  return "";
}
__name(extractPromptData, "extractPromptData");
function normalizeItem(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    // Keep description separate
    promptData: extractPromptData(item),
    // Extract prompt data separately
    type: item.type,
    // For images: use full_image_url, for videos: use video_url, fallback to url
    url: item.full_image_url || item.video_url || item.url || "",
    // For images: use thumbnail_url, for videos: use poster_url, fallback to thumbnail
    thumbnail: item.thumbnail_url || item.poster_url || item.thumbnail,
    tags: item.tags || [],
    likes: item.likes || 0,
    // Multiple images - use img_urls array if available
    imgUrls: item.img_urls && item.img_urls.length > 0 ? item.img_urls : void 0,
    // Source/attribution info
    sourceUrl: item.source_url,
    uploader: item.uploader,
    uploaderUrl: item.uploader_url
  };
}
__name(normalizeItem, "normalizeItem");
function normalizeItems(items) {
  return items.map(normalizeItem);
}
__name(normalizeItems, "normalizeItems");
async function fetchImages(page = 1, limit = 50) {
  const data = await fetchApi(`/images?page=${page}&limit=${limit}`);
  data.data = normalizeItems(data.data || []);
  if (data.total_pages === void 0 && data.total !== void 0 && data.limit) {
    data.total_pages = Math.ceil(data.total / data.limit);
  }
  if (data.has_more === void 0) {
    data.has_more = data.page < data.total_pages;
  }
  return data;
}
__name(fetchImages, "fetchImages");
async function fetchVideos(page = 1, limit = 50) {
  const data = await fetchApi(`/videos?page=${page}&limit=${limit}`);
  data.data = normalizeItems(data.data || []);
  if (data.total_pages === void 0 && data.total !== void 0 && data.limit) {
    data.total_pages = Math.ceil(data.total / data.limit);
  }
  if (data.has_more === void 0) {
    data.has_more = data.page < data.total_pages;
  }
  return data;
}
__name(fetchVideos, "fetchVideos");
async function fetchExplorer(seed, page = 1, limit = 30) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (seed)
    params.set("seed", seed);
  const data = await fetchApi(`/explorer?${params}`);
  data.data = normalizeItems(data.data || []);
  return data;
}
__name(fetchExplorer, "fetchExplorer");
async function fetchTags() {
  return fetchApi("/tags");
}
__name(fetchTags, "fetchTags");
async function search(query, tag, tags, type, page = 1, limit = 50) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (query)
    params.set("q", query);
  if (tag)
    params.set("tag", tag);
  if (tags && tags.length)
    params.set("tags", tags.join(","));
  if (type)
    params.set("type", type);
  const data = await fetchApi(`/search?${params}`);
  data.data = normalizeItems(data.data || []);
  if (data.total_pages === void 0 && data.total !== void 0 && data.limit) {
    data.total_pages = Math.ceil(data.total / data.limit);
  }
  if (data.has_more === void 0) {
    data.has_more = data.page < data.total_pages;
  }
  return data;
}
__name(search, "search");
async function getItem(id) {
  const data = await fetchApi(`/item/${id}`);
  return normalizeItem(data);
}
__name(getItem, "getItem");
async function likeItem(id) {
  return fetchApi(`/like/${id}`, { method: "POST" });
}
__name(likeItem, "likeItem");
async function unlikeItem(id) {
  return fetchApi(`/like/${id}`, { method: "DELETE" });
}
__name(unlikeItem, "unlikeItem");

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
var DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
var DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
var PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag = /* @__PURE__ */ __name((fn) => {
  ;
  fn[DOM_INTERNAL_TAG] = true;
  return fn;
}, "setInternalTagFlag");

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction = /* @__PURE__ */ __name((values) => ({ value, children }) => {
  if (!children) {
    return void 0;
  }
  const props = {
    children: [
      {
        tag: setInternalTagFlag(() => {
          values.push(value);
        }),
        props: {}
      }
    ]
  };
  if (Array.isArray(children)) {
    props.children.push(...children.flat());
  } else {
    props.children.push(children);
  }
  props.children.push({
    tag: setInternalTagFlag(() => {
      values.pop();
    }),
    props: {}
  });
  const res = { tag: "", props, type: "" };
  res[DOM_ERROR_HANDLER] = (err) => {
    values.pop();
    throw err;
  };
  return res;
}, "createContextProviderFunction");

// node_modules/hono/dist/jsx/context.js
var globalContexts = [];
var createContext = /* @__PURE__ */ __name((defaultValue) => {
  const values = [defaultValue];
  const context = /* @__PURE__ */ __name((props) => {
    values.push(props.value);
    let string;
    try {
      string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
    } finally {
      values.pop();
    }
    if (string instanceof Promise) {
      return string.then((resString) => raw(resString, resString.callbacks));
    } else {
      return raw(string);
    }
  }, "context");
  context.values = values;
  context.Provider = context;
  context[DOM_RENDERER] = createContextProviderFunction(values);
  globalContexts.push(context);
  return context;
}, "createContext");
var useContext = /* @__PURE__ */ __name((context) => {
  return context.values.at(-1);
}, "useContext");

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap = {
  title: [],
  script: ["src"],
  style: ["data-href"],
  link: ["href"],
  meta: ["name", "httpEquiv", "charset", "itemProp"]
};
var domRenderers = {};
var dataPrecedenceAttr = "data-precedence";

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});

// node_modules/hono/dist/jsx/children.js
var toArray = /* @__PURE__ */ __name((children) => Array.isArray(children) ? children : [children], "toArray");

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var metaTagMap = /* @__PURE__ */ new WeakMap();
var insertIntoHead = /* @__PURE__ */ __name((tagName, tag, props, precedence) => ({ buffer, context }) => {
  if (!buffer) {
    return;
  }
  const map = metaTagMap.get(context) || {};
  metaTagMap.set(context, map);
  const tags = map[tagName] ||= [];
  let duped = false;
  const deDupeKeys = deDupeKeyMap[tagName];
  if (deDupeKeys.length > 0) {
    LOOP:
      for (const [, tagProps] of tags) {
        for (const key of deDupeKeys) {
          if ((tagProps?.[key] ?? null) === props?.[key]) {
            duped = true;
            break LOOP;
          }
        }
      }
  }
  if (duped) {
    buffer[0] = buffer[0].replaceAll(tag, "");
  } else if (deDupeKeys.length > 0) {
    tags.push([tag, props, precedence]);
  } else {
    tags.unshift([tag, props, precedence]);
  }
  if (buffer[0].indexOf("</head>") !== -1) {
    let insertTags;
    if (precedence === void 0) {
      insertTags = tags.map(([tag2]) => tag2);
    } else {
      const precedences = [];
      insertTags = tags.map(([tag2, , precedence2]) => {
        let order = precedences.indexOf(precedence2);
        if (order === -1) {
          precedences.push(precedence2);
          order = precedences.length - 1;
        }
        return [tag2, order];
      }).sort((a, b) => a[1] - b[1]).map(([tag2]) => tag2);
    }
    insertTags.forEach((tag2) => {
      buffer[0] = buffer[0].replaceAll(tag2, "");
    });
    buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
  }
}, "insertIntoHead");
var returnWithoutSpecialBehavior = /* @__PURE__ */ __name((tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString()), "returnWithoutSpecialBehavior");
var documentMetadataTag = /* @__PURE__ */ __name((tag, children, props, sort) => {
  if ("itemProp" in props) {
    return returnWithoutSpecialBehavior(tag, children, props);
  }
  let { precedence, blocking, ...restProps } = props;
  precedence = sort ? precedence ?? "" : void 0;
  if (sort) {
    restProps[dataPrecedenceAttr] = precedence;
  }
  const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
  if (string instanceof Promise) {
    return string.then(
      (resString) => raw(string, [
        ...resString.callbacks || [],
        insertIntoHead(tag, resString, restProps, precedence)
      ])
    );
  } else {
    return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
  }
}, "documentMetadataTag");
var title = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2) {
    const context = useContext(nameSpaceContext2);
    if (context === "svg" || context === "head") {
      return new JSXNode(
        "title",
        props,
        toArray(children ?? [])
      );
    }
  }
  return documentMetadataTag("title", children, props, false);
}, "title");
var script = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("script", children, props);
  }
  return documentMetadataTag("script", children, props, false);
}, "script");
var style = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  if (!["href", "precedence"].every((k) => k in props)) {
    return returnWithoutSpecialBehavior("style", children, props);
  }
  props["data-href"] = props.href;
  delete props.href;
  return documentMetadataTag("style", children, props, true);
}, "style");
var link = /* @__PURE__ */ __name(({ children, ...props }) => {
  if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
    return returnWithoutSpecialBehavior("link", children, props);
  }
  return documentMetadataTag("link", children, props, "precedence" in props);
}, "link");
var meta = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("meta", children, props);
  }
  return documentMetadataTag("meta", children, props, false);
}, "meta");
var newJSXNode = /* @__PURE__ */ __name((tag, { children, ...props }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new JSXNode(tag, props, toArray(children ?? []))
), "newJSXNode");
var form = /* @__PURE__ */ __name((props) => {
  if (typeof props.action === "function") {
    props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
  }
  return newJSXNode("form", props);
}, "form");
var formActionableElement = /* @__PURE__ */ __name((tag, props) => {
  if (typeof props.formAction === "function") {
    props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
  }
  return newJSXNode(tag, props);
}, "formActionableElement");
var input = /* @__PURE__ */ __name((props) => formActionableElement("input", props), "input");
var button = /* @__PURE__ */ __name((props) => formActionableElement("button", props), "button");

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap = /* @__PURE__ */ new Map([
  ["className", "class"],
  ["htmlFor", "for"],
  ["crossOrigin", "crossorigin"],
  ["httpEquiv", "http-equiv"],
  ["itemProp", "itemprop"],
  ["fetchPriority", "fetchpriority"],
  ["noModule", "nomodule"],
  ["formAction", "formaction"]
]);
var normalizeIntrinsicElementKey = /* @__PURE__ */ __name((key) => normalizeElementKeyMap.get(key) || key, "normalizeIntrinsicElementKey");
var styleObjectForEach = /* @__PURE__ */ __name((style2, fn) => {
  for (const [k, v] of Object.entries(style2)) {
    const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    fn(
      key,
      v == null ? null : typeof v === "number" ? !key.match(
        /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
      ) ? `${v}px` : `${v}` : v
    );
  }
}, "styleObjectForEach");

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext = void 0;
var getNameSpaceContext = /* @__PURE__ */ __name(() => nameSpaceContext, "getNameSpaceContext");
var toSVGAttributeName = /* @__PURE__ */ __name((key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
// Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
key.match(
  /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key, "toSVGAttributeName");
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "download",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var childrenToStringToBuffer = /* @__PURE__ */ __name((children, buffer) => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number" || child.isEscaped) {
      ;
      buffer[0] += child;
    } else if (child instanceof Promise) {
      buffer.unshift("", child);
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
}, "childrenToStringToBuffer");
var JSXNode = /* @__PURE__ */ __name(class {
  tag;
  props;
  key;
  children;
  isEscaped = true;
  localContexts;
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  get type() {
    return this.tag;
  }
  // Added for compatibility with libraries that rely on React's internal structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get ref() {
    return this.props.ref || null;
  }
  toString() {
    const buffer = [""];
    this.localContexts?.forEach(([context, value]) => {
      context.values.push(value);
    });
    try {
      this.toStringToBuffer(buffer);
    } finally {
      this.localContexts?.forEach(([context]) => {
        context.values.pop();
      });
    }
    return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const normalizeKey = nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
    for (let [key, v] of Object.entries(props)) {
      key = normalizeKey(key);
      if (key === "children") {
      } else if (key === "style" && typeof v === "object") {
        let styleStr = "";
        styleObjectForEach(v, (property, value) => {
          if (value != null) {
            styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
          }
        });
        buffer[0] += ' style="';
        escapeToBuffer(styleStr, buffer);
        buffer[0] += '"';
      } else if (typeof v === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (v === null || v === void 0) {
      } else if (typeof v === "number" || v.isEscaped) {
        buffer[0] += ` ${key}="${v}"`;
      } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
        if (v) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        }
        children = [raw(v.__html)];
      } else if (v instanceof Promise) {
        buffer[0] += ` ${key}="`;
        buffer.unshift('"', v);
      } else if (typeof v === "function") {
        if (!key.startsWith("on") && key !== "ref") {
          throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
        }
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag) && children.length === 0) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
}, "JSXNode");
var JSXFunctionNode = /* @__PURE__ */ __name(class extends JSXNode {
  toStringToBuffer(buffer) {
    const { children } = this;
    const props = { ...this.props };
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const res = this.tag.call(null, props);
    if (typeof res === "boolean" || res == null) {
      return;
    } else if (res instanceof Promise) {
      if (globalContexts.length === 0) {
        buffer.unshift("", res);
      } else {
        const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
        buffer.unshift(
          "",
          res.then((childRes) => {
            if (childRes instanceof JSXNode) {
              childRes.localContexts = currentContexts;
            }
            return childRes;
          })
        );
      }
    } else if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
      if (res.callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...res.callbacks);
      }
    } else {
      escapeToBuffer(res, buffer);
    }
  }
}, "JSXFunctionNode");
var JSXFragmentNode = /* @__PURE__ */ __name(class extends JSXNode {
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
}, "JSXFragmentNode");
var initDomRenderer = false;
var jsxFn = /* @__PURE__ */ __name((tag, props, children) => {
  if (!initDomRenderer) {
    for (const k in domRenderers) {
      ;
      components_exports[k][DOM_RENDERER] = domRenderers[k];
    }
    initDomRenderer = true;
  }
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else if (components_exports[tag]) {
    return new JSXFunctionNode(
      components_exports[tag],
      props,
      children
    );
  } else if (tag === "svg" || tag === "head") {
    nameSpaceContext ||= createContext("");
    return new JSXNode(tag, props, [
      new JSXFunctionNode(
        nameSpaceContext,
        {
          value: tag
        },
        children
      )
    ]);
  } else {
    return new JSXNode(tag, props, children);
  }
}, "jsxFn");
var Fragment = /* @__PURE__ */ __name(({
  children
}) => {
  return new JSXFragmentNode(
    "",
    {
      children
    },
    Array.isArray(children) ? children : children ? [children] : []
  );
}, "Fragment");

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}
__name(jsxDEV, "jsxDEV");

// src/components/Layout.tsx
var Layout = /* @__PURE__ */ __name(({
  title: title2 = "Prompt Base",
  description = "Browse thousands of AI-generated image and video prompts",
  children
}) => {
  return /* @__PURE__ */ jsxDEV("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV("head", { children: [
      /* @__PURE__ */ jsxDEV("meta", { charset: "UTF-8" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "description", content: description }),
      /* @__PURE__ */ jsxDEV("title", { children: title2 }),
      /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }),
      /* @__PURE__ */ jsxDEV("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap", rel: "stylesheet" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "stylesheet", href: "/styles.css" })
    ] }),
    /* @__PURE__ */ jsxDEV("body", { children: [
      /* @__PURE__ */ jsxDEV("div", { class: "app", children }),
      /* @__PURE__ */ jsxDEV("script", { src: "/app.js" })
    ] })
  ] });
}, "Layout");

// src/components/Header.tsx
var Header = /* @__PURE__ */ __name(({ currentPath = "/" }) => {
  const icons = {
    home: /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
      /* @__PURE__ */ jsxDEV("polyline", { points: "9 22 9 12 15 12 15 22" })
    ] }),
    explorer: /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
      /* @__PURE__ */ jsxDEV("path", { d: "M12 8v4l2 2" }),
      /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "12", r: "1" })
    ] }),
    images: /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxDEV("circle", { cx: "9", cy: "9", r: "2" }),
      /* @__PURE__ */ jsxDEV("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
    ] }),
    videos: /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("path", { d: "m22 8-6 4 6 4V8Z" }),
      /* @__PURE__ */ jsxDEV("rect", { width: "14", height: "12", x: "2", y: "6", rx: "2", ry: "2" })
    ] }),
    tags: /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("path", { d: "M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" }),
      /* @__PURE__ */ jsxDEV("path", { d: "M7 7h.01" })
    ] }),
    sparkle: /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: /* @__PURE__ */ jsxDEV("path", { d: "M12 3v5m0 8v5m9-9h-5m-8 0H3m15.364-6.364-3.536 3.536m-7.07 7.071-3.536 3.536M18.364 18.364l-3.536-3.536M7.757 7.757 4.221 4.221" }) })
  };
  const navLinks = [
    { href: "/", label: "Home", icon: icons.home },
    { href: "/explorer", label: "Explorer", icon: icons.explorer },
    { href: "/images", label: "Images", icon: icons.images },
    { href: "/videos", label: "Videos", icon: icons.videos },
    { href: "/tags", label: "Tags", icon: icons.tags }
  ];
  return /* @__PURE__ */ jsxDEV("header", { class: "header", children: /* @__PURE__ */ jsxDEV("div", { class: "header-container", children: [
    /* @__PURE__ */ jsxDEV("a", { href: "/", class: "logo", children: [
      /* @__PURE__ */ jsxDEV("span", { class: "logo-icon", children: icons.sparkle }),
      /* @__PURE__ */ jsxDEV("span", { class: "logo-text", children: "Prompt Base" })
    ] }),
    /* @__PURE__ */ jsxDEV("nav", { class: "nav", children: navLinks.map((link2) => /* @__PURE__ */ jsxDEV(
      "a",
      {
        href: link2.href,
        class: `nav-link ${currentPath === link2.href ? "active" : ""}`,
        children: [
          /* @__PURE__ */ jsxDEV("span", { class: "nav-icon", children: link2.icon }),
          /* @__PURE__ */ jsxDEV("span", { class: "nav-label", children: link2.label })
        ]
      }
    )) }),
    /* @__PURE__ */ jsxDEV("div", { class: "header-actions", children: [
      /* @__PURE__ */ jsxDEV("a", { href: "/search", class: "search-btn", "aria-label": "Search", children: /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
        /* @__PURE__ */ jsxDEV("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsxDEV("path", { d: "m21 21-4.35-4.35" })
      ] }) }),
      /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: "https://github.com/Ionic-Errrrs-Code/awesome-nanobanana-pro-prompts",
          target: "_blank",
          rel: "noopener noreferrer",
          class: "github-link",
          "aria-label": "View on GitHub",
          children: /* @__PURE__ */ jsxDEV("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" }) })
        }
      )
    ] })
  ] }) });
}, "Header");

// src/components/Footer.tsx
var Footer = /* @__PURE__ */ __name(() => {
  const sparkleIcon = /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "url(#footer-gradient)", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
    /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: "footer-gradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
      /* @__PURE__ */ jsxDEV("stop", { offset: "0%", "stop-color": "#ff2d75" }),
      /* @__PURE__ */ jsxDEV("stop", { offset: "50%", "stop-color": "#a855f7" }),
      /* @__PURE__ */ jsxDEV("stop", { offset: "100%", "stop-color": "#22d3ee" })
    ] }) }),
    /* @__PURE__ */ jsxDEV("path", { d: "M12 3v5m0 8v5m9-9h-5m-8 0H3m15.364-6.364-3.536 3.536m-7.07 7.071-3.536 3.536M18.364 18.364l-3.536-3.536M7.757 7.757 4.221 4.221" })
  ] });
  return /* @__PURE__ */ jsxDEV("footer", { class: "footer", children: /* @__PURE__ */ jsxDEV("div", { class: "footer-container", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "footer-brand", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "footer-logo", children: [
        sparkleIcon,
        /* @__PURE__ */ jsxDEV("span", { class: "footer-logo-text", children: "Prompt Base" })
      ] }),
      /* @__PURE__ */ jsxDEV("p", { class: "footer-tagline", children: "Your gateway to AI-generated creative prompts" })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "footer-links", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "footer-section", children: [
        /* @__PURE__ */ jsxDEV("h4", { children: "Browse" }),
        /* @__PURE__ */ jsxDEV("a", { href: "/explorer", children: "Explorer" }),
        /* @__PURE__ */ jsxDEV("a", { href: "/images", children: "Images" }),
        /* @__PURE__ */ jsxDEV("a", { href: "/videos", children: "Videos" }),
        /* @__PURE__ */ jsxDEV("a", { href: "/tags", children: "Tags" })
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "footer-section", children: [
        /* @__PURE__ */ jsxDEV("h4", { children: "Resources" }),
        /* @__PURE__ */ jsxDEV("a", { href: "https://github.com/your-username/prompt-base", target: "_blank", rel: "noopener", children: "GitHub Repository" }),
        /* @__PURE__ */ jsxDEV("a", { href: "https://your-website.example.com/", target: "_blank", rel: "noopener", children: "Your Company" }),
        /* @__PURE__ */ jsxDEV("a", { href: "https://play.google.com/store/apps/developer?id=Your+Company", target: "_blank", rel: "noopener", children: "Google Play" })
      ] })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "footer-bottom", children: /* @__PURE__ */ jsxDEV("p", { children: [
      "\xA9 2026 Prompt Base by ",
      /* @__PURE__ */ jsxDEV("a", { href: "https://github.com/your-username", target: "_blank", rel: "noopener", children: "Your Company" })
    ] }) })
  ] }) });
}, "Footer");

// src/components/TagChip.tsx
var TagChip = /* @__PURE__ */ __name(({
  name,
  count,
  size = "medium",
  clickable = true
}) => {
  const Tag = clickable ? "a" : "span";
  const props = clickable ? { href: `/search?tag=${encodeURIComponent(name)}` } : {};
  return /* @__PURE__ */ jsxDEV(Tag, { class: `tag-chip tag-chip-${size}`, ...props, children: [
    /* @__PURE__ */ jsxDEV("span", { class: "tag-name", children: name }),
    count !== void 0 && /* @__PURE__ */ jsxDEV("span", { class: "tag-count", children: count.toLocaleString() })
  ] });
}, "TagChip");

// src/pages/Home.tsx
var HomePage = /* @__PURE__ */ __name(({ stats, featuredTags }) => {
  const icons = {
    compass: /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsxDEV("polygon", { points: "16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" })
    ] }),
    search: /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("circle", { cx: "11", cy: "11", r: "8" }),
      /* @__PURE__ */ jsxDEV("path", { d: "m21 21-4.35-4.35" })
    ] }),
    image: /* @__PURE__ */ jsxDEV("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxDEV("circle", { cx: "9", cy: "9", r: "2" }),
      /* @__PURE__ */ jsxDEV("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
    ] }),
    video: /* @__PURE__ */ jsxDEV("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("path", { d: "m22 8-6 4 6 4V8Z" }),
      /* @__PURE__ */ jsxDEV("rect", { width: "14", height: "12", x: "2", y: "6", rx: "2", ry: "2" })
    ] }),
    tag: /* @__PURE__ */ jsxDEV("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsxDEV("path", { d: "M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" }),
      /* @__PURE__ */ jsxDEV("path", { d: "M7 7h.01" })
    ] })
  };
  return /* @__PURE__ */ jsxDEV(Layout, { title: "Prompt Base - AI Creative Prompts", children: [
    /* @__PURE__ */ jsxDEV(Header, { currentPath: "/" }),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: [
      /* @__PURE__ */ jsxDEV("section", { class: "hero", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "hero-bg" }),
        /* @__PURE__ */ jsxDEV("div", { class: "hero-content", children: [
          /* @__PURE__ */ jsxDEV("h1", { class: "hero-title", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "hero-title-line", children: "Discover" }),
            /* @__PURE__ */ jsxDEV("span", { class: "hero-title-gradient", children: "AI Creative Prompts" })
          ] }),
          /* @__PURE__ */ jsxDEV("p", { class: "hero-subtitle", children: [
            "Browse ",
            stats.total_items.toLocaleString(),
            "+ curated prompts for images and videos. Find inspiration for your next AI masterpiece."
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "hero-actions", children: [
            /* @__PURE__ */ jsxDEV("a", { href: "/explorer", class: "btn btn-primary btn-large", children: [
              icons.compass,
              " Start Exploring"
            ] }),
            /* @__PURE__ */ jsxDEV("a", { href: "/search", class: "btn btn-secondary btn-large", children: [
              icons.search,
              " Search Prompts"
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "hero-stats", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "stat-card", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "stat-icon", children: icons.image }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-value", children: stats.images.toLocaleString() }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-label", children: "Images" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "stat-card", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "stat-icon", children: icons.video }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-value", children: stats.videos.toLocaleString() }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-label", children: "Videos" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "stat-card", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "stat-icon", children: icons.tag }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-value", children: stats.tags }),
              /* @__PURE__ */ jsxDEV("span", { class: "stat-label", children: "Tags" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
        /* @__PURE__ */ jsxDEV("h2", { class: "section-title", children: "Quick Access" }),
        /* @__PURE__ */ jsxDEV("div", { class: "quick-cards", children: [
          /* @__PURE__ */ jsxDEV("a", { href: "/images", class: "quick-card quick-card-images", children: [
            /* @__PURE__ */ jsxDEV("img", { src: "/images/images-illustration.png", alt: "", class: "quick-card-illustration" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Image Prompts" }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              "Browse ",
              stats.images.toLocaleString(),
              " image generation prompts"
            ] }),
            /* @__PURE__ */ jsxDEV("span", { class: "quick-card-arrow", children: "\u2192" })
          ] }),
          /* @__PURE__ */ jsxDEV("a", { href: "/videos", class: "quick-card quick-card-videos", children: [
            /* @__PURE__ */ jsxDEV("img", { src: "/images/videos-illustration.png", alt: "", class: "quick-card-illustration" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Video Prompts" }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              "Discover ",
              stats.videos.toLocaleString(),
              " video generation prompts"
            ] }),
            /* @__PURE__ */ jsxDEV("span", { class: "quick-card-arrow", children: "\u2192" })
          ] }),
          /* @__PURE__ */ jsxDEV("a", { href: "/explorer", class: "quick-card quick-card-explorer", children: [
            /* @__PURE__ */ jsxDEV("img", { src: "/images/explorer-illustration.png", alt: "", class: "quick-card-illustration" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Random Explorer" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Infinite scroll through randomized prompts" }),
            /* @__PURE__ */ jsxDEV("span", { class: "quick-card-arrow", children: "\u2192" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section section-dark", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "section-header", children: [
          /* @__PURE__ */ jsxDEV("h2", { class: "section-title", children: "Popular Tags" }),
          /* @__PURE__ */ jsxDEV("a", { href: "/tags", class: "section-link", children: [
            "View all ",
            stats.tags,
            " tags \u2192"
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "tag-cloud", children: featuredTags.slice(0, 20).map((tag) => /* @__PURE__ */ jsxDEV(TagChip, { name: tag.name, count: tag.count, size: "large" })) })
      ] }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "github-cta", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "github-cta-content", children: [
          /* @__PURE__ */ jsxDEV("h2", { children: "Open Source" }),
          /* @__PURE__ */ jsxDEV("p", { children: "This project is open source! Star us on GitHub and contribute." })
        ] }),
        /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: "https://github.com/Ionic-Errrrs-Code/awesome-nanobanana-pro-prompts",
            target: "_blank",
            rel: "noopener",
            class: "btn btn-github",
            children: [
              /* @__PURE__ */ jsxDEV("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" }) }),
              "View on GitHub"
            ]
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "HomePage");

// src/components/MediaCard.tsx
var ImageIcon = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
  /* @__PURE__ */ jsxDEV("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsxDEV("circle", { cx: "9", cy: "9", r: "2" }),
  /* @__PURE__ */ jsxDEV("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
] }), "ImageIcon");
var VideoIcon = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
  /* @__PURE__ */ jsxDEV("path", { d: "m22 8-6 4 6 4V8Z" }),
  /* @__PURE__ */ jsxDEV("rect", { width: "14", height: "12", x: "2", y: "6", rx: "2", ry: "2" })
] }), "VideoIcon");
var MediaCard = /* @__PURE__ */ __name(({ item, showType = true }) => {
  const isVideo = item.type === "video";
  const hasMultipleImages = item.imgUrls && item.imgUrls.length > 0;
  const showCarousel = item.imgUrls && item.imgUrls.length > 1;
  const allImages = showCarousel ? item.imgUrls : [item.url];
  const cardId = `carousel-${item.id}`;
  return /* @__PURE__ */ jsxDEV("div", { class: "media-card", children: [
    /* @__PURE__ */ jsxDEV("a", { href: `/item/${item.id}`, class: "media-card-link-wrapper", children: /* @__PURE__ */ jsxDEV("div", { class: "media-card-image", children: [
      showCarousel ? (
        /* Carousel for multiple images */
        /* @__PURE__ */ jsxDEV("div", { class: "media-carousel", id: cardId, "data-current": "0", "data-total": allImages.length, children: [
          /* @__PURE__ */ jsxDEV("div", { class: "carousel-track", children: allImages.map((imgUrl, idx) => /* @__PURE__ */ jsxDEV(
            "img",
            {
              src: imgUrl,
              alt: `${item.title} - ${idx + 1}`,
              loading: "lazy",
              class: `carousel-slide ${idx === 0 ? "active" : ""}`,
              "data-index": idx,
              onerror: "this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22%3EImage unavailable%3C/text%3E%3C/svg%3E';"
            }
          )) }),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              class: "carousel-btn carousel-prev",
              onclick: `event.preventDefault(); event.stopPropagation(); carouselPrev('${cardId}')`,
              "aria-label": "Previous image",
              children: /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("polyline", { points: "15 18 9 12 15 6" }) })
            }
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              class: "carousel-btn carousel-next",
              onclick: `event.preventDefault(); event.stopPropagation(); carouselNext('${cardId}')`,
              "aria-label": "Next image",
              children: /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("polyline", { points: "9 18 15 12 9 6" }) })
            }
          ),
          /* @__PURE__ */ jsxDEV("div", { class: "carousel-dots", children: allImages.map((_, idx) => /* @__PURE__ */ jsxDEV("span", { class: `carousel-dot ${idx === 0 ? "active" : ""}`, "data-index": idx })) })
        ] })
      ) : isVideo ? /* @__PURE__ */ jsxDEV(
        "video",
        {
          src: item.url,
          poster: item.thumbnail,
          muted: true,
          loop: true,
          preload: "metadata",
          onmouseenter: "this.play()",
          onmouseleave: "this.pause(); this.currentTime = 0;"
        }
      ) : /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: item.url,
          alt: item.title,
          loading: "lazy",
          onerror: "this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22%3EImage unavailable%3C/text%3E%3C/svg%3E';"
        }
      ),
      showType && /* @__PURE__ */ jsxDEV("span", { class: `media-type-badge ${item.type}`, children: [
        isVideo ? /* @__PURE__ */ jsxDEV(VideoIcon, {}) : /* @__PURE__ */ jsxDEV(ImageIcon, {}),
        /* @__PURE__ */ jsxDEV("span", { children: item.type })
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "media-card-overlay", children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          class: "like-btn",
          "data-id": item.id,
          onclick: "event.preventDefault(); event.stopPropagation(); toggleLike(this);",
          children: [
            /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }) }),
            /* @__PURE__ */ jsxDEV("span", { class: "like-count", children: item.likes })
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxDEV("div", { class: "media-card-content", children: [
      /* @__PURE__ */ jsxDEV("a", { href: `/item/${item.id}`, class: "media-card-title-link", children: /* @__PURE__ */ jsxDEV("h3", { class: "media-card-title", children: item.title }) }),
      item.uploader && /* @__PURE__ */ jsxDEV("div", { class: "media-card-uploader", children: [
        /* @__PURE__ */ jsxDEV("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
          /* @__PURE__ */ jsxDEV("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
          /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "7", r: "4" })
        ] }),
        item.uploaderUrl ? /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: item.uploaderUrl,
            target: "_blank",
            rel: "noopener",
            class: "uploader-link",
            onclick: "event.stopPropagation();",
            children: item.uploader
          }
        ) : /* @__PURE__ */ jsxDEV("span", { class: "uploader-name", children: item.uploader })
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "media-card-tags", children: [
        item.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsxDEV("span", { class: "tag-chip-small", children: tag })),
        item.tags.length > 3 && /* @__PURE__ */ jsxDEV("span", { class: "tag-more", children: [
          "+",
          item.tags.length - 3
        ] })
      ] })
    ] })
  ] });
}, "MediaCard");
var MediaGrid = /* @__PURE__ */ __name(({ items, showType = true }) => {
  return /* @__PURE__ */ jsxDEV("div", { class: "media-grid", children: items.map((item) => /* @__PURE__ */ jsxDEV(MediaCard, { item, showType })) });
}, "MediaGrid");

// src/components/Pagination.tsx
var Pagination = /* @__PURE__ */ __name(({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {}
}) => {
  if (totalPages <= 1)
    return null;
  const buildUrl = /* @__PURE__ */ __name((page) => {
    const params = new URLSearchParams({ ...queryParams, page: String(page) });
    return `${baseUrl}?${params}`;
  }, "buildUrl");
  const pages = [];
  const siblingsCount = 2;
  const showFirstPages = 3;
  const showLastPages = 2;
  for (let i = 1; i <= Math.min(showFirstPages, totalPages); i++) {
    pages.push(i);
  }
  const leftStart = Math.max(showFirstPages + 1, currentPage - siblingsCount);
  if (leftStart > showFirstPages + 1) {
    pages.push("ellipsis");
  }
  for (let i = leftStart; i <= Math.min(totalPages - showLastPages, currentPage + siblingsCount); i++) {
    if (!pages.includes(i) && i > showFirstPages && i <= totalPages - showLastPages) {
      pages.push(i);
    }
  }
  const rightEnd = currentPage + siblingsCount;
  if (rightEnd < totalPages - showLastPages) {
    pages.push("ellipsis");
  }
  for (let i = Math.max(totalPages - showLastPages + 1, showFirstPages + 1); i <= totalPages; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }
  return /* @__PURE__ */ jsxDEV("nav", { class: "pagination", "aria-label": "Pagination", children: [
    currentPage > 1 && /* @__PURE__ */ jsxDEV("a", { href: buildUrl(1), class: "pagination-btn first", title: "First page", children: /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
      /* @__PURE__ */ jsxDEV("polyline", { points: "11 17 6 12 11 7" }),
      /* @__PURE__ */ jsxDEV("polyline", { points: "18 17 13 12 18 7" })
    ] }) }),
    currentPage > 1 && /* @__PURE__ */ jsxDEV("a", { href: buildUrl(currentPage - 1), class: "pagination-btn prev", children: [
      /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("polyline", { points: "15 18 9 12 15 6" }) }),
      /* @__PURE__ */ jsxDEV("span", { class: "pagination-btn-text", children: "Prev" })
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "pagination-pages", children: pages.map(
      (page, i) => page === "ellipsis" ? /* @__PURE__ */ jsxDEV("span", { class: "pagination-ellipsis", children: "\u2022\u2022\u2022" }, `ellipsis-${i}`) : /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: buildUrl(page),
          class: `pagination-page ${page === currentPage ? "active" : ""}`,
          children: page
        },
        page
      )
    ) }),
    currentPage < totalPages && /* @__PURE__ */ jsxDEV("a", { href: buildUrl(currentPage + 1), class: "pagination-btn next", children: [
      /* @__PURE__ */ jsxDEV("span", { class: "pagination-btn-text", children: "Next" }),
      /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("polyline", { points: "9 18 15 12 9 6" }) })
    ] }),
    currentPage < totalPages && /* @__PURE__ */ jsxDEV("a", { href: buildUrl(totalPages), class: "pagination-btn last", title: "Last page", children: /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
      /* @__PURE__ */ jsxDEV("polyline", { points: "13 17 18 12 13 7" }),
      /* @__PURE__ */ jsxDEV("polyline", { points: "6 17 11 12 6 7" })
    ] }) })
  ] });
}, "Pagination");

// src/pages/Gallery.tsx
var GalleryPage = /* @__PURE__ */ __name(({
  type,
  items,
  page,
  totalPages,
  total
}) => {
  const isImages = type === "images";
  const title2 = isImages ? "Image Prompts" : "Video Prompts";
  const icon = isImages ? "\u{1F5BC}\uFE0F" : "\u{1F3AC}";
  return /* @__PURE__ */ jsxDEV(Layout, { title: `${title2} - Prompt Base`, children: [
    /* @__PURE__ */ jsxDEV(Header, { currentPath: `/${type}` }),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: [
      /* @__PURE__ */ jsxDEV("section", { class: "page-header", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "page-header-content", children: [
        /* @__PURE__ */ jsxDEV("h1", { class: "page-title", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "page-icon", children: icon }),
          title2
        ] }),
        /* @__PURE__ */ jsxDEV("p", { class: "page-subtitle", children: [
          total.toLocaleString(),
          " ",
          isImages ? "image" : "video",
          " prompts available"
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
        /* @__PURE__ */ jsxDEV(MediaGrid, { items, showType: false }),
        /* @__PURE__ */ jsxDEV(
          Pagination,
          {
            currentPage: page,
            totalPages,
            baseUrl: `/${type}`
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "GalleryPage");

// src/pages/Explorer.tsx
var ExplorerPage = /* @__PURE__ */ __name(({
  items,
  seed,
  page,
  hasMore
}) => {
  return /* @__PURE__ */ jsxDEV(Layout, { title: "Explorer - Prompt Base", children: [
    /* @__PURE__ */ jsxDEV(Header, { currentPath: "/explorer" }),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: [
      /* @__PURE__ */ jsxDEV("section", { class: "page-header page-header-explorer", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "page-header-content", children: [
        /* @__PURE__ */ jsxDEV("h1", { class: "page-title", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "page-icon", children: "\u{1F3B2}" }),
          "Explorer"
        ] }),
        /* @__PURE__ */ jsxDEV("p", { class: "page-subtitle", children: "Discover random prompts. Refresh for a new adventure!" }),
        /* @__PURE__ */ jsxDEV("a", { href: "/explorer", class: "btn btn-secondary btn-small", children: "\u{1F504} Shuffle Feed" })
      ] }) }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
        /* @__PURE__ */ jsxDEV("div", { id: "explorer-grid", "data-seed": seed, "data-page": page, children: /* @__PURE__ */ jsxDEV(MediaGrid, { items }) }),
        hasMore && /* @__PURE__ */ jsxDEV("div", { class: "load-more-wrapper", children: /* @__PURE__ */ jsxDEV(
          "button",
          {
            id: "load-more-btn",
            class: "btn btn-primary btn-large",
            "data-seed": seed,
            "data-next-page": page + 1,
            children: "Load More"
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "ExplorerPage");

// src/pages/Tags.tsx
var TagsPage = /* @__PURE__ */ __name(({ tags, total }) => {
  return /* @__PURE__ */ jsxDEV(Layout, { title: "All Tags - Prompt Base", children: [
    /* @__PURE__ */ jsxDEV(Header, { currentPath: "/tags" }),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: [
      /* @__PURE__ */ jsxDEV("section", { class: "page-header", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "page-header-content", children: [
        /* @__PURE__ */ jsxDEV("h1", { class: "page-title", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "page-icon", children: "\u{1F3F7}\uFE0F" }),
          "All Tags"
        ] }),
        /* @__PURE__ */ jsxDEV("p", { class: "page-subtitle", children: [
          "Browse all ",
          total,
          " tags to find exactly what you're looking for"
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "tags-grid", children: tags.map((tag) => /* @__PURE__ */ jsxDEV("a", { href: `/search?tag=${encodeURIComponent(tag.name)}`, class: "tag-card", children: [
        /* @__PURE__ */ jsxDEV("span", { class: "tag-card-name", children: tag.name }),
        /* @__PURE__ */ jsxDEV("span", { class: "tag-card-count", children: [
          tag.count.toLocaleString(),
          " prompts"
        ] })
      ] })) }) }) })
    ] }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "TagsPage");

// src/pages/ItemDetail.tsx
var ItemDetailPage = /* @__PURE__ */ __name(({ item }) => {
  const isVideo = item.type === "video";
  const allImages = item.imgUrls && item.imgUrls.length > 0 ? item.imgUrls : [item.url];
  const hasMultipleImages = allImages.length > 1;
  return /* @__PURE__ */ jsxDEV(Layout, { title: `${item.title} - Prompt Base`, description: item.description, children: [
    /* @__PURE__ */ jsxDEV(Header, {}),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: /* @__PURE__ */ jsxDEV("section", { class: "item-detail", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
      /* @__PURE__ */ jsxDEV("a", { href: "#", onclick: "history.back(); return false;", class: "back-link-top", children: [
        /* @__PURE__ */ jsxDEV("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
          /* @__PURE__ */ jsxDEV("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
          /* @__PURE__ */ jsxDEV("polyline", { points: "12 19 5 12 12 5" })
        ] }),
        "Back"
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "item-detail-grid", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "item-media", children: isVideo ? /* @__PURE__ */ jsxDEV(
          "video",
          {
            src: item.url,
            poster: item.thumbnail,
            controls: true,
            loop: true,
            class: "item-video"
          }
        ) : hasMultipleImages ? (
          /* Image Gallery for multiple images */
          /* @__PURE__ */ jsxDEV("div", { class: "item-gallery", children: allImages.map((imgUrl, index) => /* @__PURE__ */ jsxDEV("a", { href: imgUrl, target: "_blank", rel: "noopener", class: "gallery-item", children: [
            /* @__PURE__ */ jsxDEV(
              "img",
              {
                src: imgUrl,
                alt: `${item.title} - Image ${index + 1}`,
                class: "gallery-image",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsxDEV("span", { class: "gallery-index", children: [
              index + 1,
              "/",
              allImages.length
            ] })
          ] })) })
        ) : /* @__PURE__ */ jsxDEV(
          "img",
          {
            src: item.url,
            alt: item.title,
            class: "item-image"
          }
        ) }),
        /* @__PURE__ */ jsxDEV("div", { class: "item-info", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "item-type-badge-large", children: isVideo ? "\u{1F3AC} Video Prompt" : "\u{1F5BC}\uFE0F Image Prompt" }),
          /* @__PURE__ */ jsxDEV("h1", { class: "item-title", children: item.title }),
          (item.uploader || item.sourceUrl) && /* @__PURE__ */ jsxDEV("div", { class: "item-attribution", children: [
            item.uploader && /* @__PURE__ */ jsxDEV("div", { class: "attribution-row", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "attribution-label", children: [
                /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
                  /* @__PURE__ */ jsxDEV("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
                  /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "7", r: "4" })
                ] }),
                "Shared by:"
              ] }),
              item.uploaderUrl ? /* @__PURE__ */ jsxDEV("a", { href: item.uploaderUrl, target: "_blank", rel: "noopener", class: "attribution-link", children: item.uploader }) : /* @__PURE__ */ jsxDEV("span", { class: "attribution-value", children: item.uploader })
            ] }),
            item.sourceUrl && /* @__PURE__ */ jsxDEV("div", { class: "attribution-row", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "attribution-label", children: [
                /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
                  /* @__PURE__ */ jsxDEV("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                  /* @__PURE__ */ jsxDEV("polyline", { points: "15 3 21 3 21 9" }),
                  /* @__PURE__ */ jsxDEV("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
                ] }),
                "Source:"
              ] }),
              /* @__PURE__ */ jsxDEV("a", { href: item.sourceUrl, target: "_blank", rel: "noopener", class: "attribution-link", children: "View Original Post" })
            ] })
          ] }),
          item.description && /* @__PURE__ */ jsxDEV("div", { class: "item-description", children: [
            /* @__PURE__ */ jsxDEV("h2", { children: "Description" }),
            /* @__PURE__ */ jsxDEV("p", { children: item.description })
          ] }),
          item.promptData && /* @__PURE__ */ jsxDEV("div", { class: "item-description", children: [
            /* @__PURE__ */ jsxDEV("h2", { children: "Prompt" }),
            /* @__PURE__ */ jsxDEV("div", { class: "prompt-box", children: [
              item.promptData.trim().startsWith("{") || item.promptData.trim().startsWith("[") ? /* @__PURE__ */ jsxDEV("pre", { class: "json-code", children: item.promptData }) : /* @__PURE__ */ jsxDEV("p", { children: item.promptData }),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  class: "copy-btn",
                  onclick: `navigator.clipboard.writeText(${JSON.stringify(item.promptData)});this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000);`,
                  children: "Copy"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "item-meta", children: /* @__PURE__ */ jsxDEV("div", { class: "item-likes", children: /* @__PURE__ */ jsxDEV(
            "button",
            {
              class: "like-btn-large",
              "data-id": item.id,
              onclick: "toggleLike(this);",
              children: [
                /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsxDEV("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }) }),
                /* @__PURE__ */ jsxDEV("span", { class: "like-count", children: item.likes }),
                " Likes"
              ]
            }
          ) }) }),
          item.tags.length > 0 && /* @__PURE__ */ jsxDEV("div", { class: "item-tags", children: [
            /* @__PURE__ */ jsxDEV("h3", { children: "Tags" }),
            /* @__PURE__ */ jsxDEV("div", { class: "tag-cloud", children: item.tags.map((tag) => /* @__PURE__ */ jsxDEV(TagChip, { name: tag, size: "medium" })) })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "item-actions", children: [
            /* @__PURE__ */ jsxDEV("a", { href: item.url, target: "_blank", rel: "noopener", class: "btn btn-primary", children: "Open Original" }),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                class: "btn btn-secondary",
                onclick: "history.back();",
                children: "\u2190 Go Back"
              }
            )
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "ItemDetailPage");

// src/components/SearchBar.tsx
var SearchBar = /* @__PURE__ */ __name(({
  query = "",
  tag = "",
  type = "",
  placeholder = "Search prompts..."
}) => {
  return /* @__PURE__ */ jsxDEV("form", { action: "/search", method: "GET", class: "search-form", children: [
    /* @__PURE__ */ jsxDEV("div", { class: "search-input-wrapper", children: [
      /* @__PURE__ */ jsxDEV("svg", { class: "search-icon", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: [
        /* @__PURE__ */ jsxDEV("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsxDEV("path", { d: "m21 21-4.35-4.35" })
      ] }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "text",
          name: "q",
          value: query,
          placeholder,
          class: "search-input",
          autocomplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxDEV("div", { class: "search-filters", children: [
      /* @__PURE__ */ jsxDEV("select", { name: "type", class: "search-select", children: [
        /* @__PURE__ */ jsxDEV("option", { value: "", children: "All Types" }),
        /* @__PURE__ */ jsxDEV("option", { value: "image", selected: type === "image", children: "\u{1F5BC}\uFE0F Images" }),
        /* @__PURE__ */ jsxDEV("option", { value: "video", selected: type === "video", children: "\u{1F3AC} Videos" })
      ] }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          type: "text",
          name: "tag",
          value: tag,
          placeholder: "Filter by tag...",
          class: "search-tag-input"
        }
      ),
      /* @__PURE__ */ jsxDEV("button", { type: "submit", class: "search-submit", children: "Search" })
    ] })
  ] });
}, "SearchBar");

// src/pages/Search.tsx
var SearchPage = /* @__PURE__ */ __name(({
  items,
  query,
  tag,
  type,
  page,
  totalPages,
  total
}) => {
  const hasFilters = query || tag || type;
  return /* @__PURE__ */ jsxDEV(Layout, { title: `Search${query ? `: ${query}` : ""} - Prompt Base`, children: [
    /* @__PURE__ */ jsxDEV(Header, { currentPath: "/search" }),
    /* @__PURE__ */ jsxDEV("main", { class: "main", children: [
      /* @__PURE__ */ jsxDEV("section", { class: "page-header", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV("div", { class: "page-header-content", children: [
        /* @__PURE__ */ jsxDEV("h1", { class: "page-title", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "page-icon", children: "\u{1F50D}" }),
          "Search Prompts"
        ] }),
        /* @__PURE__ */ jsxDEV("p", { class: "page-subtitle", children: "Find the perfect prompt from our collection" })
      ] }) }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "search-section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: /* @__PURE__ */ jsxDEV(SearchBar, { query, tag, type }) }) }),
      /* @__PURE__ */ jsxDEV("section", { class: "section", children: /* @__PURE__ */ jsxDEV("div", { class: "container", children: [
        hasFilters && /* @__PURE__ */ jsxDEV("div", { class: "search-results-header", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "results-count", children: [
            total.toLocaleString(),
            " result",
            total !== 1 ? "s" : "",
            " found",
            query && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              ' for "',
              /* @__PURE__ */ jsxDEV("strong", { children: query }),
              '"'
            ] }),
            tag && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              ' in tag "',
              /* @__PURE__ */ jsxDEV("strong", { children: tag }),
              '"'
            ] }),
            type && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              ' of type "',
              /* @__PURE__ */ jsxDEV("strong", { children: type }),
              '"'
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("a", { href: "/search", class: "clear-filters", children: "Clear filters" })
        ] }),
        items.length > 0 ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV(MediaGrid, { items }),
          /* @__PURE__ */ jsxDEV(
            Pagination,
            {
              currentPage: page,
              totalPages,
              baseUrl: "/search",
              queryParams: {
                ...query && { q: query },
                ...tag && { tag },
                ...type && { type }
              }
            }
          )
        ] }) : hasFilters ? /* @__PURE__ */ jsxDEV("div", { class: "empty-state", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "empty-icon", children: "\u{1F50D}" }),
          /* @__PURE__ */ jsxDEV("h2", { children: "No results found" }),
          /* @__PURE__ */ jsxDEV("p", { children: "Try adjusting your search or filters" }),
          /* @__PURE__ */ jsxDEV("a", { href: "/search", class: "btn btn-primary", children: "Clear filters" })
        ] }) : /* @__PURE__ */ jsxDEV("div", { class: "empty-state", children: [
          /* @__PURE__ */ jsxDEV("span", { class: "empty-icon", children: "\u{1F4A1}" }),
          /* @__PURE__ */ jsxDEV("h2", { children: "Start Searching" }),
          /* @__PURE__ */ jsxDEV("p", { children: "Enter a search term or select filters above" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxDEV(Footer, {})
  ] });
}, "SearchPage");

// src/index.tsx
var app = new Hono2();
var inlineCSS = `
/* =========================================
   Prompt Base - Comprehensive Styles
   ========================================= */

:root {
  --bg-primary: #0a0a12;
  --bg-secondary: #0f0f1a;
  --bg-tertiary: #161625;
  --bg-card: #1a1a2e;
  --bg-glass: rgba(255, 255, 255, 0.04);
  --bg-glass-hover: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.75);
  --text-muted: rgba(255, 255, 255, 0.5);
  --accent-magenta: #ff2d75;
  --accent-purple: #a855f7;
  --accent-cyan: #22d3ee;
  --accent-gold: #fbbf24;
  --accent-pink: #f472b6;
  --accent-green: #34d399;
  --gradient-primary: linear-gradient(135deg, #ff2d75 0%, #a855f7 50%, #22d3ee 100%);
  --gradient-magenta: linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%);
  --gradient-purple: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
  --gradient-cyan: linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%);
  --gradient-gold: linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%);
  --gradient-hero: radial-gradient(ellipse at 30% 20%, rgba(255, 45, 117, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 40%);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-glow: rgba(255, 45, 117, 0.4);
  --header-height: 72px;
  --container-max: 1400px;
  --container-padding: 24px;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.6);
  --shadow-glow-magenta: 0 0 40px rgba(255, 45, 117, 0.25);
  --shadow-glow-purple: 0 0 40px rgba(168, 85, 247, 0.25);
  --shadow-glow-cyan: 0 0 40px rgba(34, 211, 238, 0.25);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
img, video { max-width: 100%; height: auto; display: block; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }

.app { display: flex; flex-direction: column; min-height: 100vh; }
.main { flex: 1; padding-top: var(--header-height); }
.container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); }
.section { padding: 60px 0; }
.section-dark { background: var(--bg-secondary); }

.header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-height); background: rgba(10, 10, 18, 0.85); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid transparent; background-image: linear-gradient(rgba(10, 10, 18, 0.85), rgba(10, 10, 18, 0.85)), linear-gradient(90deg, rgba(255, 45, 117, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(34, 211, 238, 0.3) 100%); background-origin: padding-box, border-box; background-clip: padding-box, border-box; z-index: 1000; }
.header-container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.logo { display: flex; align-items: center; gap: 12px; font-size: 1.3rem; font-weight: 800; transition: all var(--transition-fast); text-decoration: none; }
.logo:hover { transform: scale(1.02); }
.logo-icon { font-size: 1.6rem; filter: drop-shadow(0 0 8px rgba(255, 45, 117, 0.5)); }
.logo-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; }
.nav { display: flex; align-items: center; gap: 6px; padding: 6px; background: var(--bg-glass); border-radius: 16px; border: 1px solid var(--border-color); }
.nav-link { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); transition: all var(--transition-fast); position: relative; overflow: hidden; }
.nav-link:hover { color: var(--text-primary); background: var(--bg-glass-hover); }
.nav-link.active { color: var(--text-primary); background: var(--gradient-primary); box-shadow: 0 4px 15px rgba(255, 45, 117, 0.3); }
.nav-icon { font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.search-btn, .github-link { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; color: var(--text-secondary); background: var(--bg-glass); border: 1px solid var(--border-color); transition: all var(--transition-fast); }
.search-btn:hover, .github-link:hover { color: var(--text-primary); background: var(--bg-glass-hover); border-color: var(--accent-purple); box-shadow: var(--shadow-glow-purple); transform: translateY(-2px); }

.hero { position: relative; padding: 120px 0 100px; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background: var(--gradient-hero); pointer-events: none; }
.hero-bg::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255, 45, 117, 0.03) 60deg, transparent 120deg, rgba(168, 85, 247, 0.03) 180deg, transparent 240deg, rgba(34, 211, 238, 0.03) 300deg, transparent 360deg); animation: rotate 30s linear infinite; }
.hero-bg::after { content: ''; position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255, 45, 117, 0.08) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 70%); animation: pulse 6s ease-in-out infinite; filter: blur(40px); }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.2); } }
.hero-content { position: relative; max-width: 900px; margin: 0 auto; padding: 0 var(--container-padding); text-align: center; }
.hero-title { font-size: clamp(2.8rem, 7vw, 4.5rem); font-weight: 800; line-height: 1.05; margin-bottom: 28px; letter-spacing: -0.03em; }
.hero-title-line { display: block; color: var(--text-muted); font-weight: 500; font-size: 0.4em; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; }
.hero-title-gradient { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }
.hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 48px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 72px; }
.hero-stats { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
.stat-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 36px; background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: var(--radius-lg); min-width: 150px; transition: all var(--transition-normal); position: relative; overflow: hidden; }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--gradient-primary); opacity: 0; transition: opacity var(--transition-fast); }
.stat-card:hover { transform: translateY(-4px); border-color: var(--accent-magenta); }
.stat-card:hover::before { opacity: 1; }
.stat-icon { font-size: 2.2rem; line-height: 1; }
.stat-value { font-size: 2rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 28px; font-size: 0.95rem; font-weight: 600; border-radius: var(--radius-md); transition: all var(--transition-normal); cursor: pointer; border: none; text-decoration: none; }
.btn-large { padding: 18px 36px; font-size: 1rem; border-radius: var(--radius-lg); }
.btn-small { padding: 10px 18px; font-size: 0.85rem; }
.btn-primary { background: var(--gradient-primary); color: #fff; box-shadow: 0 4px 20px rgba(255, 45, 117, 0.35); position: relative; overflow: hidden; }
.btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%); opacity: 0; transition: opacity var(--transition-fast); }
.btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 30px rgba(255, 45, 117, 0.45); }
.btn-primary:hover::before { opacity: 1; }
.btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); backdrop-filter: blur(10px); }
.btn-secondary:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); box-shadow: var(--shadow-glow-purple); }
.btn-github { background: linear-gradient(135deg, #24292f 0%, #1a1e22 100%); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
.btn-github:hover { background: linear-gradient(135deg, #2c3238 0%, #24292f 100%); transform: translateY(-2px); }

.quick-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.quick-card { position: relative; padding: 36px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-normal); text-decoration: none; display: flex; flex-direction: column; gap: 16px; }
.quick-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--gradient-primary); opacity: 0; transition: opacity var(--transition-normal); }
.quick-card::after { content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: radial-gradient(circle, var(--card-glow, rgba(255, 45, 117, 0.08)) 0%, transparent 70%); opacity: 0; transition: opacity var(--transition-normal); pointer-events: none; }
.quick-card:hover { transform: translateY(-6px); border-color: var(--card-border, var(--accent-magenta)); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), var(--card-shadow, var(--shadow-glow-magenta)); }
.quick-card:hover::before { opacity: 1; }
.quick-card:hover::after { opacity: 1; }
.quick-card-images { --card-glow: rgba(34, 211, 238, 0.1); --card-border: var(--accent-cyan); --card-shadow: var(--shadow-glow-cyan); }
.quick-card-videos { --card-glow: rgba(244, 114, 182, 0.1); --card-border: var(--accent-pink); --card-shadow: 0 0 40px rgba(244, 114, 182, 0.25); }
.quick-card-explorer { --card-glow: rgba(251, 191, 36, 0.1); --card-border: var(--accent-gold); --card-shadow: 0 0 40px rgba(251, 191, 36, 0.2); }
.quick-card-icon { font-size: 3rem; line-height: 1; }
.quick-card-illustration { width: 120px; height: 120px; object-fit: contain; margin-bottom: 8px; }
.quick-card h3 { font-size: 1.35rem; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.quick-card p { color: var(--text-secondary); font-size: 0.95rem; margin: 0; line-height: 1.6; }
.quick-card-arrow { position: absolute; bottom: 28px; right: 28px; font-size: 1.5rem; color: var(--accent-magenta); opacity: 0; transform: translateX(-10px); transition: all var(--transition-normal); }
.quick-card:hover .quick-card-arrow { opacity: 1; transform: translateX(0); }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.section-title { font-size: 1.75rem; font-weight: 700; }
.section-link { color: var(--accent-purple); font-weight: 500; transition: color var(--transition-fast); }
.section-link:hover { color: var(--accent-cyan); }
.back-link-top { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; color: var(--text-secondary); font-weight: 500; transition: color var(--transition-fast); }
.back-link-top:hover { color: var(--accent-purple); text-decoration: none; }

.page-header { padding: 60px 0 40px; background: var(--gradient-hero); }
.page-header-explorer { text-align: center; }
.page-header-content { display: flex; flex-direction: column; gap: 12px; }
.page-title { display: flex; align-items: center; gap: 16px; font-size: 2.5rem; font-weight: 700; }
.page-icon { font-size: 1em; }
.page-subtitle { color: var(--text-secondary); font-size: 1.1rem; }

.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.media-card { display: flex; flex-direction: column; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal); animation: fadeIn 0.4s ease backwards; }
.media-card:hover { transform: translateY(-4px); border-color: rgba(139, 92, 246, 0.3); box-shadow: var(--shadow-lg); }
.media-card-image { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--bg-tertiary); }
.media-card-image > img, .media-card-image > video { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.media-card:hover .media-card-image > img, .media-card:hover .media-card-image > video { transform: scale(1.05); }
.media-type-badge { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; z-index: 2; display: flex; align-items: center; gap: 4px; }
.media-type-badge.image { color: var(--accent-cyan); }
.media-type-badge.video { color: var(--accent-pink); }
.media-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); opacity: 0; transition: opacity var(--transition-normal); z-index: 3; }
.media-card:hover .media-card-overlay { opacity: 1; }
/* Fixed like button - no flicker on hover */
.like-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(30, 30, 50, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; color: #fff; font-size: 0.85rem; font-weight: 500; transition: background var(--transition-fast), border-color var(--transition-fast); }
.like-btn:hover { background: rgba(236, 72, 153, 0.4); border-color: rgba(236, 72, 153, 0.5); }
.like-btn.liked { background: var(--accent-pink); border-color: var(--accent-pink); }
.like-btn svg { width: 18px; height: 18px; }
.like-btn.liked svg { fill: currentColor; }
.media-card-content { padding: 20px; }
.media-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.media-card-desc { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* Uploader info on cards */
.media-card-uploader { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; }
.media-card-uploader svg { opacity: 0.6; flex-shrink: 0; }
.uploader-link { color: var(--accent-cyan); transition: color var(--transition-fast); }
.uploader-link:hover { color: var(--accent-purple); text-decoration: underline; }
.uploader-name { color: var(--text-secondary); }
/* Carousel for multi-image cards */
.media-carousel { position: relative; width: 100%; height: 100%; }
.carousel-track { position: relative; width: 100%; height: 100%; }
/* First slide is relative to establish height, others are absolute on top */
.carousel-slide { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease; }
.carousel-slide:first-child { position: relative; display: block; }
.carousel-slide:not(:first-child) { position: absolute; top: 0; left: 0; }
.carousel-slide:not(.active) { opacity: 0; pointer-events: none; }
.carousel-slide.active { opacity: 1; pointer-events: auto; z-index: 1; }
.carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: #fff; cursor: pointer; opacity: 0; transition: opacity var(--transition-fast), background var(--transition-fast); z-index: 5; }
.media-card:hover .carousel-btn { opacity: 1; }
.carousel-btn:hover { background: rgba(168, 85, 247, 0.8); }
.carousel-prev { left: 8px; }
.carousel-next { right: 8px; }
.carousel-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 4; }
.carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); transition: background var(--transition-fast), transform var(--transition-fast); }
.carousel-dot.active { background: #fff; transform: scale(1.2); }
.media-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip-small { padding: 4px 10px; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.75rem; color: var(--text-muted); }
.tag-more { padding: 4px 10px; background: var(--bg-glass); border-radius: 6px; font-size: 0.75rem; color: var(--accent-purple); }

.tag-cloud { display: flex; flex-wrap: wrap; gap: 12px; }
.tag-chip { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; transition: all var(--transition-fast); }
.tag-chip:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); }
.tag-chip-large { padding: 12px 20px; font-size: 0.95rem; }
.tag-name { font-weight: 500; }
.tag-count { color: var(--text-muted); font-size: 0.85em; }
.tags-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.tag-card { display: flex; flex-direction: column; gap: 4px; padding: 20px 24px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; transition: all var(--transition-fast); }
.tag-card:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); }
.tag-card-name { font-weight: 600; font-size: 1rem; }
.tag-card-count { color: var(--text-muted); font-size: 0.85rem; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 48px; flex-wrap: wrap; }
.pagination-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-weight: 500; transition: all var(--transition-fast); }
.pagination-btn:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-1px); }
.pagination-btn.first, .pagination-btn.last { padding: 10px 12px; }
.pagination-btn-text { display: inline; }
@media (max-width: 600px) { .pagination-btn-text { display: none; } }
.pagination-pages { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center; }
.pagination-page { display: flex; align-items: center; justify-content: center; min-width: 40px; height: 40px; padding: 0 8px; border-radius: 8px; font-weight: 500; transition: all var(--transition-fast); background: var(--bg-glass); border: 1px solid transparent; }
.pagination-page:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); }
.pagination-page.active { background: var(--gradient-primary); color: #fff; border-color: transparent; box-shadow: 0 2px 10px rgba(255, 45, 117, 0.3); }
.pagination-ellipsis { color: var(--text-muted); padding: 0 4px; font-size: 0.9rem; }

.search-section { padding: 24px 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); }
.search-form { display: flex; flex-direction: column; gap: 16px; }
.search-input-wrapper { position: relative; }
.search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 18px 20px 18px 56px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 14px; color: var(--text-primary); font-size: 1rem; transition: border-color var(--transition-fast); }
.search-input:focus { outline: none; border-color: var(--accent-purple); }
.search-input::placeholder { color: var(--text-muted); }
.search-filters { display: flex; gap: 12px; flex-wrap: wrap; }
.search-select, .search-tag-input { padding: 12px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-size: 0.9rem; }
.search-select { min-width: 140px; }
.json-code { font-family: 'Fira Code', monospace; background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 8px; font-size: 0.9rem; line-height: 1.5; color: #a7f3d0; white-space: pre-wrap; word-break: break-all; border: 1px solid rgba(255, 255, 255, 0.1); }
.search-tag-input { flex: 1; min-width: 200px; }
.search-submit { padding: 12px 28px; background: var(--gradient-primary); border-radius: 10px; color: #fff; font-weight: 600; transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.search-submit:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); }
.search-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.results-count { color: var(--text-secondary); }
.results-count strong { color: var(--text-primary); }
.clear-filters { color: var(--accent-purple); font-weight: 500; }
.clear-filters:hover { text-decoration: underline; }

.item-detail { padding: 60px 0; }
.item-detail-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
/* Stacked layout always - removed desktop columns */
.item-media { background: var(--bg-secondary); border-radius: 20px; overflow: hidden; }
.item-image, .item-video { width: 100%; max-height: 600px; object-fit: contain; background: var(--bg-tertiary); }
.item-info { display: flex; flex-direction: column; gap: 24px; }
.item-type-badge-large { display: inline-flex; align-self: flex-start; padding: 8px 16px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.85rem; font-weight: 600; }
.item-title { font-size: 1.75rem; font-weight: 700; line-height: 1.3; }
.item-description h2 { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.prompt-box { position: relative; padding: 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; }
.prompt-box p { font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); white-space: pre-wrap; }
.copy-btn { position: absolute; top: 12px; right: 12px; padding: 8px 14px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 0.8rem; font-weight: 500; transition: all var(--transition-fast); }
.copy-btn:hover { background: var(--accent-purple); border-color: var(--accent-purple); }
.like-btn-large { display: inline-flex; align-items: center; gap: 10px; padding: 14px 24px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-primary); font-size: 1rem; font-weight: 500; transition: all var(--transition-fast); }
.like-btn-large:hover { background: rgba(236, 72, 153, 0.2); border-color: var(--accent-pink); }
.like-btn-large.liked { background: var(--accent-pink); border-color: var(--accent-pink); }
.like-btn-large svg { width: 22px; height: 22px; }
.item-tags h3 { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.item-actions { display: flex; gap: 12px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid var(--border-color); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 24px; }
.empty-state h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 8px; }
.empty-state p { color: var(--text-secondary); margin-bottom: 24px; }

.load-more-wrapper { display: flex; justify-content: center; margin-top: 48px; }

.github-cta { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 40px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 20px; flex-wrap: wrap; }
.github-cta h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
.github-cta p { color: var(--text-secondary); }

.footer { background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%); border-top: 1px solid transparent; background-image: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%), linear-gradient(90deg, rgba(255, 45, 117, 0.2) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(34, 211, 238, 0.2) 100%); background-origin: padding-box, border-box; background-clip: padding-box, border-box; padding: 80px 0 40px; position: relative; }
.footer::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%); pointer-events: none; }
.footer-container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); position: relative; }
.footer-brand { margin-bottom: 48px; }
.footer-logo { font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.footer-logo-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.footer-tagline { color: var(--text-muted); font-size: 0.95rem; }
.footer-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 40px; margin-bottom: 48px; }
.footer-section h4 { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 20px; }
.footer-section a { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); padding: 8px 0; transition: all var(--transition-fast); font-size: 0.95rem; }
.footer-section a:hover { color: var(--text-primary); transform: translateX(4px); }
.footer-bottom { padding-top: 32px; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.9rem; }
.footer-bottom a { color: var(--accent-magenta); transition: color var(--transition-fast); }
.footer-bottom a:hover { color: var(--accent-pink); text-decoration: none; }

/* Multi-image badge on cards */
.media-multi-badge { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 4px; padding: 6px 10px; background: rgba(168, 85, 247, 0.9); backdrop-filter: blur(10px); border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: #fff; }
.media-multi-badge svg { opacity: 0.9; }

/* Image gallery on detail page */
.item-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.gallery-item { position: relative; display: block; border-radius: 12px; overflow: hidden; background: var(--bg-tertiary); transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.gallery-item:hover { transform: scale(1.02); box-shadow: var(--shadow-lg); }
.gallery-image { width: 100%; height: auto; display: block; }
.gallery-index { position: absolute; bottom: 8px; right: 8px; padding: 4px 10px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); border-radius: 6px; font-size: 0.75rem; font-weight: 500; color: #fff; }
.image-count-badge { margin-left: 8px; padding: 2px 8px; background: var(--accent-purple); border-radius: 6px; font-size: 0.75rem; }

/* Attribution section */
.item-attribution { display: flex; flex-direction: column; gap: 12px; padding: 16px 20px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px; }
.attribution-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.attribution-label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.9rem; }
.attribution-label svg { opacity: 0.7; }
.attribution-link { color: var(--accent-cyan); font-weight: 500; transition: color var(--transition-fast); }
.attribution-link:hover { color: var(--accent-purple); text-decoration: underline; }
.attribution-value { color: var(--text-primary); font-weight: 500; }

@media (max-width: 768px) {
  :root { --container-padding: 16px; }
  .nav-label { display: none; }
  .nav-link { padding: 10px 12px; }
  .hero { padding: 60px 0 40px; }
  .hero-stats { gap: 12px; }
  .stat-card { padding: 16px 20px; min-width: 100px; }
  .page-title { font-size: 1.75rem; }
  .media-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .search-filters { flex-direction: column; }
  .search-select, .search-tag-input { width: 100%; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.media-card:nth-child(1) { animation-delay: 0.05s; }
.media-card:nth-child(2) { animation-delay: 0.1s; }
.media-card:nth-child(3) { animation-delay: 0.15s; }
.media-card:nth-child(4) { animation-delay: 0.2s; }
.media-card:nth-child(5) { animation-delay: 0.25s; }
.media-card:nth-child(6) { animation-delay: 0.3s; }
`;
var inlineJS = `
async function toggleLike(button) {
  const id = button.dataset.id;
  const countEl = button.querySelector('.like-count');
  const isLiked = button.classList.contains('liked');
  try {
    const method = isLiked ? 'DELETE' : 'POST';
    const res = await fetch('/api/like/' + id, { method });
    const data = await res.json();
    if (data.likes !== undefined) {
      countEl.textContent = data.likes;
      button.classList.toggle('liked');
    }
  } catch (error) { console.error('Error toggling like:', error); }
}

// Carousel navigation functions
function carouselNext(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const current = parseInt(carousel.dataset.current);
  const total = parseInt(carousel.dataset.total);
  const next = (current + 1) % total;
  updateCarousel(carousel, next);
}

function carouselPrev(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const current = parseInt(carousel.dataset.current);
  const total = parseInt(carousel.dataset.total);
  const prev = current === 0 ? total - 1 : current - 1;
  updateCarousel(carousel, prev);
}

function updateCarousel(carousel, newIndex) {
  carousel.dataset.current = newIndex;
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === newIndex);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === newIndex);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      const grid = document.getElementById('explorer-grid');
      const seed = loadMoreBtn.dataset.seed;
      const nextPage = parseInt(loadMoreBtn.dataset.nextPage);
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';
      try {
        const res = await fetch('/api/explorer?seed=' + seed + '&page=' + nextPage + '&limit=30');
        const data = await res.json();
        const mediaGrid = grid.querySelector('.media-grid');
        data.data.forEach(item => {
          const card = document.createElement('a');
          card.href = '/item/' + item.id;
          card.className = 'media-card';
          card.innerHTML = '<div class="media-card-image">' +
            (item.type === 'video' ? '<video src="' + item.url + '" muted loop preload="metadata"></video>' : '<img src="' + item.url + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"/>') +
            '<span class="media-type-badge ' + item.type + '">' + (item.type === 'video' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>') + ' <span>' + item.type + '</span></span>' +
            '<div class="media-card-overlay"><button class="like-btn" data-id="' + item.id + '" onclick="event.preventDefault();event.stopPropagation();toggleLike(this);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="like-count">' + item.likes + '</span></button></div></div>' +
            '<div class="media-card-content"><h3 class="media-card-title">' + item.title + '</h3>' +
            (item.description ? '<p class="media-card-desc">' + item.description.slice(0, 120) + '...</p>' : '') +
            '<div class="media-card-tags">' + item.tags.slice(0, 3).map(t => '<span class="tag-chip-small">' + t + '</span>').join('') +
            (item.tags.length > 3 ? '<span class="tag-more">+' + (item.tags.length - 3) + '</span>' : '') +
            '</div></div>';
          mediaGrid.appendChild(card);
        });
        if (data.has_more) {
          loadMoreBtn.dataset.nextPage = nextPage + 1;
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load More';
        } else {
          loadMoreBtn.parentElement.remove();
        }
      } catch (error) {
        console.error('Error loading more:', error);
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Try Again';
      }
    });
  }
  document.querySelectorAll('.media-card video').forEach(video => {
    const card = video.closest('.media-card');
    card.addEventListener('mouseenter', () => video.play());
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });
});
`;
app.get("/styles.css", (c) => {
  return c.text(inlineCSS, 200, { "Content-Type": "text/css" });
});
app.get("/app.js", (c) => {
  return c.text(inlineJS, 200, { "Content-Type": "application/javascript" });
});
app.get("/api/debug-manifest", (c) => {
  return c.json(manifest);
});
app.get("/", async (c) => {
  let tagsData = { tags: [], total: 0 };
  try {
    tagsData = await fetchTags();
  } catch (e) {
    console.error("Home Page Error (Tags):", e);
  }
  const stats = {
    total_items: 5514,
    images: 3611,
    videos: 1903,
    tags: tagsData.total || 0
  };
  return c.html(/* @__PURE__ */ jsxDEV(HomePage, { stats, featuredTags: tagsData.tags }));
});
app.get("/explorer", async (c) => {
  const seed = c.req.query("seed");
  const page = parseInt(c.req.query("page") || "1");
  let data = { data: [], seed: "", page: 1, has_more: false, next_page: null, limit: 30, total: 0, total_pages: 0 };
  try {
    data = await fetchExplorer(seed, page, 30);
  } catch (e) {
    console.error("Explorer Error:", e);
  }
  return c.html(
    /* @__PURE__ */ jsxDEV(
      ExplorerPage,
      {
        items: data.data,
        seed: data.seed,
        page: data.page,
        hasMore: data.has_more
      }
    )
  );
});
app.get("/images", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  let data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
  try {
    data = await fetchImages(page, 24);
  } catch (e) {
    console.error("Images Gallery Error:", e);
  }
  const shuffledItems = [...data.data || []].sort(() => Math.random() - 0.5);
  return c.html(
    /* @__PURE__ */ jsxDEV(
      GalleryPage,
      {
        type: "images",
        items: shuffledItems,
        page: data.page,
        totalPages: data.total_pages,
        total: data.total
      }
    )
  );
});
app.get("/videos", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  let data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
  try {
    data = await fetchVideos(page, 24);
  } catch (e) {
    console.error("Videos Gallery Error:", e);
  }
  const shuffledItems = [...data.data || []].sort(() => Math.random() - 0.5);
  return c.html(
    /* @__PURE__ */ jsxDEV(
      GalleryPage,
      {
        type: "videos",
        items: shuffledItems,
        page: data.page,
        totalPages: data.total_pages,
        total: data.total
      }
    )
  );
});
app.get("/tags", async (c) => {
  let data = { tags: [], total: 0 };
  try {
    data = await fetchTags();
  } catch (e) {
    console.error("Tags Page Error:", e);
  }
  return c.html(/* @__PURE__ */ jsxDEV(TagsPage, { tags: data.tags, total: data.total }));
});
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const tag = c.req.query("tag");
  const type = c.req.query("type");
  const page = parseInt(c.req.query("page") || "1");
  const hasFilters = query || tag || type;
  let data;
  if (hasFilters) {
    try {
      data = await search(query, tag, void 0, type, page, 24);
    } catch (e) {
      console.error("Search Error:", e);
      data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
    }
  } else {
    data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
  }
  return c.html(
    /* @__PURE__ */ jsxDEV(
      SearchPage,
      {
        items: data.data,
        query,
        tag,
        type,
        page: data.page,
        totalPages: data.total_pages,
        total: data.total
      }
    )
  );
});
app.get("/item/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const item = await getItem(id);
    return c.html(/* @__PURE__ */ jsxDEV(ItemDetailPage, { item }));
  } catch (e) {
    console.error("Item Detail Error:", e);
    return c.text("Item not found or API unavailable", 404);
  }
});
app.post("/api/like/:id", async (c) => {
  const id = c.req.param("id");
  const result = await likeItem(id);
  return c.json(result);
});
app.delete("/api/like/:id", async (c) => {
  const id = c.req.param("id");
  const result = await unlikeItem(id);
  return c.json(result);
});
app.get("/api/explorer", async (c) => {
  const seed = c.req.query("seed");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "30");
  const data = await fetchExplorer(seed, page, limit);
  return c.json(data);
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-H3LOJa/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-H3LOJa/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
