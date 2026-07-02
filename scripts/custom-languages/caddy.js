const CADDY_DIRECTIVES =
  "reverse_proxy file_server root encode tls header header_down header_up redir respond route handle handle_path handle_errors rewrite uri log basicauth basic_auth forward_auth php_fastcgi try_files bind import templates request_body push map vars metrics tracing acme_server abort error method bcrypt invoke to lb_policy transport insecure_skip_verify dns protocols ciphers health_uri";

const CADDY_GLOBAL =
  "admin auto_https debug http_port https_port grace_period default_sni order storage acme_ca acme_dns email on_demand_tls local_certs skip_install_trust";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCaddy(hljs) {
  const PLACEHOLDER = {
    className: "variable",
    begin: /\{[a-zA-Z0-9_.$>-]+\}/,
    relevance: 0,
  };

  const MATCHER = {
    className: "symbol",
    begin: /@[a-zA-Z_][\w-]*/,
    relevance: 0,
  };

  const SITE_ADDRESS = {
    className: "attr",
    begin: /^\s*(?:https?:\/\/)?(?:[a-zA-Z0-9*.-]+)(?::\d+)?(?=\s*\{)/,
    relevance: 0,
  };

  const SNIPPET = {
    className: "title",
    begin: /^\s*\([\w-]+\)/,
    relevance: 0,
  };

  return {
    name: "Caddyfile",
    aliases: ["caddy", "caddyfile"],
    case_insensitive: false,
    keywords: {
      keyword: CADDY_DIRECTIVES,
      built_in: CADDY_GLOBAL,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      SNIPPET,
      SITE_ADDRESS,
      MATCHER,
      PLACEHOLDER,
      { className: "number", begin: /\b\d+\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCaddy(hljs);
}

export const caddy = { name: "caddy", register };
export default caddy;
