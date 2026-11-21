// Robot Framework control words are case-sensitive and always uppercase.
// They stay at relevance 0 because the same words show up in COBOL, SQL,
// and BASIC; section headers carry the auto-detection weight instead.
const CONTROL_WORDS = [
  "FOR",
  "IN",
  "RANGE",
  "ENUMERATE",
  "ZIP",
  "END",
  "IF",
  "ELSE",
  "TRY",
  "EXCEPT",
  "FINALLY",
  "WHILE",
  "BREAK",
  "CONTINUE",
  "RETURN",
  "VAR",
  "GROUP",
  "AND",
];

const SETTINGS_IN_BRACKETS =
  "Documentation|Tags|Arguments|Return|Setup|Teardown|Timeout|Template";

// Section headers are case-insensitive, but control words are not, so the
// grammar stays case-sensitive and builds `[sS]`-style classes here.
/** @param {string} word */
function anyCase(word) {
  return word.replace(
    /[a-z]/gi,
    (c) => `[${c.toLowerCase()}${c.toUpperCase()}]`,
  );
}

// A header may carry column names after it: `*** Test Cases ***    ARG`.
/** @param {string[]} names */
function sectionHeader(names) {
  const alternatives = names.map(anyCase).join("|");
  return new RegExp(
    `^\\*+[ \\t]*(?:${alternatives})(?:[ \\t]*\\*+)?(?=[ \\t]*$| {2,}|\\t)`,
  );
}

// A cell ends at two or more spaces, a tab, or the end of the line.
const CELL_END = /(?= {2,}|\t| ?$)/.source;

function defineRobotframework() {
  // `#` starts a comment only at the start of a cell, after two or more
  // spaces or a tab. `issue #42` stays one plain cell.
  const COMMENT = {
    match: [/(?:^|[ \t]{2,}|\t)/, /#.*/],
    scope: { 2: "comment" },
    relevance: 0,
  };

  const ESCAPE = { scope: "char.escape", match: /\\./, relevance: 0 };

  // `${scalar}`, `@{list}`, `&{dict}`, `%{ENV}`, with nesting such as
  // `${items}[${index}]` or `${{ python }}`.
  const VARIABLE = {
    scope: "variable",
    begin: /[$@&%]\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      {
        begin: /\{/,
        end: /\}/,
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
      },
    ]),
    relevance: 0,
  };

  const BRACKET_SETTING = {
    scope: "meta",
    match: new RegExp(`\\[(?:${SETTINGS_IN_BRACKETS})\\]`),
    relevance: 3,
  };

  // Column-0 names in the Settings section: `Library`, `Suite Setup`, ...
  const SETTING_NAME = {
    scope: "keyword",
    match: new RegExp(`^[A-Za-z][\\w ]*?${CELL_END}`),
    relevance: 0,
  };

  // Column-0 names in Test Cases, Tasks, and Keywords sections. Embedded
  // arguments like `User ${name} logs in` keep their variable color.
  const DEFINITION_NAME = {
    scope: "title.function",
    begin: /^[^\s#*]/,
    end: new RegExp(CELL_END),
    contains: [VARIABLE],
    relevance: 0,
  };

  // The first cell of an indented step is the keyword being called.
  // Settings, continuations, comments, and control words are skipped.
  const CALLED_KEYWORD = new RegExp(
    `(?![$@&%]\\{|\\[|\\.\\.\\.|#|(?:${CONTROL_WORDS.join("|")}|ELSE IF)${CELL_END})` +
      `[^\\s].*?${CELL_END}`,
  );
  const INDENT = /^(?: {2,}|\t)[ \t]*/;

  const KEYWORD_CALL = {
    match: [INDENT, CALLED_KEYWORD],
    scope: { 2: "title.function.invoke" },
    relevance: 0,
  };

  // `${result}=    Get Value    arg` assigns what a keyword call returns.
  const ASSIGNED_CALL = {
    match: [
      INDENT,
      /[$@&]\{[^{}]*\}/,
      /(?:\[[^\]]*\])* ?=?(?: {2,}|\t)[ \t]*/,
      CALLED_KEYWORD,
    ],
    scope: { 2: "variable", 4: "title.function.invoke" },
    relevance: 0,
  };

  const CONTINUATION = {
    scope: "punctuation",
    match: /^[ \t]*\.\.\./,
    relevance: 0,
  };

  const STEP_KEYWORDS = {
    $pattern: /[A-Z]+/,
    keyword: CONTROL_WORDS.map((word) => `${word}|0`).join(" "),
  };

  // The header holds the relevance. hljs counts a mode's relevance only
  // when the mode closes, and the last section stays open until EOF.
  /**
   * @param {string[]} names
   * @param {import("highlight.js").Mode} body
   * @returns {import("highlight.js").Mode}
   */
  const section = (names, body) => ({
    scope: "section",
    match: sectionHeader(names),
    relevance: 20,
    starts: { end: /(?=^\*)/, relevance: 0, ...body },
  });

  const SETTINGS_SECTION = section(["settings", "setting"], {
    contains: [COMMENT, CONTINUATION, VARIABLE, ESCAPE, SETTING_NAME],
  });

  const VARIABLES_SECTION = section(["variables", "variable"], {
    contains: [COMMENT, CONTINUATION, VARIABLE, ESCAPE],
  });

  const STEPS_SECTION = section(
    ["test cases", "test case", "tasks", "task", "keywords", "keyword"],
    {
      keywords: STEP_KEYWORDS,
      contains: [
        COMMENT,
        CONTINUATION,
        BRACKET_SETTING,
        DEFINITION_NAME,
        ASSIGNED_CALL,
        KEYWORD_CALL,
        VARIABLE,
        ESCAPE,
      ],
    },
  );

  const COMMENTS_SECTION = section(["comments", "comment"], {
    contains: [{ scope: "comment", match: /^(?!\*).+/, relevance: 0 }],
  });

  return {
    name: "Robot Framework",
    aliases: ["robot"],
    contains: [
      SETTINGS_SECTION,
      VARIABLES_SECTION,
      STEPS_SECTION,
      COMMENTS_SECTION,
      COMMENT,
      VARIABLE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineRobotframework();
}

export const robotframework = { name: "robotframework", register };
export default robotframework;
