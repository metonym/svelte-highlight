const BLUEPRINT_KEYWORDS = [
  "template",
  "using",
  "bind",
  "bind-property",
  "as",
  "typeof",
  // Binding and signal flags.
  "sync-create",
  "no-sync-create",
  "bidirectional",
  "inverted",
  "swapped",
  "after",
  // Menus.
  "menu",
  "section",
  "submenu",
  "item",
  // Extension blocks (`styles [...]`, `layout { }`, `setters { }`, ...).
  "styles",
  "accessibility",
  "layout",
  "setters",
  "condition",
  "strings",
  "widgets",
  "marks",
  "mark",
  "mime-types",
  "patterns",
  "suffixes",
  "columns",
  "items",
  "responses",
  "destructive",
  "disabled",
  "default",
  "translatable",
];

const BLUEPRINT_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBlueprint(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const USING_HEADER = {
    className: "meta",
    begin: /\busing\s+Gtk\b/,
    relevance: 10,
  };

  const WIDGET_TYPE = {
    className: "title.class",
    begin: /\b[A-Z]\w*(?:\.[A-Z]\w*)*\b/,
    relevance: 0,
  };

  const HANDLER_REF = {
    className: "title.function",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 5,
  };

  const SIGNAL_ARROW = {
    className: "operator",
    begin: /=>/,
    relevance: 5,
  };

  const CHILD_TYPE_ANNOTATION = {
    className: "meta",
    begin: /\[[A-Za-z_][\w-]*\]/,
    relevance: 0,
  };

  const PROPERTY_NAME = {
    className: "attr",
    begin: /\b[a-z][\w-]*(?=\s*:(?!:))/,
    relevance: 0,
  };

  // `_("...")` and the context form `C_("ctx", "...")`.
  const TRANSLATABLE_STRING = {
    className: "string",
    begin: /\b(?:C_|_)\(/,
    end: /\)/,
    contains: [STRING],
    relevance: 5,
  };

  return {
    name: "Blueprint",
    aliases: ["blp", "gtk-blueprint"],
    keywords: {
      // Kebab-case keywords (`bind-property`, `no-sync-create`) need a word
      // pattern that includes `-`; hljs's default `\w+` never matched them.
      $pattern: "[a-zA-Z_][\\w-]*",
      keyword: BLUEPRINT_KEYWORDS,
      literal: BLUEPRINT_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      USING_HEADER,
      TRANSLATABLE_STRING,
      STRING,
      HANDLER_REF,
      SIGNAL_ARROW,
      CHILD_TYPE_ANNOTATION,
      PROPERTY_NAME,
      WIDGET_TYPE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBlueprint(hljs);
}

export const blueprint = { name: "blueprint", register };
export default blueprint;
