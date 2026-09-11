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
  "log-forward",
  "crt-store",
  "traces",
  "acme",
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
  // more proxy/global directives
  "server-template",
  "http-after-response",
  "http-error",
  "http-reuse",
  "quic-initial",
  "use-server",
  "use-fcgi-app",
  "dispatch",
  "source",
  "persist",
  "force-persist",
  "ignore-persist",
  "log-format",
  "log-format-sd",
  "log-tag",
  "error-log-format",
  "errorfiles",
  "errorloc",
  "errorloc302",
  "errorloc303",
  "retry-on",
  "external-check",
  "load-server-state-from-file",
  "server-state-file",
  "unique-id-header",
  "http-send-name-header",
  "fullconn",
  "backlog",
  "monitor",
  "setenv",
  "presetenv",
  "resetenv",
  "unsetenv",
  "pidfile",
  "ulimit-n",
  "thread-groups",
  "cpu-map",
  "master-worker",
  "set-dumpable",
  "lua-load",
  "lua-load-per-thread",
  "lua-prepend-path",
  "ssl-default-bind-options",
  "ssl-default-bind-ciphersuites",
  "ssl-default-server-ciphers",
  "ssl-default-server-ciphersuites",
  "ssl-default-server-options",
  "ssl-dh-param-file",
  "dgram-bind",
  // resolvers / peers / crt-store / cache / ring / program / fcgi-app
  "nameserver",
  "parse-resolv-conf",
  "resolve_retries",
  "hold",
  "accepted_payload_size",
  "peer",
  "table",
  "load",
  "total-max-size",
  "max-object-size",
  "max-age",
  "size",
  "format",
  "command",
  "docroot",
  "index",
  "path-info",
  "mailer",
  // rule actions (http-request/http-response/tcp-request/http-check)
  "content",
  "connection",
  "session",
  "inspect-delay",
  "expect-proxy",
  "accept",
  "reject",
  "deny",
  "allow",
  "tarpit",
  "auth",
  "return",
  "set-header",
  "add-header",
  "del-header",
  "replace-header",
  "replace-value",
  "set-path",
  "set-pathq",
  "set-query",
  "set-uri",
  "set-method",
  "set-status",
  "set-var",
  "set-var-fmt",
  "unset-var",
  "set-log-level",
  "set-nice",
  "set-tos",
  "set-mark",
  "set-src",
  "set-dst",
  "set-timeout",
  "set-map",
  "del-map",
  "track-sc0",
  "track-sc1",
  "track-sc2",
  "sc-inc-gpc0",
  "sc-inc-gpc1",
  "sc-set-gpt0",
  "silent-drop",
  "wait-for-body",
  "wait-for-handshake",
  "use-service",
  "normalize-uri",
  "cache-use",
  "cache-store",
  "early-hint",
  "disable-l7-retry",
  "strict-mode",
  "send",
  "expect",
  "send-lf",
  "comment",
];

// Sample fetches and converters. Dotted names (`req.hdr`) need the `.` in
// `$pattern` to be one keyword token.
const HAPROXY_FETCHES =
  "src dst path path_beg path_end hdr hdr_beg req.hdr ssl_fc url_param nbsrv be_conn srv_conn str map lower upper base64 field regsub " +
  "hdr_end hdr_sub hdr_dom hdr_reg req.hdr_beg url url_beg url_end url_dir url_dom urlp path_dir path_dom path_sub path_reg query " +
  "ssl_fc_sni ssl_c_used src_port dst_port var req.body req.ver res.hdr http_req_rate sc_http_req_rate sc_conn_rate always_true always_false env int";

const HAPROXY_SERVER_ATTRS =
  "check inter rise fall weight backup maxconn ssl verify crt alpn send-proxy resolvers " +
  "downinter fastinter slowstart port addr ca-file crl-file sni check-ssl check-sni observe on-error on-marked-down agent-check agent-port " +
  "init-addr resolve-prefer maxqueue minconn pool-max-conn send-proxy-v2 proxy-v2-options tfo track no-check error-limit ws proto";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHaproxy(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const SECTION_RE = new RegExp(`^(?:${HAPROXY_SECTIONS.join("|")})\\b`);

  // `[ \t]+`, not `\s+`: for a nameless section (`global`, `defaults`) the
  // old separator spanned the newline and styled the first keyword of the
  // next line as the section's name.
  const SECTION_HEADER = {
    begin: [SECTION_RE, /[ \t]+/, /[\w.-]+/],
    beginScope: { 1: "section", 3: "title.class" },
    relevance: 10,
  };

  const BARE_SECTION = {
    className: "section",
    begin: new RegExp(`${SECTION_RE.source}(?=[ \\t]*(?:#|$))`),
    relevance: 10,
  };

  // `.if` / `.elif` / `.else` / `.endif` and the `.diag`/`.notice`/
  // `.warning`/`.alert`/`.error` predicates (HAProxy 2.4 conditional
  // blocks).
  const CONDITIONAL = {
    begin: [
      /^[ \t]*/,
      /\.(?:if|elif|else|endif|diag|notice|warning|alert|error)\b/,
    ],
    beginScope: { 2: "meta" },
    relevance: 0,
  };

  const ENV_VAR = {
    className: "variable",
    begin: /\$\{[A-Za-z_]\w*(?:\[\*\])?\}|\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  // Durations (`5s`, `10ms`) and sizes (`100k`) keep their unit.
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:us|ms|[smhd]|[kmgKMG])?(?!\w)/,
    relevance: 0,
  };

  const SAMPLE_FETCH = {
    className: "template-variable",
    begin: /%\[[^\]]*\]|%[a-zA-Z]{2}\b/,
    relevance: 0,
  };

  const TUNE_DIRECTIVE = {
    className: "keyword",
    begin: /\btune\.[\w.-]+/,
    relevance: 0,
  };

  return {
    name: "HAProxy",
    aliases: ["haproxy-cfg"],
    keywords: {
      // Most directives are hyphenated (`http-request`, `stick-table`,
      // `default-server`) and fetches dotted (`req.hdr`); under the default
      // `\w+` tokenizer none of them could match. `/` keeps paths
      // (`/dev/log`) as one non-keyword token.
      $pattern: /[\w./-]+/,
      keyword: HAPROXY_DIRECTIVES,
      built_in: HAPROXY_FETCHES,
      attr: HAPROXY_SERVER_ATTRS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      SECTION_HEADER,
      BARE_SECTION,
      CONDITIONAL,
      TUNE_DIRECTIVE,
      SAMPLE_FETCH,
      ENV_VAR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHaproxy(hljs);
}

export const haproxy = { name: "haproxy", register };
export default haproxy;
