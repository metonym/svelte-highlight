import bashRegister from "highlight.js/lib/languages/bash";
import pythonRegister from "highlight.js/lib/languages/python";

const BITBAKE_DIRECTIVES = [
  "inherit",
  "require",
  "include",
  "addtask",
  "deltask",
  "before",
  "after",
  "export",
  "unset",
  "EXPORT_FUNCTIONS",
  "addhandler",
  "python",
  "fakeroot",
  "def",
];

const BITBAKE_BUILT_IN_NAMES = [
  "SRC_URI",
  "LICENSE",
  "LIC_FILES_CHKSUM",
  "DEPENDS",
  "RDEPENDS",
  "S",
  "B",
  "D",
  "WORKDIR",
  "PN",
  "PV",
  "PR",
  "FILES",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBitbake(hljs) {
  const PY_EXPANSION = {
    className: "subst",
    begin: /\$\{@/,
    end: /\}/,
    subLanguage: "python",
  };

  const EXPANSION = {
    className: "template-variable",
    begin: /\$\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      PY_EXPANSION,
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, PY_EXPANSION, EXPANSION],
  };

  const VAR_OP = {
    className: "operator",
    begin: /\?\?=|:append|:prepend|:remove|\?=|:=|\+=|=\+|\.=|=\./,
    relevance: 5,
  };

  const ASSIGNMENT_LOOKAHEAD =
    /(?=\s*(?:\[[^\]]*\])?\s*(?:\?\?=|\?=|:=|\+=|=\+|\.=|=\.|=))/;

  const BUILT_IN_VAR_NAME = {
    className: "built_in",
    begin: new RegExp(
      `^(?:${BITBAKE_BUILT_IN_NAMES.join("|")})(?::[\\w-]+)?${ASSIGNMENT_LOOKAHEAD.source}`,
    ),
    relevance: 5,
  };

  const VAR_NAME = {
    className: "variable",
    begin: new RegExp(
      `^[A-Za-z_][\\w]*(?::[\\w-]+)?${ASSIGNMENT_LOOKAHEAD.source}`,
    ),
    relevance: 0,
  };

  const SHELL_FUNCTION = {
    begin: [/^[A-Za-z_][\w.]*/, /\s*\(\)\s*/, /\{/],
    beginScope: { 1: "title.function" },
    end: /^\}/,
    subLanguage: "bash",
  };

  return {
    name: "BitBake",
    aliases: ["bb", "bbappend", "bbclass"],
    keywords: {
      keyword: BITBAKE_DIRECTIVES,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      PY_EXPANSION,
      EXPANSION,
      VAR_OP,
      BUILT_IN_VAR_NAME,
      VAR_NAME,
      SHELL_FUNCTION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("bash", bashRegister);
  hljs.registerLanguage("python", pythonRegister);
  return defineBitbake(hljs);
}

export const bitbake = { name: "bitbake", register };
export default bitbake;
