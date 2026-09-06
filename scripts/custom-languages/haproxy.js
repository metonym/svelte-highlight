const HAPROXY_SECTIONS = [
  "global",
  "defaults",
  "frontend",
  "backend",
  "listen",
  "resolvers",
  "peers",
  "userlist",
  "cache",
  "program",
  "http-errors",
  "ring",
  "mailers",
  "fcgi-app",
];

const HAPROXY_DIRECTIVES = [
  "bind",
  "mode",
  "option",
  "timeout",
  "server",
  "default_backend",
  "use_backend",
  "acl",
  "http-request",
  "http-response",
  "tcp-request",
  "tcp-response",
  "balance",
  "stick-table",
  "stick",
  "maxconn",
  "log",
  "retries",
  "redirect",
  "errorfile",
  "stats",
  "monitor-uri",
  "compression",
  "capture",
  "default-server",
  "hash-type",
  "cookie",
  "http-check",
  "tcp-check",
  "chroot",
  "user",
  "group",
  "daemon",
  "nbthread",
  "ssl-default-bind-ciphers",
  "ca-base",
  "crt-base",
  "filter",
  "email-alert",
  "description",
  "disabled",
  "enabled",
  "id",
  "rate-limit",
  "unique-id-format",
  "declare",
  "if",
  "unless",
  "or",
];

const HAPROXY_FETCHES =
  "src dst path path_beg path_end hdr hdr_beg req.hdr ssl_fc url_param nbsrv be_conn srv_conn str map lower upper base64 field regsub";

const HAPROXY_SERVER_ATTRS =
  "check inter rise fall weight backup maxconn ssl verify crt alpn send-proxy resolvers";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHaproxy(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const SECTION_HEADER = {
    begin: [
      new RegExp(`^(?:${HAPROXY_SECTIONS.join("|")})\\b`),
      /\s+/,
      /[\w.-]+/,
    ],
    beginScope: { 1: "section", 3: "title.class" },
    relevance: 10,
  };

  const SAMPLE_FETCH = {
    className: "template-variable",
    begin: /%\[[^\]]*\]|%[a-zA-Z]{2}\b/,
    relevance: 0,
  };

  const TUNE_DIRECTIVE = {
    className: "keyword",
    begin: /\btune\.[\w.]+/,
    relevance: 0,
  };

  return {
    name: "HAProxy",
    aliases: ["haproxy-cfg"],
    keywords: {
      keyword: HAPROXY_DIRECTIVES,
      built_in: HAPROXY_FETCHES,
      attr: HAPROXY_SERVER_ATTRS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      SECTION_HEADER,
      TUNE_DIRECTIVE,
      SAMPLE_FETCH,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHaproxy(hljs);
}

export const haproxy = { name: "haproxy", register };
export default haproxy;
