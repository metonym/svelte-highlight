/** @param {import("highlight.js").HLJSApi} hljs */
function defineRst(hljs) {
  // A transition / section-title adornment line: a single repeated
  // punctuation character spanning (most of) the line, e.g. `=====` or `~~~`.
  const ADORNMENT_CHAR = /[=\-`:'"~^_*+#<>.]/;
  const ADORNMENT_LINE = new RegExp(
    `^(${ADORNMENT_CHAR.source})\\1{2,}[ \\t]*$`,
  );

  const SECTION_TITLE = {
    className: "section",
    begin: ADORNMENT_LINE,
    relevance: 10,
  };

  const FIELD_LIST = {
    className: "attr",
    begin: /^[ \t]*:[^:\n]+:(?=\s|$)/,
    relevance: 5,
  };

  const DIRECTIVE = {
    // `.. directive-name:: arguments`; the directive name is highlighted
    // as a keyword whether or not it's one of the well-known directives.
    begin: [/^[ \t]*\.\./, /\s+/, /[\w-]+/, /::/],
    beginScope: { 1: "meta", 3: "keyword", 4: "meta" },
    end: /$/,
    relevance: 10,
  };

  const SUBSTITUTION_DEFINITION = {
    className: "meta",
    begin: /^[ \t]*\.\.\s+\|[^|]+\|\s+[\w-]+::/,
    end: /$/,
    returnEnd: true,
    relevance: 10,
  };

  const HYPERLINK_TARGET = {
    className: "meta",
    begin: /^[ \t]*\.\.\s+_[^:\n]*:/,
    end: /$/,
    returnEnd: true,
    relevance: 10,
  };

  const COMMENT = {
    className: "comment",
    begin: /^[ \t]*\.\.(?!\s+\|[^|]+\|\s+[\w-]+::)(?!\s+[\w-]+::)(?!\s+_)/,
    end: /$/,
    relevance: 0,
  };

  const ROLE = {
    className: "symbol",
    begin: /:[\w-]+:(?=`)/,
    relevance: 5,
  };

  const LITERAL = {
    className: "code",
    begin: /``/,
    end: /``/,
    relevance: 5,
  };

  const INTERPRETED_TEXT = {
    className: "string",
    begin: /`/,
    end: /`_{0,2}/,
    relevance: 0,
  };

  const HYPERLINK_REFERENCE = {
    className: "link",
    begin: /\b\w[\w.+-]*_{1,2}\b/,
    relevance: 0,
  };

  const SUBSTITUTION_REFERENCE = {
    className: "template-variable",
    begin: /\|[^|\s][^|\n]*\|/,
    relevance: 0,
  };

  const STRONG = {
    className: "strong",
    begin: /\*\*(?=\S)/,
    end: /\*\*/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  const EMPHASIS = {
    className: "emphasis",
    begin: /\*(?=\S)(?!\*)/,
    end: /\*/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  const BULLET_LIST = {
    className: "bullet",
    begin: /^[ \t]*[-*+](?=\s+\S| |$)/,
    relevance: 0,
  };

  const NUMBERED_LIST = {
    className: "bullet",
    begin: /^[ \t]*(?:\d+|#)\.(?=\s)/,
    relevance: 0,
  };

  return {
    name: "reStructuredText",
    aliases: ["rst", "restructuredtext"],
    case_insensitive: false,
    contains: [
      SECTION_TITLE,
      SUBSTITUTION_DEFINITION,
      HYPERLINK_TARGET,
      DIRECTIVE,
      COMMENT,
      FIELD_LIST,
      BULLET_LIST,
      NUMBERED_LIST,
      ROLE,
      LITERAL,
      INTERPRETED_TEXT,
      SUBSTITUTION_REFERENCE,
      HYPERLINK_REFERENCE,
      STRONG,
      EMPHASIS,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRst(hljs);
}

export const rst = { name: "rst", register };
export default rst;
