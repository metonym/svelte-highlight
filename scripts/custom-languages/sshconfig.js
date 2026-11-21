// OpenSSH client (`~/.ssh/config`, `ssh_config`) and server (`sshd_config`)
// configuration. Each line is a directive name and its arguments; `Host`
// and `Match` open a block. Directive names are case-insensitive.

// `Match` criteria from ssh_config(5) and sshd_config(5).
const MATCH_CRITERIA =
  "all canonical final exec host originalhost tagged command localnetwork " +
  "localuser user version sessiontype group address localaddress localport " +
  "rdomain";

// Fixed argument values shared by many directives.
const LITERALS =
  "yes|no|ask|confirm|auto|autoask|none|any|always|never|force|accept-new|" +
  "off|prohibit-password|forced-commands-only|without-password";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSshconfig(hljs) {
  // `%h`, `%p`, `%r`, `%%` in ProxyCommand, ControlPath, IdentityFile, ...
  const TOKEN = { className: "template-variable", begin: /%[%A-Za-z]/ };

  // `${HOME}` in paths.
  const ENV = { className: "variable", begin: /\$\{\w+\}/ };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [TOKEN, ENV],
  };

  const LITERAL = {
    className: "literal",
    begin: new RegExp(`\\b(?:${LITERALS})(?![\\w.@+/-])`),
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b\d{1,3}(?:\.\d{1,3}){3}\b/ },
      { begin: /\b\d+[smhdw]?\b/ },
    ],
    relevance: 0,
  };

  // Host names, paths, and algorithm lists. Matching them whole keeps the
  // digits in `hmac-sha2-256` or `id_ed25519` from reading as numbers.
  const WORD = { begin: /[A-Za-z_][\w.@+-]*/, relevance: 0 };

  const ARGUMENTS = [STRING, TOKEN, ENV, LITERAL, NUMBER, WORD];

  const COMMENT = hljs.COMMENT(/^[ \t]*#/, /$/);

  // `Host github.com *.example.com !bastion`
  const HOST = {
    begin: [/^[ \t]*/, /Host\b/],
    beginScope: { 2: "keyword" },
    end: /$/,
    contains: [{ className: "section", begin: /[^\s=]+/ }],
  };

  // `Match host *.corp exec "test -f ~/.vpn"`
  const MATCH = {
    begin: [/^[ \t]*/, /Match\b/],
    beginScope: { 2: "keyword" },
    end: /$/,
    // Whole tokens, so `host1.example.com` does not start with a keyword.
    keywords: { $pattern: /[\w.*@-]+/, built_in: MATCH_CRITERIA },
    contains: [STRING, TOKEN, ENV],
  };

  const INCLUDE = {
    begin: [/^[ \t]*/, /Include\b/],
    beginScope: { 2: "keyword" },
    end: /$/,
    contains: ARGUMENTS,
  };

  // `HostName 192.0.2.10`, `ForwardAgent=yes`. The name is the first word
  // on the line, so a directive this grammar has not seen still shows.
  const DIRECTIVE = {
    begin: [/^[ \t]*/, /[A-Za-z][A-Za-z0-9]*/],
    beginScope: { 2: "attr" },
    end: /$/,
    contains: ARGUMENTS,
    relevance: 0,
  };

  return {
    name: "SSH Config",
    aliases: ["ssh-config", "ssh_config", "sshd_config"],
    case_insensitive: true,
    // Every line is a bare word and its arguments, so a directive line
    // looks like a line of many other config formats.
    disableAutodetect: true,
    contains: [COMMENT, HOST, MATCH, INCLUDE, DIRECTIVE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSshconfig(hljs);
}

export const sshconfig = { name: "sshconfig", register };
export default sshconfig;
