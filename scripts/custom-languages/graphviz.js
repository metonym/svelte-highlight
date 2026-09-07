const GRAPHVIZ_ATTRS = [
  "label",
  "shape",
  "color",
  "style",
  "fillcolor",
  "fontname",
  "fontsize",
  "rankdir",
  "rank",
  "dir",
  "arrowhead",
  "arrowtail",
  "weight",
  "penwidth",
  "width",
  "height",
  "bgcolor",
  "splines",
  "nodesep",
  "ranksep",
  "constraint",
  "xlabel",
  "headlabel",
  "taillabel",
  "tooltip",
  "URL",
  "href",
  "id",
  "group",
  "pos",
  "layout",
  "overlap",
  "compound",
  "cluster",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGraphviz(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [{ begin: /\\[ln"\\]/ }],
  };

  const HTML_LABEL = {
    begin: /</,
    end: />/,
    subLanguage: "xml",
    relevance: 0,
  };

  const PORT = {
    className: "symbol",
    begin: /:[A-Za-z_][\w]*|:[ns]|:[ns]?[ew]/,
    relevance: 0,
  };

  const EDGE_OP = {
    className: "operator",
    begin: /->|--/,
    relevance: 5,
  };

  const KNOWN_ATTR_NAME = {
    className: "built_in",
    begin: new RegExp(`\\b(?:${GRAPHVIZ_ATTRS.join("|")})(?=\\s*=)`),
    relevance: 0,
  };

  const ATTR_NAME = {
    className: "attr",
    begin: /\b[A-Za-z_][\w]*(?=\s*=)/,
    relevance: 0,
  };

  const SUBGRAPH_NAME = {
    begin: [/\bsubgraph\b/, /\s+/, /[A-Za-z_][\w]*/],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 5,
  };

  return {
    name: "Graphviz",
    aliases: ["dot", "gv"],
    case_insensitive: true,
    keywords: {
      keyword: "strict graph digraph subgraph node edge",
      built_in: GRAPHVIZ_ATTRS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      { begin: /\bdigraph\b/, className: "keyword", relevance: 10 },
      SUBGRAPH_NAME,
      STRING,
      HTML_LABEL,
      PORT,
      EDGE_OP,
      KNOWN_ATTR_NAME,
      ATTR_NAME,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGraphviz(hljs);
}

export const graphviz = { name: "graphviz", register };
export default graphviz;
