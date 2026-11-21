// Upstream dialects whose op names carry detection weight. Names that are
// also common library objects in other languages (`math`, `index`,
// `complex`, `shape`, `async`) are left out, so `x = math.sqrt(y)` in
// Python adds nothing.
const MLIR_DIALECTS = [
  "acc",
  "affine",
  "amdgpu",
  "amx",
  "arith",
  "arm_neon",
  "arm_sme",
  "arm_sve",
  "bufferization",
  "builtin",
  "cf",
  "emitc",
  "func",
  "gpu",
  "irdl",
  "linalg",
  "llvm",
  "memref",
  "mesh",
  "ml_program",
  "mpi",
  "nvgpu",
  "nvvm",
  "omp",
  "pdl",
  "pdl_interp",
  "rocdl",
  "scf",
  "shard",
  "sparse_tensor",
  "spirv",
  "tensor",
  "tosa",
  "ub",
  "vector",
  "x86vector",
  "xegpu",
];

// `i1`, `si32`, `ui8`, `f32`, `bf16`, `f8E4M3FN`, `index`.
const BUILTIN_TYPE =
  "(?:[su]?i\\d+|bf16|tf32|f8E\\w+|f4E\\w+|f6E\\w+|f\\d+|index|none)";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMlir(hljs) {
  const OP_NAME = /[A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)+/;
  const KNOWN_OP_NAME = new RegExp(
    `(?:${MLIR_DIALECTS.join("|")})(?:\\.[A-Za-z_][\\w$]*)+`,
  );

  // `%0`, `%arg0`, `%x#1`, `%results:2`.
  const VALUE = {
    scope: "variable",
    begin: /%[\w$.-]+(?:#\d+)?/,
    relevance: 1,
  };

  // `@main`, `@"quoted name"`, `@module::@nested`.
  const SYMBOL = {
    scope: "title",
    begin: /@(?:[A-Za-z_$.][\w$.-]*|"[^"\n]*")/,
    relevance: 0,
  };

  // `^bb0`, `^loop_body`.
  const BLOCK_LABEL = {
    scope: "symbol",
    begin: /\^[\w$.-]+/,
    relevance: 2,
  };

  // `!llvm.ptr`, `!my_alias`.
  const TYPE_ALIAS = {
    scope: "type",
    begin: /![A-Za-z_][\w$.]*/,
    relevance: 0,
  };

  // `#map`, `#gpu.address_space`, `#loc3`.
  const ATTRIBUTE_ALIAS = {
    scope: "attr",
    begin: /#[A-Za-z_][\w$.]*/,
    relevance: 0,
  };

  const TYPE = {
    scope: "type",
    begin: new RegExp(`\\b${BUILTIN_TYPE}\\b`),
    relevance: 0,
  };

  const NUMBER = {
    scope: "number",
    begin: /-?\b(?:0x[0-9A-Fa-f]+|\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\b/,
    relevance: 0,
  };

  const ARROW = { scope: "operator", begin: /->/, relevance: 0 };

  // `tensor<4x?xf32>`, `memref<16x16xf32, 1>`, `vector<[4]xi1>`. Inside the
  // brackets the element type follows an `x`, so it cannot start on a
  // word boundary.
  const SHAPED_TYPE = {
    begin: [/\b(?:tensor|memref|vector)/, /</],
    beginScope: { 1: "type" },
    end: />/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      ARROW,
      { scope: "type", begin: new RegExp(`${BUILTIN_TYPE}\\b`), relevance: 0 },
      { scope: "number", begin: /\d+|\?/, relevance: 0 },
      TYPE_ALIAS,
      ATTRIBUTE_ALIAS,
      hljs.QUOTE_STRING_MODE,
    ]),
    relevance: 1,
  };

  // Op names start a line or follow `=`: `arith.addi`, `func.func`,
  // `%0 = toy.transpose`. Names from upstream dialects add detection
  // weight. Generic-form names stay strings: `"arith.addi"(%a, %b)`.
  // Dotted names elsewhere, such as `{gpu.container_module}`, stay plain.
  // Upstream ops may take `(` at once (`tensor.empty(%d)`). Other names
  // may not, so `x = obj.method(y)` in other languages stays plain.
  const opModes = [KNOWN_OP_NAME, OP_NAME].flatMap((name, i) => {
    const relevance = i === 0 ? 2 : 0;
    const after = i === 0 ? /(?![\w$.])/ : /(?![\w$.(])/;
    return [
      {
        begin: [/^[ \t]*/, name, after],
        beginScope: { 2: "keyword" },
        relevance,
      },
      {
        begin: [/=/, /[ \t]*/, name, after],
        beginScope: { 1: "operator", 3: "keyword" },
        relevance,
      },
    ];
  });

  return {
    name: "MLIR",
    keywords: {
      keyword:
        "iter_args ins outs module|0 func|0 attributes|0 return|0 to|0 " +
        "step|0 into|0 from|0 private|0 public|0 nested|0",
      literal: "true|0 false|0 unit|0",
      built_in:
        "affine_map affine_set dense_resource loc|0 dense|0 sparse|0 " +
        "array|0 strided|0 opaque|0 distinct|0 fused|0 callsite|0 " +
        "complex|0 tuple|0",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      SHAPED_TYPE,
      ...opModes,
      VALUE,
      SYMBOL,
      BLOCK_LABEL,
      TYPE_ALIAS,
      ATTRIBUTE_ALIAS,
      TYPE,
      NUMBER,
      ARROW,
      { scope: "operator", begin: /=/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMlir(hljs);
}

export const mlir = { name: "mlir", register };
export default mlir;
