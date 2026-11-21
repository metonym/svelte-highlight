import javascriptRegister from "highlight.js/lib/languages/javascript";

// The `.http` / `.rest` request file read by VS Code REST Client and the
// JetBrains HTTP Client. `GRAPHQL` and `WEBSOCKET` are JetBrains request
// kinds; `MKCOL` and the rest come from WebDAV.
const HTTPFILE_METHODS =
  "GET HEAD POST PUT DELETE CONNECT OPTIONS TRACE PATCH " +
  "PROPFIND PROPPATCH MKCOL COPY MOVE LOCK UNLOCK GRAPHQL WEBSOCKET";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHttpfile(hljs) {
  // `{{host}}`, `{{$guid}}`, `{{$dotenv API_KEY}}`,
  // `{{login.response.body.$.token}}`. System variables start with `$`.
  const INTERPOLATION = {
    className: "template-variable",
    begin: /\{\{/,
    end: /\}\}/,
    contains: [{ className: "built_in", begin: /\$[A-Za-z]\w*/ }],
    relevance: 0,
  };

  // `###` opens a new request; any text after it is the request's title.
  const SEPARATOR = {
    className: "section",
    begin: /^###/,
    end: /$/,
  };

  // `# @name login`, `// @no-redirect`, `# @timeout 30`.
  const DIRECTIVE = {
    begin: [/^[ \t]*(?:#|\/\/)[ \t]*/, /@[A-Za-z][\w-]*/],
    beginScope: { 1: "comment", 2: "meta" },
    end: /$/,
    contains: [INTERPOLATION],
  };

  // Comments only count at the start of a line, so a `#fragment` in a URL
  // stays part of the URL.
  const COMMENT = {
    className: "comment",
    begin: /^[ \t]*(?:#|\/\/)/,
    end: /$/,
    relevance: 0,
  };

  // `@host = example.com`
  const FILE_VARIABLE = {
    begin: [/^@[A-Za-z_][\w.-]*/, /[ \t]*/, /=/],
    beginScope: { 1: "variable", 3: "operator" },
    end: /$/,
    contains: [INTERPOLATION],
  };

  const HTTP_VERSION = {
    className: "meta",
    begin: /\bHTTP\/\d(?:\.\d)?\b/,
  };

  // The URL runs to the next space. `returnBegin` lets an interpolation at
  // its very start (`{{baseUrl}}/users`) match too.
  const URL = {
    className: "string",
    begin: /(?!HTTP\/)\S/,
    returnBegin: true,
    end: /(?=\s)|$/,
    contains: [INTERPOLATION],
  };

  const REQUEST_LINE = {
    className: "keyword",
    begin: new RegExp(
      String.raw`^(?:${HTTPFILE_METHODS.split(" ").join("|")})(?=[ \t])`,
    ),
    starts: {
      end: /$/,
      contains: [HTTP_VERSION, URL],
    },
  };

  // A request line may leave out the method (`https://example.com` is a
  // GET), and long query strings may continue on indented `?` / `&` lines.
  // `{{baseUrl}}/path` counts as a URL; a lone `{{value}}` body does not.
  const BARE_URL = {
    className: "string",
    begin: /^(?=https?:\/\/|\{\{[^}\n]*\}\}\/)/,
    end: /(?=\s)|$/,
    contains: [INTERPOLATION],
    starts: { end: /$/, contains: [HTTP_VERSION] },
  };

  const QUERY_CONTINUATION = {
    className: "string",
    begin: /^[ \t]+[?&]/,
    end: /$/,
    contains: [INTERPOLATION],
  };

  const HEADER = {
    begin: [/^[A-Za-z][\w-]*/, /:/],
    beginScope: { 1: "attribute", 2: "punctuation" },
    end: /$/,
    contains: [INTERPOLATION],
  };

  // `> {% client.test(...) %}` runs after the response; JetBrains also
  // accepts `< {% ... %}` before the request.
  const SCRIPT = {
    begin: /^[<>][ \t]*\{%/,
    end: /%\}/,
    beginScope: "meta",
    endScope: "meta",
    subLanguage: "javascript",
  };

  // `< ./body.json` reads the body from a file (`<@` substitutes variables
  // in it); `> ./handler.js` runs a handler file; `>> out.json` and
  // `>>! out.json` save the response.
  const FILE_REFERENCE = {
    begin: [/^(?:>>!?|<@?|>)/, /[ \t]+/, /\S.*$/],
    beginScope: { 1: "operator", 3: "string" },
  };

  // `--boundary` lines in a multipart/form-data body.
  const BOUNDARY = {
    className: "meta",
    begin: /^--[\w'()+,./:=?-]+$/,
    relevance: 0,
  };

  // JSON-shaped bodies, highlighted in place rather than through the json
  // grammar so `{{...}}` stays visible inside them.
  const JSON_KEY = {
    className: "attr",
    begin: /"(?:[^"\\\n]|\\.)*"(?=\s*:)/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"|$/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "HTTP Request File",
    aliases: ["rest"],
    // A single request in this format is also a valid stock `http` sample,
    // and `###` / `#` lines read like Markdown or shell. Auto-detection
    // would steal from those grammars, so this one is opt-in only.
    disableAutodetect: true,
    keywords: {
      literal: "true false null",
    },
    contains: [
      SEPARATOR,
      DIRECTIVE,
      COMMENT,
      FILE_VARIABLE,
      REQUEST_LINE,
      BARE_URL,
      QUERY_CONTINUATION,
      SCRIPT,
      FILE_REFERENCE,
      BOUNDARY,
      HEADER,
      JSON_KEY,
      STRING,
      NUMBER,
      INTERPOLATION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineHttpfile(hljs);
}

export const httpfile = { name: "httpfile", register };
export default httpfile;
