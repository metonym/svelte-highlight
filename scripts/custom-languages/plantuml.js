const PLANTUML_KEYWORDS = [
  "actor",
  "participant",
  "boundary",
  "control",
  "entity",
  "database",
  "collections",
  "queue",
  "usecase",
  "class",
  "interface",
  "enum",
  "abstract",
  "annotation",
  "package",
  "namespace",
  "node",
  "folder",
  "frame",
  "cloud",
  "rectangle",
  "component",
  "artifact",
  "card",
  "agent",
  "storage",
  "file",
  "stack",
  "hexagon",
  "state",
  "object",
  "map",
  "json",
  "diamond",
  "circle",
  "label",
  "as",
  "activate",
  "deactivate",
  "destroy",
  "create",
  "return",
  "alt",
  "else",
  "opt",
  "loop",
  "par",
  "break",
  "critical",
  "group",
  "end",
  "ref",
  "over",
  "note",
  "left",
  "right",
  "top",
  "bottom",
  "of",
  "on",
  "link",
  "hnote",
  "rnote",
  "title",
  "header",
  "footer",
  "legend",
  "endlegend",
  "caption",
  "newpage",
  "autonumber",
  "hide",
  "show",
  "skinparam",
  "skin",
  "scale",
  "start",
  "stop",
  "if",
  "then",
  "elseif",
  "endif",
  "while",
  "endwhile",
  "repeat",
  "fork",
  "again",
  "split",
  "detach",
  "kill",
  "partition",
  "swimlane",
  "together",
  "remove",
  "restore",
];

const PLANTUML_START_TAGS =
  "@startuml @enduml @startmindmap @endmindmap @startgantt @endgantt @startjson @endjson @startyaml @endyaml @startsalt @endsalt @startwbs @endwbs @startditaa @endditaa @startdot @enddot";

const PLANTUML_PREPROCESSOR =
  "!include !define !procedure !function !endprocedure !endfunction !if !else !endif !theme !pragma";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePlantuml(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const START_TAG = {
    className: "meta",
    begin: new RegExp(`^(?:${PLANTUML_START_TAGS.split(" ").join("|")})\\b`),
    relevance: 10,
  };

  const PREPROCESSOR = {
    className: "meta",
    begin: new RegExp(
      `^(?:${PLANTUML_PREPROCESSOR.split(" ").join("|")})\\b|^!\\$\\w+\\s*=`,
    ),
    relevance: 0,
  };

  const DIRECTION = {
    className: "keyword",
    begin: /\b(?:left to right direction|top to bottom direction)\b/,
    relevance: 0,
  };

  const ARROW = {
    className: "operator",
    begin:
      /<\|--|--\|>|\*--|o--|\.\.>|<-->|-->|<--|->>|->|<-|\.\.|--|-\[#\w+\]->|-\[hidden\]-/,
    relevance: 5,
  };

  const STEREOTYPE = {
    className: "type",
    begin: /<</,
    end: />>/,
  };

  const COLOR = {
    className: "number",
    begin: /#[0-9A-Fa-f]{6}\b|#[A-Za-z]+\b/,
    relevance: 0,
  };

  const STATE_MARKER = {
    className: "literal",
    begin: /\[\*\]/,
    relevance: 0,
  };

  return {
    name: "PlantUML",
    aliases: ["puml", "pu"],
    keywords: {
      keyword: PLANTUML_KEYWORDS,
    },
    contains: [
      hljs.COMMENT("'", "$"),
      hljs.COMMENT(/\/'/, /'\//),
      STRING,
      START_TAG,
      PREPROCESSOR,
      DIRECTION,
      STEREOTYPE,
      STATE_MARKER,
      ARROW,
      COLOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePlantuml(hljs);
}

export const plantuml = { name: "plantuml", register };
export default plantuml;
