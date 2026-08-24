const MERMAID_KEYWORDS =
  "flowchart graph subgraph sequenceDiagram classDiagram stateDiagram " +
  "stateDiagram-v2 erDiagram gantt pie gitGraph journey mindmap timeline " +
  "sankey sankey-beta quadrantChart xyChart xychart-beta block block-beta " +
  "C4Context C4Container C4Component C4Dynamic C4Deployment " +
  "participant actor activate deactivate Note loop alt else opt par and " +
  "critical break rect autonumber class namespace interface enum state " +
  "section title dateFormat axisFormat commit branch checkout merge " +
  "cherry-pick direction TB TD BT RL LR click style classDef linkStyle " +
  "end callback href";

const MERMAID_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMermaid(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/ },
    ],
  };

  // `%% comment` and `%%{init: ...}%%` directives. The latter is still a
  // comment-like fence for highlighting purposes.
  const COMMENT = {
    className: "comment",
    begin: /%%/,
    end: /$/,
  };

  // Longer arrows first. `->` would otherwise steal `->>` / `-->`.
  const ARROW = {
    className: "operator",
    begin: /<-->|-\.->>|-->>|->>|-->|<--|==>|-\.->|-\.-|---|--x|x--|o--|o-o|->/,
    relevance: 0,
  };

  const NODE_TEXT = {
    className: "string",
    begin: /[[{(]/,
    end: /[\])}]/,
    contains: [STRING],
    relevance: 0,
  };

  // Diagram type names are the strongest auto-detect signal; keep them
  // from blending into generic `graph`/`class` languages.
  const DIAGRAM_TYPE = {
    className: "keyword",
    begin:
      /\b(?:flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|gitGraph|quadrantChart|xychart-beta|xyChart|sankey-beta|sankey|block-beta|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|timeline|journey|gantt)\b/,
    relevance: 10,
  };

  return {
    name: "Mermaid",
    aliases: ["mermaid", "mmd"],
    keywords: {
      $pattern: "[a-zA-Z_][\\w-]*",
      keyword: MERMAID_KEYWORDS,
      literal: MERMAID_LITERALS,
    },
    contains: [
      COMMENT,
      DIAGRAM_TYPE,
      STRING,
      ARROW,
      NODE_TEXT,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMermaid(hljs);
}

export const mermaid = { name: "mermaid", register };
export default mermaid;
