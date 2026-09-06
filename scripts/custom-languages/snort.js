const SNORT_ACTIONS = [
  "alert|5",
  "log|5",
  "pass|5",
  "drop|5",
  "reject|5",
  "sdrop|5",
  "rejectsrc|5",
  "rejectdst|5",
  "rejectboth|5",
];

const SNORT_PROTOCOLS = "tcp udp icmp ip http tls dns ssh smb ftp smtp any";

const SNORT_OPTION_KEYS = [
  "msg",
  "content",
  "pcre",
  "sid",
  "rev",
  "classtype",
  "flow",
  "nocase",
  "depth",
  "offset",
  "distance",
  "within",
  "fast_pattern",
  "http_uri",
  "http\\.uri",
  "http\\.method",
  "dsize",
  "flags",
  "flowbits",
  "reference",
  "metadata",
  "priority",
  "threshold",
  "detection_filter",
  "byte_test",
  "byte_jump",
  "isdataat",
  "urilen",
  "tag",
  "gid",
  "target",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSnort(hljs) {
  const HEX_BYTES = {
    className: "number",
    begin: /\|[0-9a-fA-F\s]*\|/,
  };

  const CONTENT_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [HEX_BYTES],
  };

  const PCRE_STRING = {
    className: "regexp",
    begin: /pcre\s*:\s*"/,
    end: /"/,
    relevance: 5,
  };

  const OPTION_KEY = {
    className: "attr",
    begin: new RegExp(`\\b(?:${SNORT_OPTION_KEYS.join("|")})(?=\\s*:)`),
    relevance: 0,
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Z_][A-Z0-9_]*/,
    relevance: 0,
  };

  const DIRECTION = {
    className: "operator",
    begin: /->|<>/,
    relevance: 0,
  };

  const CIDR = {
    className: "number",
    begin: /\b\d{1,3}(?:\.\d{1,3}){3}(?:\/\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "Snort",
    aliases: ["suricata"],
    keywords: {
      keyword: SNORT_ACTIONS,
      type: SNORT_PROTOCOLS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      PCRE_STRING,
      CONTENT_STRING,
      OPTION_KEY,
      VARIABLE,
      DIRECTION,
      CIDR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSnort(hljs);
}

export const snort = { name: "snort", register };
export default snort;
