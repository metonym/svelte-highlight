/** @param {import("highlight.js").HLJSApi} hljs */
function defineInk(hljs) {
  const KNOT = {
    className: "section",
    begin: /^\s*={2,}\s*[\w.]+\s*=*\s*$/,
    relevance: 10,
  };

  const STITCH = {
    className: "section",
    begin: /^\s*=\s*[\w.]+\s*$/,
    relevance: 0,
  };

  const CHOICE_MARKER = {
    className: "bullet",
    begin: /^\s*(?:\*\s*)+|^\s*(?:\+\s*)+/,
    relevance: 0,
  };

  const GATHER_MARKER = {
    className: "bullet",
    begin: /^\s*-(?!>)\s*/,
    relevance: 0,
  };

  // Labels sit on the choice/gather marker (`* (name)`, `- (name)`), not
  // after an identifier (`play_sound(name)`). Combined with the marker so
  // we don't need a lookbehind.
  const CHOICE_WITH_LABEL = {
    begin: [/^\s*(?:\*\s*)+|^\s*(?:\+\s*)+/, /\(\s*[\w]+\s*\)/],
    beginScope: { 1: "bullet", 2: "symbol" },
    relevance: 0,
  };

  const GATHER_WITH_LABEL = {
    begin: [/^\s*-(?!>)\s*/, /\(\s*[\w]+\s*\)/],
    beginScope: { 1: "bullet", 2: "symbol" },
    relevance: 0,
  };

  const CHOICE_TEXT = {
    className: "string",
    begin: /\[/,
    end: /\]/,
  };

  const DIVERT_ARROW = {
    className: "operator",
    begin: /->->|->|<-/,
    relevance: 5,
  };

  const TODO_COMMENT = {
    className: "keyword",
    begin: /\bTODO:/,
    relevance: 0,
  };

  const LOGIC_LINE = {
    className: "meta",
    begin: /^\s*~/,
    relevance: 0,
  };

  const TAG = {
    className: "meta",
    begin: /^\s*#\s*[\w.-]+/,
    relevance: 0,
  };

  const GLUE = {
    className: "operator",
    begin: /<>/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const INTERPOLATION = {
    className: "template-variable",
    begin: /\{[A-Za-z_][\w.]*\}/,
    relevance: 0,
  };

  const SUBST_BRACE = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    contains: [/** @type {"self"} */ ("self")],
    relevance: 0,
  };

  return {
    name: "Ink",
    aliases: ["inkle"],
    keywords: {
      keyword:
        "VAR|5 CONST LIST|5 EXTERNAL INCLUDE|5 function return temp ref else not and or mod has hasnt",
      literal: "true false END DONE",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      KNOT,
      STITCH,
      CHOICE_WITH_LABEL,
      GATHER_WITH_LABEL,
      CHOICE_MARKER,
      GATHER_MARKER,
      CHOICE_TEXT,
      DIVERT_ARROW,
      TODO_COMMENT,
      LOGIC_LINE,
      TAG,
      GLUE,
      STRING,
      INTERPOLATION,
      SUBST_BRACE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineInk(hljs);
}

export const ink = { name: "ink", register };
export default ink;
