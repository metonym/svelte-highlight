const ORG_TODO_WORDS = "TODO|DONE|NEXT|WAITING|CANCELLED";

const ORG_META_KEYWORDS = "TITLE|AUTHOR|OPTIONS|PROPERTY|STARTUP|FILETAGS|TODO";

function defineOrg() {
  const PRIORITY = {
    className: "meta",
    begin: /\[#[A-Z]\]/,
    relevance: 0,
  };

  const TAGS = {
    className: "symbol",
    begin: /:[\w@%]+(?::[\w@%]+)*:\s*$/,
    relevance: 0,
  };

  const HEADLINE_KEYWORD = {
    className: "section",
    begin: new RegExp(`^\\*+ (?=(?:${ORG_TODO_WORDS})\\b)`),
    end: /$/,
    relevance: 10,
    contains: [
      { className: "keyword", begin: new RegExp(ORG_TODO_WORDS) },
      PRIORITY,
      TAGS,
    ],
  };

  const HEADLINE = {
    className: "section",
    begin: /^\*+ /,
    end: /$/,
    relevance: 0,
    contains: [PRIORITY, TAGS],
  };

  const META_LINE = {
    className: "meta",
    begin: new RegExp(`^#\\+(?:${ORG_META_KEYWORDS}):`),
    relevance: 5,
  };

  const BLOCK = {
    className: "code",
    begin: /^\s*#\+begin_(?:src|quote|example|export)\b.*$/i,
    end: /^\s*#\+end_(?:src|quote|example|export)\b/i,
    relevance: 0,
  };

  const DRAWER_LINE = {
    className: "attr",
    begin: /^\s*:[A-Za-z_][\w-]*:(?=\s|$)/,
    relevance: 0,
  };

  const TIMESTAMP = {
    className: "number",
    begin: /[<[]\d{4}-\d{2}-\d{2}(?:\s+[A-Za-z]+)?(?:\s+\d{2}:\d{2})?[\]>]/,
    relevance: 0,
  };

  const PLANNING_KEYWORD = {
    className: "keyword",
    begin: /\b(?:SCHEDULED|DEADLINE|CLOSED):/,
    relevance: 5,
  };

  const LINK = {
    className: "link",
    begin: /\[\[/,
    end: /\]\]/,
    contains: [
      {
        className: "string",
        begin: /\]\[/,
        end: /(?=\]\])/,
        excludeBegin: true,
      },
    ],
    relevance: 0,
  };

  const FOOTNOTE = {
    className: "link",
    begin: /\[fn:[\w-]*\]/,
    relevance: 0,
  };

  const CHECKBOX = {
    className: "bullet",
    begin: /\[[ Xx-]\]/,
    relevance: 0,
  };

  const BULLET = {
    className: "bullet",
    begin: /^\s*(?:[-+*]|\d+[.)])\s/,
    relevance: 0,
  };

  const TABLE_PIPE = {
    className: "bullet",
    begin: /\|/,
    relevance: 0,
  };

  const COMMENT_LINE = {
    className: "comment",
    begin: /^\s*#(?:\s.*)?$/,
    relevance: 0,
  };

  const BOLD = {
    className: "strong",
    begin: /\*\S([^\n*]*\S)?\*/,
    relevance: 0,
  };
  const ITALIC = {
    className: "emphasis",
    begin: /\/\S([^\n/]*\S)?\//,
    relevance: 0,
  };
  const UNDERLINE = {
    className: "emphasis",
    begin: /_\S([^\n_]*\S)?_/,
    relevance: 0,
  };
  const VERBATIM = {
    className: "code",
    begin: /=\S([^\n=]*\S)?=/,
    relevance: 0,
  };
  const CODE_TILDE = {
    className: "code",
    begin: /~\S([^\n~]*\S)?~/,
    relevance: 0,
  };
  const STRIKE = {
    className: "strong",
    begin: /\+\S([^\n+]*\S)?\+/,
    relevance: 0,
  };

  return {
    name: "Org",
    aliases: ["orgmode"],
    contains: [
      BLOCK,
      HEADLINE_KEYWORD,
      HEADLINE,
      META_LINE,
      COMMENT_LINE,
      DRAWER_LINE,
      PLANNING_KEYWORD,
      TIMESTAMP,
      LINK,
      FOOTNOTE,
      CHECKBOX,
      BULLET,
      TABLE_PIPE,
      BOLD,
      ITALIC,
      UNDERLINE,
      VERBATIM,
      CODE_TILDE,
      STRIKE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineOrg();
}

export const org = { name: "org", register };
export default org;
