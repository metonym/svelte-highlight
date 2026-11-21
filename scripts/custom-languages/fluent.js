// Project Fluent (`.ftl`) localization files. A message is `id = pattern`;
// a term is `-id = pattern`; indented `.attr = pattern` lines add
// attributes. Patterns are plain text with `{ ... }` placeables that hold
// variables, term and message references, function calls, and select
// expressions with `[key]` and `*[default]` variants.

const IDENTIFIER = /[a-zA-Z][\w-]*/.source;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFluent(hljs) {
  // `" "`, `"{"`: string literals only live inside placeables.
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [
      {
        className: "char.escape",
        begin: /\\(?:[\\"]|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{6})/,
      },
    ],
  };

  /** @type {import("highlight.js").Mode} */
  const PLACEABLE = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    relevance: 0,
  };

  // A variant runs to the end of its line: `*[other] { $count } items`.
  const VARIANT = {
    variants: [
      {
        begin: [/^[ \t]*/, /\*/, /\[[ \t]*[^\]\s]+[ \t]*\]/],
        beginScope: { 2: "operator", 3: "symbol" },
        relevance: 10,
      },
      {
        begin: [/^[ \t]*/, /\[[ \t]*[^\]\s]+[ \t]*\]/],
        beginScope: { 2: "symbol" },
        relevance: 0,
      },
    ],
    end: /$|(?=\})/,
    contains: [PLACEABLE],
  };

  PLACEABLE.contains =
    /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      STRING,
      VARIANT,
      "self",
      { className: "operator", begin: /->/, relevance: 5 },
      // `NUMBER($n, minimumFractionDigits: 2)`
      {
        className: "built_in",
        begin: new RegExp(`[A-Z][A-Z0-9_-]*(?=\\()`),
        relevance: 2,
      },
      { className: "attr", begin: new RegExp(`${IDENTIFIER}(?=[ \\t]*:)`) },
      {
        className: "variable",
        begin: new RegExp(`\\$${IDENTIFIER}`),
        relevance: 2,
      },
      { className: "title", begin: new RegExp(`-${IDENTIFIER}`), relevance: 5 },
      { className: "attr", begin: new RegExp(`\\.${IDENTIFIER}`) },
      { className: "number", begin: /-?\d+(?:\.\d+)?/, relevance: 0 },
      // A bare identifier is a message reference: `{ menu-save }`.
      { className: "title", begin: new RegExp(IDENTIFIER), relevance: 0 },
    ]);

  // `## Group comment`, `### Resource comment`, `# Message comment`.
  const COMMENT = hljs.COMMENT(/^#{1,3}(?=[ \t]|$)/, /$/);

  // `brand-name = Firefox` or `-brand-name = Firefox` at column 0.
  const ENTRY = {
    begin: [new RegExp(`^-?${IDENTIFIER}`), /[ \t]*/, /=/],
    beginScope: { 1: "title", 3: "operator" },
    relevance: 0,
  };

  // `    .placeholder = Search` on an indented line.
  const ATTRIBUTE = {
    begin: [/^[ \t]+/, new RegExp(`\\.${IDENTIFIER}`), /[ \t]*/, /=/],
    beginScope: { 2: "attr", 4: "operator" },
    relevance: 2,
  };

  return {
    name: "Fluent",
    aliases: ["ftl"],
    contains: [COMMENT, ENTRY, ATTRIBUTE, PLACEABLE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineFluent(hljs);
}

export const fluent = { name: "fluent", register };
export default fluent;
