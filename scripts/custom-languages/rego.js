const REGO_KEYWORDS =
  "package import default if else some in every not with as contains";

const REGO_LITERALS = "true false null";

const REGO_BUILTINS =
  "input data count sum product max min sort all any " +
  "startswith endswith split concat trim trim_left trim_right trim_prefix trim_suffix " +
  "sprintf format_int lower upper replace indexof indexof_n substring reverse " +
  "type_name is_number is_string is_boolean is_array is_object is_set is_null " +
  "to_number cast_array cast_set cast_string cast_boolean cast_null cast_object " +
  "object.get object.union object.remove object.filter object.subset " +
  "json.marshal json.unmarshal json.is_valid json.marshal_with_options json.patch json.remove json.filter " +
  "yaml.marshal yaml.unmarshal yaml.is_valid " +
  "array.concat array.slice array.reverse " +
  "http.send " +
  "regex.match regex.find_n regex.split regex.replace regex.globs_match regex.template_match " +
  "time.now_ns time.add_date time.diff time.parse_rfc3339_ns time.parse_ns time.date time.clock time.weekday " +
  "units.parse units.parse_bytes " +
  "crypto.sha256 crypto.md5 crypto.hmac.sha256 " +
  "base64.encode base64.decode base64url.encode base64url.decode " +
  "uuid.rfc4122 " +
  "glob.match " +
  "net.cidr_contains net.cidr_intersects net.lookup_ip_addr " +
  "walk print";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRego(hljs) {
  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /`/, end: /`/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const VARIABLE = {
    className: "variable",
    begin: /\b[a-z_][a-zA-Z0-9_]*(?=\s*(?::=|=(?!=)))/,
    relevance: 0,
  };

  const PACKAGE_PATH = {
    begin: [/\b(?:package|import)/, /\s+/, /[a-zA-Z_][\w.]*/],
    beginScope: { 1: "keyword", 3: "title.class" },
  };

  const RULE_HEAD = {
    className: "title.function",
    // The optional group anticipates a partial-set rule's `[...]` key or a
    // function-style rule's `(...)` params, e.g. `is_valid_user(u) { ... }`.
    begin:
      /^[a-z_][a-zA-Z0-9_]*(?=(?:\[[^\]]*\]|\([^)]*\))?(?:\s*:=|\s*=(?!=)|\s+(?:if|contains)\b|\s*\{))/,
    relevance: 0,
  };

  // Restricted to actual REGO_BUILTINS names (escaping the literal `.` in
  // dotted names like `object.get`) -- otherwise this matched *any*
  // call-like identifier, including user-defined rules, misleadingly
  // implying they're language builtins.
  const BUILT_IN_CALL = {
    className: "built_in",
    begin: new RegExp(
      String.raw`\b(?:${REGO_BUILTINS.trim()
        .split(/\s+/)
        .map((name) => name.replace(/\./g, "\\."))
        .join("|")})(?=\()`,
    ),
    relevance: 0,
  };

  return {
    name: "Rego",
    aliases: ["rego", "opa"],
    case_insensitive: false,
    keywords: {
      keyword: REGO_KEYWORDS,
      literal: REGO_LITERALS,
      built_in: REGO_BUILTINS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      PACKAGE_PATH,
      RULE_HEAD,
      BUILT_IN_CALL,
      NUMBER,
      VARIABLE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRego(hljs);
}

export const rego = { name: "rego", register };
export default rego;
