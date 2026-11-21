const COBOL_KEYWORDS =
  // Verbs and their scope terminators.
  "accept add alter call cancel close compute continue delete display " +
  "divide evaluate exit generate go goback if initialize initiate inspect " +
  "invoke merge move multiply open perform read release return rewrite " +
  "search set sort start stop string subtract unstring write when other " +
  "also else then not end-if end-perform end-evaluate end-read end-write " +
  "end-compute end-call end-search end-string end-unstring end-add " +
  "end-subtract end-multiply end-divide end-start end-delete end-rewrite " +
  "end-return end-accept end-display exec end-exec " +
  // Clauses and phrases.
  "to from into by giving using returning varying until times thru through " +
  "after before upon with test run program-id author installation " +
  "date-written date-compiled file-control i-o-control repository select assign " +
  "organization access mode record key is are fd sd working-storage " +
  "local-storage linkage file screen report configuration input-output " +
  "source-computer object-computer special-names value values occurs " +
  "depending on indexed redefines renames filler usage sign leading " +
  "trailing separate justified right blank all and or of in corresponding " +
  "corr replacing tallying converting for characters first initial " +
  "delimited size overflow exception error invalid end at line lines " +
  "advancing page function input output extend sequential random dynamic " +
  "relative status copy replace class global external ascending " +
  "descending optional rounded remainder equal greater less than";

const COBOL_TYPES =
  "comp comp-1 comp-2 comp-3 comp-4 comp-5 computational " +
  "computational-1 computational-2 computational-3 computational-4 " +
  "computational-5 binary packed-decimal index pointer";

const COBOL_LITERALS =
  "zero zeros zeroes space spaces high-value high-values low-value " +
  "low-values quote quotes null nulls true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCobol(hljs) {
  // Fixed form: `*` or `/` in column 7 makes the whole line a comment.
  const FIXED_COMMENT = hljs.COMMENT(/^[ \d]{6}[*/]/, /$/, { relevance: 0 });

  // Free form: `*>` starts a comment anywhere on the line.
  const INLINE_COMMENT = hljs.COMMENT(/\*>/, /$/, { relevance: 0 });

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [{ begin: /""/ }] },
      { begin: /'/, end: /'/, contains: [{ begin: /''/ }] },
    ],
    relevance: 0,
  };

  const DIVISION = {
    className: "section",
    begin: /\b(?:identification|id|environment|data|procedure)\s+division\b/,
    relevance: 10,
  };

  const SECTION = {
    className: "section",
    begin: /\b[a-z0-9][\w-]*[ \t]+section\b/,
    relevance: 2,
  };

  const PROGRAM_ID = {
    begin: [/\b(?:program-id|function-id|class-id)/, /\.[ \t]*/, /[\w-]+/],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 10,
  };

  // 05 WS-TOTAL PIC 9(5). The level number opens a data description entry.
  const LEVEL = {
    begin: [
      /^(?:\d{6})?[ \t]*/,
      /\d{1,2}/,
      /[ \t]+/,
      /(?!filler\b)[a-z][\w-]*/,
    ],
    beginScope: { 2: "number", 4: "variable" },
    relevance: 0,
  };

  // PIC 9(5)V99, PICTURE IS S9(7)V99, PIC ZZ,ZZ9.99. The final period
  // ends the sentence, not the picture string.
  const PICTURE = {
    begin: [/\bpic(?:ture)?/, /[ \t]+(?:is[ \t]+)?/, /\S+?(?=\.?(?:\s|$))/],
    beginScope: { 1: "keyword", 3: "type" },
    relevance: 2,
  };

  // A name alone on a line, in area A, followed by a period.
  const PARAGRAPH = {
    begin: [
      /^(?:\d{6})? {0,10}/,
      /(?!(?:goback|exit|continue|else|end-[\w-]+|file-control|i-o-control|source-computer|object-computer|special-names|repository)\.)[a-z0-9][\w-]*(?=\.[ \t]*$)/,
    ],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  // Columns 1-6 of fixed form hold sequence numbers the compiler ignores.
  // Keep them plain, as LEVEL and PARAGRAPH do.
  const SEQUENCE_AREA = {
    begin: /^\d{6}(?=[ \t]|$)/,
    relevance: 0,
  };

  const PERFORM = {
    begin: [
      /\bperform/,
      /[ \t]+/,
      /(?!(?:varying|until|with|test|forever)\b)(?!\d+(?![\w-]))[a-z0-9][\w-]*/,
    ],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 0,
  };

  const INTRINSIC = {
    begin: [/\bfunction/, /[ \t]+/, /[a-z][\w-]*/],
    beginScope: { 1: "keyword", 3: "built_in" },
    relevance: 0,
  };

  const USAGE_TYPE = {
    className: "type",
    begin: /\b(?:comp|computational)-[1-5x]\b/,
    relevance: 0,
  };

  // Names such as WS-LINE-1 or 1000-INIT: keep the digits out of the
  // number rule and the last segment out of the keyword table.
  const HYPHENATED_NAME = {
    begin: /\b(?:\d+-|[a-z]\w*(?:-[a-z]\w*)*-\d)[\w-]*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "COBOL",
    aliases: ["cob", "cbl", "cpy"],
    case_insensitive: true,
    keywords: {
      $pattern: /[a-z][\w-]*/,
      keyword: COBOL_KEYWORDS,
      type: COBOL_TYPES,
      literal: COBOL_LITERALS,
    },
    contains: [
      FIXED_COMMENT,
      INLINE_COMMENT,
      STRING,
      DIVISION,
      SECTION,
      PROGRAM_ID,
      LEVEL,
      PARAGRAPH,
      SEQUENCE_AREA,
      PICTURE,
      PERFORM,
      INTRINSIC,
      USAGE_TYPE,
      HYPHENATED_NAME,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCobol(hljs);
}

export const cobol = { name: "cobol", register };
export default cobol;
