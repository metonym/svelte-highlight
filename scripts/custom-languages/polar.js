const POLAR_KEYWORDS =
  "allow if and or not in matches forall resource actor " +
  "has_permission has_role has_relation cut debug print new type";

const POLAR_LITERALS = "true false nil";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePolar(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const COMMENT = {
    className: "comment",
    begin: /#/,
    end: /$/,
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  const TYPE_NAME = {
    className: "title.class",
    begin: /\b[A-Z][A-Za-z0-9_]*/,
    relevance: 0,
  };

  return {
    name: "Polar",
    aliases: ["polar"],
    keywords: {
      keyword: POLAR_KEYWORDS,
      literal: POLAR_LITERALS,
    },
    contains: [COMMENT, STRING, TYPE_NAME, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePolar(hljs);
}

export const polar = { name: "polar", register };
export default polar;
