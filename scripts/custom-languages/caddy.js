// Directives, common subdirectives, and request-matcher names (Caddy 2.x,
// including `intercept`/`fs`/`log_append` from 2.7 and `log_skip`/`log_name`
// from 2.8).
const CADDY_DIRECTIVES =
  "reverse_proxy file_server root encode tls header header_down header_up redir respond route handle handle_path handle_errors rewrite uri log basicauth basic_auth forward_auth php_fastcgi try_files bind import templates request_body push map vars metrics tracing acme_server abort error method bcrypt invoke to lb_policy transport insecure_skip_verify dns protocols ciphers health_uri " +
  "intercept fs log_append log_skip log_name request_header handle_response copy_response copy_response_headers replace_status " +
  "output format level health_interval dial_timeout tls_insecure_skip_verify " +
  "path path_regexp host not query expression file header_regexp remote_ip client_ip protocol vars_regexp";

const CADDY_GLOBAL =
  "admin auto_https debug http_port https_port grace_period default_sni order storage acme_ca acme_dns email on_demand_tls local_certs skip_install_trust " +
  "servers trusted_proxies persist_config default_bind ocsp_stapling cert_issuer renew_interval pki events preferred_chains";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCaddy(hljs) {
  const PLACEHOLDER = {
    className: "variable",
    begin: /\{[a-zA-Z0-9_.$>-]+\}/,
    relevance: 0,
  };

  // `\B` keeps the `@` from firing mid-token, e.g. inside an email address
  // (`email admin@example.com`).
  const MATCHER = {
    className: "symbol",
    begin: /\B@[a-zA-Z_][\w-]*/,
    relevance: 0,
  };

  // Backtick strings (no escapes) can span lines.
  const BACKTICK_STRING = {
    className: "string",
    begin: /`/,
    end: /`/,
    relevance: 0,
  };

  // Heredocs (Caddy 2.7): `<<MARKER` ... a line holding `MARKER`, which may
  // be indented and followed by more tokens (`HTML 200`).
  const HEREDOC = hljs.END_SAME_AS_BEGIN({
    className: "string",
    begin: /<<([A-Za-z0-9_-]+)\n/,
    end: /^[ \t]*([A-Za-z0-9_-]+)/,
    relevance: 10,
  });

  // Durations (`10s`, `5m`, `1h`) and sizes (`100MiB`, `2GB`) keep their
  // unit.
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:ns|us|µs|ms|[smhdw]|[KMGT]i?B|[KMGTB])?(?!\w)/,
    relevance: 0,
  };

  // A site header can declare more than one address on the same line,
  // separated by whitespace (and optionally commas), e.g.
  // `example.com www.example.com {`. Without the repeating group, the
  // lookahead for `{` failed right after the first address (next up was
  // another address, not `{`), so the whole line got no styling at all.
  //
  // Anchored to column 0 (no leading whitespace): site headers are always
  // unindented, while nested directive lines like `transport http {` are
  // always indented -- without that distinction, the repeating group would
  // also swallow a directive followed by a bare-word argument, since both
  // are just "word(s) {" and the address-token class allows bare words too.
  //
  // An address may also be port-only (`:8080 {`), so the token is either a
  // host with an optional port or a bare `:port`.
  const ADDRESS_TOKEN = String.raw`(?:https?:\/\/)?(?:[a-zA-Z0-9*.-]+(?::\d+)?|:\d+)`;
  const SITE_ADDRESS = {
    className: "attr",
    begin: new RegExp(
      String.raw`^${ADDRESS_TOKEN}(?:,?\s+${ADDRESS_TOKEN})*(?=\s*\{)`,
    ),
    relevance: 0,
  };

  // `[ \t]*`, not `\s*`: in multiline mode `^\s*` matched from a preceding
  // blank line and pulled the newline into the title span.
  const SNIPPET = {
    className: "title",
    begin: /^[ \t]*\([\w-]+\)/,
    relevance: 0,
  };

  return {
    name: "Caddyfile",
    aliases: ["caddy", "caddyfile"],
    case_insensitive: false,
    keywords: {
      // Paths and hostnames are single tokens, so `log` does not fire
      // inside `/var/log/caddy/access.log`.
      $pattern: /[\w./-]+/,
      keyword: CADDY_DIRECTIVES,
      built_in: CADDY_GLOBAL,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      BACKTICK_STRING,
      HEREDOC,
      SNIPPET,
      SITE_ADDRESS,
      MATCHER,
      PLACEHOLDER,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCaddy(hljs);
}

export const caddy = { name: "caddy", register };
export default caddy;
