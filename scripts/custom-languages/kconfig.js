const KCONFIG_KEYWORDS = [
  "menuconfig",
  "choice",
  "endchoice",
  "menu",
  "endmenu",
  "if",
  "endif",
  "source",
  "mainmenu",
  "comment",
  "depends",
  "on",
  "select",
  "imply",
  "range",
  "visible",
  "option",
  "modules",
  "default",
];

const KCONFIG_ATTRS =
  "bool tristate string hex int prompt def_bool def_tristate defconfig_list";

const KCONFIG_LITERALS = "y n m";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKconfig(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CONFIG_DEF = {
    begin: [/^[ \t]*/, /config\b/, /\s+/, /[A-Za-z0-9_]+/],
    beginScope: { 2: "keyword", 4: "title.class" },
    relevance: 10,
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$\([^)]*\)|\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const HELP_BLOCK = {
    begin: /\bhelp\b[ \t]*$/,
    beginScope: "keyword",
    starts: {
      className: "comment",
      end: /^(?=\S)/,
    },
  };

  return {
    name: "Kconfig",
    aliases: ["kconfig"],
    keywords: {
      keyword: KCONFIG_KEYWORDS,
      attr: KCONFIG_ATTRS,
      literal: KCONFIG_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      CONFIG_DEF,
      HELP_BLOCK,
      VARIABLE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineKconfig(hljs);
}

export const kconfig = { name: "kconfig", register };
export default kconfig;
