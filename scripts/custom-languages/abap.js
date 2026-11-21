// Words that also read as plain SQL or English carry no relevance, so a
// SQL or COBOL sample does not auto-detect as ABAP. Words only ABAP uses,
// such as ENDMETHOD and FIELD-SYMBOLS, carry extra weight.
const ABAP_KEYWORDS =
  // Declarations and program structure.
  "data|0 types constants field-symbols|5 field-symbol|3 statics " +
  "parameters select-options tables|0 class-data|3 class-methods|3 " +
  "class-events methods events interfaces aliases report program|0 " +
  "include|0 type-pools type|0 like|0 ref|0 to|0 of|0 begin|0 end|0 " +
  "occurs standard|0 sorted hashed table|0 range|0 line|0 lines|0 " +
  "length|0 decimals value|0 read-only|2 key|0 empty|0 unique|0 " +
  "non-unique components with|0 default|0 optional|0 preferred " +
  "parameter|0 " +
  // Classes and interfaces.
  "class|0 endclass|3 interface|0 endinterface|3 definition|0 " +
  "implementation|0 deferred public|0 protected|0 private|0 section|0 " +
  "abstract|0 final|0 create|0 inheriting from|0 redefinition friends " +
  "for|0 testing|0 risk level|0 harmless dangerous critical duration " +
  "short|0 medium|0 long|0 method|0 endmethod|3 importing exporting " +
  "changing returning receiving raising exceptions resumable " +
  "form endform|3 perform function|0 endfunction|3 module endmodule|3 " +
  // Control flow.
  "if|0 elseif else|0 endif case|0 when|0 others endcase|2 do|0 enddo|2 " +
  "while|0 endwhile|2 loop|0 endloop|2 at|0 into|0 assigning|3 reference " +
  "group|0 groups endat exit|0 continue|0 check|0 return|0 try|0 " +
  "catch|0 cleanup endtry|2 raise|0 resume retry " +
  // Statements.
  "call|0 append|0 insert|0 modify|0 delete|0 read|0 " +
  "collect sort|0 clear|0 free|0 refresh move|0 move-corresponding|3 " +
  "write|0 message|0 assign|0 unassign concatenate condense " +
  "translate|0 split|0 replace|0 find|0 shift|0 overlay transporting " +
  "submit leave commit|0 rollback|0 work|0 authority-check " +
  "exception|0 mapping|0 except|0 obligatory display|0 " +
  "set|0 get|0 handler|0 activation " +
  // Event blocks.
  "start-of-selection|5 end-of-selection|5 initialization " +
  "selection-screen top-of-page end-of-page load-of-program " +
  // Open SQL.
  "select|0 endselect|3 single|0 distinct|0 up|0 rows|0 where|0 " +
  "order|0 by|0 having|0 join|0 inner|0 left|0 right|0 outer|0 " +
  "on|0 as|0 appending corresponding|0 fields|0 entries|0 " +
  "ascending|0 descending|0 primary_key client|0 specified union|0 " +
  // Constructor expressions.
  "new|0 conv cond switch reduce filter cast|0 exact let|0 base|0 " +
  "init next then|0 in|0 using|0 " +
  // Logical and comparison operators.
  "and|0 or|0 not|0 equiv is|0 initial|0 bound assigned supplied " +
  "instance|0 between|0 eq ne lt gt le ge co cn ca na cs ns cp np " +
  "mod|0 div|0 bit-and bit-or bit-xor bit-not";

const ABAP_TYPES =
  "string|0 xstring int8 decfloat16 decfloat34 utclong abap_bool " +
  "any|0 simple|0 clike csequence xsequence numeric|0 object|0";

const ABAP_LITERALS = "abap_true abap_false abap_undefined space";

// Built-in functions, plus the ABAP SQL functions and aggregates.
const ABAP_BUILT_INS = [
  // Numeric functions.
  "abs",
  "ceil",
  "floor",
  "frac",
  "sign",
  "trunc",
  "ipow",
  "sqrt",
  "exp",
  "log",
  "log10",
  "round",
  "rescale",
  "nmax",
  "nmin",
  // Logical and table functions.
  "boolc",
  "boolx",
  "xsdbool",
  "lines",
  "line_exists",
  "line_index",
  // String functions.
  "strlen",
  "xstrlen",
  "numofchar",
  "charlen",
  "dbmaxlen",
  "condense",
  "concat_lines_of",
  "escape",
  "find",
  "find_end",
  "find_any_of",
  "find_any_not_of",
  "count",
  "count_any_of",
  "count_any_not_of",
  "contains",
  "contains_any_of",
  "contains_any_not_of",
  "matches",
  "match",
  "replace",
  "insert",
  "repeat",
  "reverse",
  "segment",
  "shift_left",
  "shift_right",
  "substring",
  "substring_after",
  "substring_before",
  "substring_from",
  "substring_to",
  "to_upper",
  "to_lower",
  "to_mixed",
  "from_mixed",
  "translate",
  "cmax",
  "cmin",
  "distance",
  "char_off",
  // Time stamp functions.
  "utclong_current",
  "utclong_add",
  "utclong_diff",
  // ABAP SQL.
  "sum",
  "avg",
  "min",
  "max",
  "cast",
  "coalesce",
  "upper",
  "lower",
  "concat",
  "length",
  "left",
  "right",
  "div",
  "mod",
  "division",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAbap(hljs) {
  // ABAP names can carry a /NAMESPACE/ prefix: /ui2/cl_json.
  const NAME = /(?:\/\w+\/)?[a-z_]\w*/;
  // Interface components join with `~`: if_oo_adt_classrun~main.
  const COMPONENT_NAME = /(?:\/\w+\/)?[a-z_]\w*(?:~[a-z_]\w*)?/;
  // A call's `(` is followed by a blank or `)`: calculate( x ), run( ).
  const CALL_PAREN = /(?=\((?:\s|\)))/;

  // A `*` in column 1 makes the whole line a comment.
  const LINE_COMMENT = hljs.COMMENT(/^\*/, /$/, { relevance: 0 });

  // `"` starts a comment anywhere. `"!` lines are ABAP Doc.
  const INLINE_COMMENT = hljs.COMMENT(/"/, /$/, {
    relevance: 0,
    contains: [
      { className: "doctag", begin: /@(?:parameter|raising|exception)\b/ },
    ],
  });

  // 'text' is a text field literal; `text` is a string literal. Each
  // doubles its delimiter to escape it.
  const STRING = {
    className: "string",
    variants: [
      { begin: /'/, end: /'/, contains: [{ begin: /''/ }] },
      { begin: /`/, end: /`/, contains: [{ begin: /``/ }] },
    ],
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  // `->` and `=>` select a component. The name after the selector is a
  // component, never a keyword: lo_doc->data is an attribute, and
  // zcl_util=>create( ) is a method call.
  const SELECTOR = {
    variants: [
      { begin: /->\*/, scope: "operator" },
      {
        begin: [/->|=>/, new RegExp(COMPONENT_NAME.source + CALL_PAREN.source)],
        beginScope: { 1: "operator", 2: "title.function.invoke" },
      },
      {
        begin: [/->|=>/, COMPONENT_NAME],
        beginScope: { 1: "operator", 2: "property" },
      },
    ],
    relevance: 0,
  };

  // zcl_util=>create( ): the name before `=>` is a class or interface.
  const STATIC_CLASS = {
    className: "title.class",
    begin: new RegExp(/\b/.source + NAME.source + /(?==>)/.source),
    relevance: 0,
  };

  // Inline declarations: DATA(lv_x), FINAL(lv_x), @DATA(lt_rows),
  // FIELD-SYMBOL(<line>). Method parameters use the same shape:
  // RETURNING VALUE(rv_total), IMPORTING REFERENCE(ir_data).
  const INLINE_DECLARATION = {
    variants: [
      {
        begin: [/\bfield-symbol/, /\(/, /<[a-z_][\w/]*>/, /\)/],
        relevance: 5,
      },
      {
        begin: [/@?\b(?:data|final)/, /\(/, /[a-z_]\w*/, /\)/],
        relevance: 3,
      },
      {
        begin: [/\b(?:value|reference)/, /\(/, /[a-z_]\w*/, /\)/],
        relevance: 0,
      },
    ],
    beginScope: { 1: "keyword", 3: "variable" },
  };

  // Field symbols, with any structure components after them: <ls_row>-id.
  const FIELD_SYMBOL = {
    begin: [/<[a-z_][\w/]*>/, /(?:-[a-z_]\w*)*/],
    beginScope: { 1: "variable" },
    relevance: 0,
  };

  // Host variables and host expressions in ABAP SQL: @lv_id, @( expr ).
  const HOST_VARIABLE = {
    className: "variable",
    begin: /@(?:[a-z_][\w-]*|(?=\())/,
    relevance: 0,
  };

  // System fields: sy-subrc, sy-tabix, syst-datum.
  const SYSTEM_FIELD = {
    className: "variable.language",
    begin: /\b(?:sy|syst)-\w+/,
    relevance: 5,
  };

  // A type name after TYPE, LIKE, REF TO, TABLE OF, RANGE OF, LINE OF.
  // Skip the generic words that can come first: TYPE STANDARD TABLE OF.
  const TYPE_NAME = new RegExp(
    /(?!(?:ref|standard|sorted|hashed|any|index|table|range|line|begin|end|value|length|decimals|read-only|default|optional|key|empty|unique|non-unique|with|initial|enum|struct|of|to|for|from)\b)/
      .source + /(?:\/\w+\/)?[a-z_]\w*(?:(?:=>|-)[a-z_]\w*)*/.source,
  );
  const TYPE_REFERENCE = {
    variants: [
      {
        begin: [/\b(?:type|like)/, /\s+/, TYPE_NAME],
        beginScope: { 1: "keyword", 3: "type" },
      },
      {
        begin: [
          /\b(?:ref|table|range|line)/,
          /\s+/,
          /(?:to|of)/,
          /\s+/,
          TYPE_NAME,
        ],
        beginScope: { 1: "keyword", 3: "keyword", 5: "type" },
      },
    ],
    relevance: 0,
  };

  // NEW zcl_cart( ), CONV string( lv_id ), VALUE ty_rows( ).
  const CONSTRUCTOR = {
    begin: [
      /\b(?:new|value|conv|corresponding|cond|switch|reduce|filter|ref|cast|exact)/,
      /\s+/,
      new RegExp(NAME.source + /(?:-[a-z_]\w*)*/.source + CALL_PAREN.source),
    ],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 0,
  };

  const CLASS_DECLARATION = {
    variants: [
      // CLASS lcl_app DEFINITION is ABAP's own shape.
      {
        begin: [
          /\bclass/,
          /\s+/,
          new RegExp(
            NAME.source + /(?=\s+(?:definition|implementation)\b)/.source,
          ),
        ],
        beginScope: { 1: "keyword", 3: "title.class" },
        relevance: 5,
      },
      {
        begin: [/\b(?:class|interface|interfaces)/, /\s+/, NAME],
        beginScope: { 1: "keyword", 3: "title.class" },
      },
      {
        begin: [/\binheriting/, /\s+/, /from/, /\s+/, NAME],
        beginScope: { 1: "keyword", 3: "keyword", 5: "title.class.inherited" },
      },
    ],
    relevance: 0,
  };

  const METHOD_DECLARATION = {
    begin: [
      /\b(?:class-methods|methods|method|form|perform|function)/,
      /\s+/,
      COMPONENT_NAME,
    ],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 0,
  };

  const PROGRAM_NAME = {
    begin: [/\b(?:report|program)/, /\s+/, NAME],
    beginScope: { 1: "keyword", 3: "title" },
    relevance: 0,
  };

  // A functional method call: calculate( ). The blank after `(` (or an
  // empty `( )`) keeps offset/length access, lv_date(4), out of it.
  const METHOD_CALL = {
    className: "title.function.invoke",
    begin: new RegExp(/\b/.source + COMPONENT_NAME.source + CALL_PAREN.source),
    relevance: 0,
  };

  // Built-in functions only count as such when called: lines( lt_rows ).
  // Many share a name with a statement or an addition (LINES OF, CONDENSE).
  const BUILT_IN_CALL = {
    className: "built_in",
    begin: new RegExp(`\\b(?:${ABAP_BUILT_INS.join("|")})` + CALL_PAREN.source),
    relevance: 0,
  };

  // String templates: |Hello { lv_name }!|. Embedded expressions take
  // format options: { lv_date DATE = ISO }.
  const EMBEDDED_EXPRESSION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: {
      $pattern: /[a-z_][\w-]*/,
      keyword:
        "width align pad case sign exponent decimals zero xsd style " +
        "currency number date time timestamp timezone country alpha " +
        "left right center raw user iso environment upper lower in out",
      literal: ABAP_LITERALS,
    },
    contains: [
      STRING,
      NUMBER,
      SELECTOR,
      STATIC_CLASS,
      FIELD_SYMBOL,
      SYSTEM_FIELD,
      BUILT_IN_CALL,
      METHOD_CALL,
    ],
    relevance: 0,
  };

  const STRING_TEMPLATE = {
    className: "string",
    begin: /\|/,
    end: /\|/,
    contains: [
      { scope: "char.escape", begin: /\\[\s\S]/ },
      EMBEDDED_EXPRESSION,
    ],
    relevance: 0,
  };

  // Pragmas: ##NEEDED, ##NO_TEXT.
  const PRAGMA = {
    className: "meta",
    begin: /##\w+/,
    relevance: 2,
  };

  return {
    name: "ABAP",
    case_insensitive: true,
    keywords: {
      $pattern: /[a-z_][\w-]*/,
      keyword: ABAP_KEYWORDS,
      type: ABAP_TYPES,
      literal: ABAP_LITERALS,
      "variable.language": "me super",
    },
    contains: [
      LINE_COMMENT,
      INLINE_COMMENT,
      PRAGMA,
      STRING,
      STRING_TEMPLATE,
      INLINE_DECLARATION,
      FIELD_SYMBOL,
      HOST_VARIABLE,
      SYSTEM_FIELD,
      CLASS_DECLARATION,
      METHOD_DECLARATION,
      PROGRAM_NAME,
      TYPE_REFERENCE,
      CONSTRUCTOR,
      SELECTOR,
      STATIC_CLASS,
      BUILT_IN_CALL,
      METHOD_CALL,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineAbap(hljs);
}

export const abap = { name: "abap", register };
export default abap;
