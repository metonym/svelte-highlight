import pythonRegister from "highlight.js/lib/languages/python";

// Cython statements and declaration modifiers. `DEF`, `IF`, `ELIF`, and
// `ELSE` are the legacy compile-time forms (deprecated in Cython 3, but
// still parsed). All-caps, so they never clash with Python names.
const CYTHON_KEYWORDS = [
  "cdef",
  "cpdef",
  "ctypedef",
  "cimport",
  "nogil",
  "gil",
  "noexcept",
  "inline",
  "extern",
  "public",
  "readonly",
  "api",
  "fused",
  "packed",
  "cppclass",
  "const",
  "volatile",
  "DEF",
  "IF",
  "ELIF",
  "ELSE",
];

// C types Cython knows without a `cimport`. `int`, `float`, and `complex`
// move here from Python's built-ins, so `cdef int` and `cdef double`
// look the same.
const C_TYPES = [
  "void",
  "bint",
  "char",
  "short",
  "int",
  "long",
  "float",
  "double",
  "complex",
  "signed",
  "unsigned",
  "size_t",
  "ssize_t",
  "ptrdiff_t",
  "Py_ssize_t",
  "Py_hash_t",
  "Py_UCS4",
  "Py_UNICODE",
  "int8_t",
  "int16_t",
  "int32_t",
  "int64_t",
  "uint8_t",
  "uint16_t",
  "uint32_t",
  "uint64_t",
  "intptr_t",
  "uintptr_t",
];

const CYTHON_BUILT_INS = ["sizeof", "typeof"];

const IDENT = /[A-Za-z_]\w*/;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCython(hljs) {
  // `python(hljs)` builds fresh keyword arrays on every call, so changing
  // them here never reaches the stock Python grammar.
  const lang = /** @type {any} */ (pythonRegister(hljs));
  const keywords = lang.keywords;
  const movedToType = new Set(C_TYPES);
  keywords.keyword.push(...CYTHON_KEYWORDS);
  keywords.built_in = [
    ...keywords.built_in.filter(
      (/** @type {string} */ name) => !movedToType.has(name),
    ),
    ...CYTHON_BUILT_INS,
  ];
  keywords.type.push(...C_TYPES);
  keywords.literal.push("NULL");

  const defMode = lang.contains.find(
    (/** @type {any} */ mode) =>
      Array.isArray(mode.match) && String(mode.match[0]) === "/\\bdef/",
  );
  if (!defMode) throw new Error("cython: python def mode not found");
  const PARAMS = defMode.contains[0];
  const NUMBER = lang.contains.find(
    (/** @type {any} */ mode) => mode.className === "number",
  );
  if (!NUMBER) throw new Error("cython: python number mode not found");

  // `cdef struct Point:`, `ctypedef fused real:`, `cdef cppclass Vec`.
  // `struct`, `union`, and `enum` are keywords only here: as bare words
  // they are also Python stdlib module names.
  const TYPE_DECLARATION = {
    match: [
      /\b(?:cdef|cpdef|ctypedef)/,
      /\s+/,
      /(?:public|packed)?/,
      /\s*/,
      /(?:struct|union|enum|fused|cppclass)\b/,
      /\s+/,
      IDENT,
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "keyword",
      7: "title.class",
    },
  };

  // `except? -1` returns an error flag that may also be a real value.
  const EXCEPT_QUERY = {
    scope: "keyword",
    match: /\bexcept\?/,
  };

  // `cdef double[:, ::1] scale(double[:, ::1] a, double k) nogil:`.
  // Starts only when a name and `(` follow on the same line before any
  // `=`, so `cdef int n = len(a)` stays a plain declaration, and not on
  // `cdef class`, which Python's class rule styles. `(*` is a function
  // pointer, not a call.
  const FUNCTION_DECLARATION = {
    begin:
      /\b(?:cdef|cpdef)(?!\s+class\b)(?=\s(?:[^\n=[]|\[[^\]\n]*\])*?\b[A-Za-z_]\w*\s*\((?!\s*\*))/,
    beginScope: "keyword",
    end: /$/,
    keywords,
    contains: [
      {
        scope: "title.function",
        match: /\b[A-Za-z_]\w*(?=\s*\((?!\s*\*))/,
      },
      PARAMS,
      EXCEPT_QUERY,
      NUMBER,
      hljs.HASH_COMMENT_MODE,
    ],
  };

  // `include "helpers.pxi"`. Only before a string, since Django and
  // others call an `include()` function.
  const INCLUDE = {
    scope: "keyword",
    match: /\binclude(?=\s+["'])/,
  };

  // `<double>x`, `<const char*>buf`, `<Node?>obj`, `<double[:n]>ptr`.
  const CAST = {
    match: [
      /</,
      /(?:const(?=\s))?/,
      /\s*/,
      /[A-Za-z_][\w.]*/,
      /(?:\[[^\]\n]*\])?\s*\**\s*\??>/,
    ],
    scope: {
      2: "keyword",
      4: "type",
    },
  };

  lang.contains = [
    TYPE_DECLARATION,
    FUNCTION_DECLARATION,
    INCLUDE,
    CAST,
    EXCEPT_QUERY,
    ...lang.contains,
  ];

  return {
    ...lang,
    name: "Cython",
    aliases: ["pyx", "pxd", "pxi"],
    // `?` is legal Cython (`except?`, `<T?>`).
    illegal: /<\/|=>/,
    // A superset of Python: most Python samples are valid Cython, so
    // auto-detection would split between the two.
    disableAutodetect: true,
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCython(hljs);
}

export const cython = { name: "cython", register };
export default cython;
