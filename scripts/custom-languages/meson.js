// Meson reads a lot like Python, so plain keywords stay at relevance 0.
// Auto-detection leans on what Python never has: bare `endif` and
// `endforeach`, and calls to Meson's own build functions.
const KEYWORDS = [
  "if|0",
  "elif|0",
  "else|0",
  "endif|0",
  "foreach|0",
  "endforeach|0",
  "break|0",
  "continue|0",
  "and|0",
  "or|0",
  "not|0",
  "in|0",
];

// Build functions that only a Meson file calls. Generic names such as
// `test`, `files`, or `message` are highlighted but add no relevance.
const DISTINCT_FUNCTIONS = [
  "add_global_arguments",
  "add_global_link_arguments",
  "add_languages",
  "add_project_arguments",
  "add_project_dependencies",
  "add_project_link_arguments",
  "add_test_setup",
  "alias_target",
  "both_libraries",
  "build_target",
  "configuration_data",
  "configure_file",
  "custom_target",
  "declare_dependency",
  "dependency",
  "executable",
  "find_program",
  "get_option",
  "include_directories",
  "install_data",
  "install_emptydir",
  "install_headers",
  "install_man",
  "install_subdir",
  "install_symlink",
  "is_disabler",
  "shared_library",
  "shared_module",
  "static_library",
  "structured_sources",
  "subdir",
  "subdir_done",
  "subproject",
  "vcs_tag",
];

const GENERIC_FUNCTIONS = [
  "assert",
  "benchmark",
  "debug",
  "disabler",
  "environment",
  "error",
  "files",
  "generator",
  "get_variable",
  "import",
  "is_variable",
  "jar",
  "join_paths",
  "library",
  "message",
  "project",
  "range",
  "run_command",
  "run_target",
  "set_variable",
  "summary",
  "test",
  "unset_variable",
  "warning",
];

const BUILTIN_OBJECTS = [
  "meson",
  "build_machine",
  "host_machine",
  "target_machine",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMeson(hljs) {
  // `@name@` placeholders in f-strings, `.format()` strings, and
  // `configure_file` templates.
  const PLACEHOLDER = { scope: "subst", match: /@[\w.]+@/, relevance: 0 };

  const ESCAPE = { scope: "char.escape", match: /\\./, relevance: 0 };

  const STRING = {
    scope: "string",
    variants: [
      // Triple-quoted strings span lines and do not process escapes.
      { begin: /f'''/, end: /'''/, contains: [PLACEHOLDER] },
      { begin: /'''/, end: /'''/ },
      { begin: /f'/, end: /'|$/, contains: [ESCAPE, PLACEHOLDER] },
      { begin: /'/, end: /'|$/, contains: [ESCAPE, PLACEHOLDER] },
    ],
    relevance: 0,
  };

  const NUMBER = {
    scope: "number",
    match: /\b(?:0x[\da-fA-F]+|0o[0-7]+|0b[01]+|\d+)\b/,
    relevance: 0,
  };

  const FUNCTION_CALL = {
    variants: [
      {
        match: new RegExp(`\\b(?:${DISTINCT_FUNCTIONS.join("|")})(?=\\s*\\()`),
        relevance: 5,
      },
      {
        match: new RegExp(`\\b(?:${GENERIC_FUNCTIONS.join("|")})(?=\\s*\\()`),
        relevance: 0,
      },
    ],
    scope: "built_in",
  };

  // `meson.version()`, `host_machine.system()`.
  const BUILTIN_OBJECT = {
    scope: "variable.language",
    match: new RegExp(`\\b(?:${BUILTIN_OBJECTS.join("|")})(?=\\s*\\.)`),
    relevance: 2,
  };

  // Method calls on any object: `cc.find_library(...)`.
  const METHOD_CALL = {
    match: [/\./, /[A-Za-z_]\w*/, /(?=\s*\()/],
    scope: { 2: "title.function.invoke" },
    relevance: 0,
  };

  // `foreach key, value : dict` names loop variables, not a keyword argument.
  const FOREACH = {
    match: [
      /\bforeach\b/,
      /[ \t]+/,
      /[A-Za-z_]\w*(?:[ \t]*,[ \t]*[A-Za-z_]\w*)?(?=[ \t]*:)/,
    ],
    scope: { 1: "keyword", 3: "variable" },
    relevance: 0,
  };

  // CMake writes `endif()` and `endforeach()`; Meson never adds the parens.
  const BLOCK_END = {
    scope: "keyword",
    match: /\b(?:endif|endforeach)\b(?!\s*\()/,
    relevance: 10,
  };

  // Keyword arguments: `version : '1.0'`, `install: true`.
  const KEYWORD_ARGUMENT = {
    scope: "attr",
    match: /\b[A-Za-z_]\w*(?=\s*:(?!:))/,
    relevance: 0,
  };

  return {
    name: "Meson",
    keywords: {
      keyword: KEYWORDS.join(" "),
      literal: "true false",
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      NUMBER,
      BUILTIN_OBJECT,
      FUNCTION_CALL,
      METHOD_CALL,
      FOREACH,
      BLOCK_END,
      KEYWORD_ARGUMENT,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMeson(hljs);
}

export const meson = { name: "meson", register };
export default meson;
