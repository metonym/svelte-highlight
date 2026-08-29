const VRL_KEYWORDS = "if else for while abort";

const VRL_LITERALS = "true false null";

const VRL_BUILT_INS =
  "parse_json parse_syslog parse_key_value parse_regex parse_timestamp parse_duration to_int " +
  "to_float to_string to_bool to_timestamp exists del contains upcase downcase split join replace " +
  "slice length now format_timestamp round floor ceil md5 sha1 sha256 encode_json decode_base64 " +
  "encode_base64 get_env_var uuid_v4 ip_cidr_contains array object string float integer boolean " +
  "timestamp assert";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVrl(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  // Fallible functions take a `!` suffix right after the name: this is VRL's
  // highest-signal token, so it gets its own two-part begin like jq.js's
  // FUNCTION_DEF: `def name` -> [keyword text, title.function].
  const FALLIBLE_CALL = {
    begin: [/\b[a-zA-Z_]\w*/, /!/],
    beginScope: { 1: "built_in", 2: "operator" },
    relevance: 5,
  };

  const COALESCE = {
    className: "operator",
    begin: /\?\?/,
    relevance: 5,
  };

  const NEGATION = {
    className: "operator",
    begin: /!/,
    relevance: 0,
  };

  const FIELD = {
    // Event path segments: .status_code, .error.message
    className: "property",
    begin: /\.[a-zA-Z_]\w*/,
    relevance: 0,
  };

  // The bare root-event reference: `. = parse_json!(.message)`
  const ROOT = {
    className: "property",
    begin: /\./,
    relevance: 0,
  };

  return {
    name: "VRL",
    aliases: ["vrl"],
    keywords: {
      keyword: VRL_KEYWORDS,
      literal: VRL_LITERALS,
      built_in: VRL_BUILT_INS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      FALLIBLE_CALL,
      COALESCE,
      FIELD,
      ROOT,
      NEGATION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVrl(hljs);
}

export const vrl = { name: "vrl", register };
export default vrl;
