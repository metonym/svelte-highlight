const JUST_KEYWORDS = "export set import mod alias if else in";

const JUST_BUILT_INS =
  "env_var env_var_or_default arch os os_family num_cpus justfile justfile_directory just_executable just_pid invocation_directory invocation_directory_native working_directory trim trim_end trim_start trim_end_match trim_start_match replace replace_regex uppercase lowercase capitalize quote sha256 sha256_file uuid clean join absolute_path canonicalize extension file_name file_stem parent_directory without_extension error semver_matches path_exists which shell blake3 blake3_file choose datetime datetime_utc encode_uri_component style";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJust(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/ },
      { begin: /'''/, end: /'''/ },
      { begin: /"/, end: /"/, illegal: "\\n" },
      { begin: /'/, end: /'/, illegal: "\\n" },
    ],
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /^[ \t]*\[/,
    end: /\]/,
    contains: [
      {
        className: "keyword",
        begin: /[a-zA-Z][\w-]*/,
      },
      STRING,
    ],
  };

  const SHEBANG = {
    className: "meta",
    begin: /^[ \t]+#!.*$/,
    relevance: 10,
  };

  const ASSIGN_OP = {
    className: "operator",
    begin: /:=/,
  };

  const VARIABLE_ASSIGNMENT = {
    begin: /^[a-zA-Z_][\w-]*(?=\s*:=)/,
    className: "variable",
    relevance: 0,
  };

  // Recipe header: `name:`, `name: dep1 dep2`, or `name param="default":`.
  // A default value can also be a function call, e.g.
  // `port=env_var_or_default("PORT", "8080"):` -- without that
  // alternative, the whole lookahead fails at the unhandled `(` and the
  // recipe name/params never get title/params styling at all.
  const RECIPE_HEADER = {
    className: "title.function",
    begin:
      /^@?[a-zA-Z_][\w-]*(?=(?:\s+[+*]?[a-zA-Z_][\w-]*(?:[+*]?=(?:"[^"]*"|'[^']*'|[a-zA-Z_][\w-]*\([^)]*\)|[a-zA-Z_][\w-]*))?)*\s*:(?!=))/,
    end: /(?=:(?!=))/,
    returnBegin: true,
    contains: [
      {
        className: "title.function.invoke",
        begin: /^@?[a-zA-Z_][\w-]*/,
      },
      {
        className: "params",
        begin: /[a-zA-Z_][\w-]*(?=[+*]?=)/,
        relevance: 0,
      },
      ASSIGN_OP,
      STRING,
      {
        className: "params",
        begin: /[a-zA-Z_][\w-]*/,
        relevance: 0,
      },
    ],
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\{\{/,
    end: /\}\}/,
    keywords: {
      built_in: JUST_BUILT_INS,
      literal: "true false",
    },
    contains: [STRING],
  };

  return {
    name: "just",
    aliases: ["justfile", "Justfile"],
    case_insensitive: false,
    keywords: {
      keyword: JUST_KEYWORDS,
      built_in: JUST_BUILT_INS,
      literal: "true false",
    },
    contains: [
      SHEBANG,
      hljs.HASH_COMMENT_MODE,
      ATTRIBUTE,
      STRING,
      INTERPOLATION,
      VARIABLE_ASSIGNMENT,
      ASSIGN_OP,
      RECIPE_HEADER,
      { className: "number", begin: /\b\d+\b/, relevance: 0 },
      {
        className: "operator",
        begin: /==|!=|=~|&&|\|\||[+*]?=(?!=)/,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJust(hljs);
}

export const just = { name: "just", register };
export default just;
