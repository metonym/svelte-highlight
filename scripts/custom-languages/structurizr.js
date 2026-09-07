const STRUCTURIZR_KEYWORDS = [
  "workspace",
  "model",
  "views",
  "configuration",
  "styles",
  "themes",
  "theme",
  "branding",
  "terminology",
  "properties",
  "perspectives",
  "person",
  "softwareSystem",
  "container",
  "component",
  "deploymentEnvironment",
  "deploymentGroup",
  "deploymentNode",
  "infrastructureNode",
  "softwareSystemInstance",
  "containerInstance",
  "healthCheck",
  "element",
  "relationship",
  "group",
  "enterprise",
  "systemLandscape",
  "systemContext",
  "dynamic",
  "deployment",
  "filtered",
  "custom",
  "image",
  "include",
  "exclude",
  "autoLayout",
  "autolayout",
  "default",
  "animation",
  "title",
  "description",
  "tags",
  "url",
  "technology",
  "shape",
  "icon",
  "width",
  "height",
  "background",
  "color",
  "colour",
  "stroke",
  "strokeWidth",
  "fontSize",
  "border",
  "opacity",
  "metadata",
  "thickness",
  "dashed",
  "routing",
  "position",
];

const STRUCTURIZR_PREPROCESSOR = [
  "!identifiers",
  "!docs",
  "!adrs",
  "!include",
  "!constant",
  "!var",
  "!ref",
  "!extend",
  "!plugin",
  "!script",
  "!impliedRelationships",
  "!elements",
  "!relationships",
];

const STRUCTURIZR_LITERALS = "this hierarchical flat tb bt lr rl";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineStructurizr(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const SUBSTITUTION = {
    className: "template-variable",
    begin: /\$\{/,
    end: /\}/,
    relevance: 0,
  };

  const ARROW = {
    className: "operator",
    begin: /->/,
    relevance: 0,
  };

  const HIGH_RELEVANCE_KEYWORD = {
    className: "keyword",
    begin: /\bsoftwareSystem\b/,
    relevance: 5,
  };

  const HIGH_RELEVANCE_PREPROCESSOR = {
    className: "meta",
    begin: /!identifiers\b/,
    relevance: 5,
  };

  const PREPROCESSOR = {
    className: "meta",
    begin: new RegExp(`(?:${STRUCTURIZR_PREPROCESSOR.join("|")})\\b`),
    relevance: 0,
  };

  const IDENTIFIER_ASSIGN = {
    className: "variable",
    begin: /\b[A-Za-z_][\w]*(?=\s*=(?!=))/,
    relevance: 0,
  };

  return {
    name: "Structurizr",
    aliases: ["c4"],
    keywords: {
      keyword: STRUCTURIZR_KEYWORDS,
      literal: STRUCTURIZR_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      SUBSTITUTION,
      HIGH_RELEVANCE_KEYWORD,
      HIGH_RELEVANCE_PREPROCESSOR,
      PREPROCESSOR,
      IDENTIFIER_ASSIGN,
      ARROW,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineStructurizr(hljs);
}

export const structurizr = { name: "structurizr", register };
export default structurizr;
