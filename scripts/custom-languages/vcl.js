const VCL_KEYWORDS = [
  "import",
  "include",
  "backend",
  "probe",
  "acl",
  "sub",
  "director",
  "if",
  "else",
  "elseif",
  "elsif",
  "elif",
  "set",
  "unset",
  "call",
  "return",
  "new",
  "synthetic",
  "hash_data",
  "ban",
  "std",
  "regsub",
  "regsuball",
  "now",
];

const VCL_BUILT_IN_SUBS =
  "vcl_recv vcl_hash vcl_backend_fetch vcl_backend_response vcl_deliver vcl_synth vcl_init vcl_fini vcl_pipe vcl_pass vcl_hit vcl_miss vcl_purge vcl_backend_error";

const VCL_RETURN_ACTIONS =
  "hash pass pipe lookup synth restart retry fetch deliver abandon purge fail ok error miss";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVcl(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/ },
      { begin: /\{"/, end: /"\}/ },
    ],
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const VCL_HEADER = {
    className: "meta",
    begin: /\bvcl\s+4\.\d+;/,
    relevance: 10,
  };

  const BUILT_IN_SUB = {
    className: "title.function",
    begin: new RegExp(`\\b(?:${VCL_BUILT_IN_SUBS.split(" ").join("|")})\\b`),
    relevance: 5,
  };

  const VARIABLE = {
    className: "variable",
    begin:
      /\b(?:req|bereq|beresp|resp|obj|client|server|local|remote|sess)\.[\w.]+/,
    relevance: 0,
  };

  const DURATION = {
    className: "number",
    begin: /\b\d+(?:ms|s|m|h|d|w|y)\b/,
    relevance: 0,
  };

  const SIZE = {
    className: "number",
    begin: /\b\d+(?:B|KB|MB|GB|TB)\b/,
    relevance: 0,
  };

  return {
    name: "VCL",
    aliases: ["varnish"],
    keywords: {
      keyword: VCL_KEYWORDS,
      literal: VCL_RETURN_ACTIONS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      VCL_HEADER,
      STRING,
      BUILT_IN_SUB,
      VARIABLE,
      DURATION,
      SIZE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVcl(hljs);
}

export const vcl = { name: "vcl", register };
export default vcl;
