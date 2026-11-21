import cppRegister from "highlight.js/lib/languages/cpp";

// Function qualifiers and address spaces. Plain C++ uses `device`,
// `vertex`, and `kernel` as ordinary names, so these live here, not in
// a patch to the shared C++ grammar.
const METAL_KEYWORDS = [
  "kernel",
  "vertex",
  "fragment",
  "device",
  "constant",
  "threadgroup",
  "thread",
  "threadgroup_imageblock",
  "ray_data",
  "object_data",
];

const SCALARS = [
  "bool",
  "char",
  "uchar",
  "short",
  "ushort",
  "int",
  "uint",
  "long",
  "ulong",
  "half",
  "float",
  "bfloat",
];

const VECTOR_TYPES = SCALARS.flatMap((scalar) =>
  [2, 3, 4].flatMap((n) => [`${scalar}${n}`, `packed_${scalar}${n}`]),
);

const MATRIX_TYPES = ["half", "float"].flatMap((scalar) =>
  [2, 3, 4].flatMap((cols) =>
    [2, 3, 4].map((rows) => `${scalar}${cols}x${rows}`),
  ),
);

const TEXTURE_TYPES = [
  "texture1d",
  "texture1d_array",
  "texture2d",
  "texture2d_array",
  "texture2d_ms",
  "texture2d_ms_array",
  "texture3d",
  "texturecube",
  "texturecube_array",
  "texture_buffer",
  "depth2d",
  "depth2d_array",
  "depth2d_ms",
  "depth2d_ms_array",
  "depthcube",
  "depthcube_array",
];

const OTHER_TYPES = [
  "uchar",
  "ushort",
  "uint",
  "ulong",
  "half",
  "bfloat",
  "sampler",
  "atomic_int",
  "atomic_uint",
  "atomic_bool",
  "atomic_float",
  "imageblock",
  "visible_function_table",
  "intersection_function_table",
  "acceleration_structure",
  "primitive_acceleration_structure",
  "instance_acceleration_structure",
  "intersector",
  "simdgroup_matrix",
  "simdgroup_float8x8",
  "simdgroup_half8x8",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMetal(hljs) {
  // `cpp(hljs)` builds fresh keyword arrays and modes on every call, so
  // changing them here never reaches the C++ grammar.
  const lang = /** @type {any} */ (cppRegister(hljs));
  const keywords = lang.keywords;
  keywords.keyword.push(...METAL_KEYWORDS);
  // C++ lists `thread` (for `std::thread`) as a relevance-only hint, and
  // that entry would override the keyword.
  keywords._type_hints = keywords._type_hints.filter(
    (/** @type {string} */ name) => !METAL_KEYWORDS.includes(name),
  );
  keywords.type.push(
    ...OTHER_TYPES,
    ...VECTOR_TYPES,
    ...MATRIX_TYPES,
    ...TEXTURE_TYPES,
  );

  // `[[buffer(0)]]`, `[[position]]`, `[[thread_position_in_grid]]`.
  const ATTRIBUTE = {
    scope: "meta",
    begin: /\[\[/,
    end: /\]\]/,
    contains: [hljs.C_NUMBER_MODE, hljs.QUOTE_STRING_MODE],
  };

  // Parameter lists of function declarations carry most attributes.
  const declaration = lang.contains.find(
    (/** @type {any} */ mode) => mode.className === "function",
  );
  const params = declaration?.contains.find(
    (/** @type {any} */ mode) => mode.className === "params",
  );
  if (!params) throw new Error("metal: C++ params mode not found");
  params.contains.unshift(ATTRIBUTE);
  declaration.contains.unshift(ATTRIBUTE);

  lang.contains.unshift(ATTRIBUTE);

  // `0.5h` and `1h` are half literals. Every C++ mode shares one number
  // mode, so a variant added here reaches them all. It comes first, so
  // it wins over the float variant that would stop before the `h`.
  const number = lang.contains.find(
    (/** @type {any} */ mode) => mode.className === "number",
  );
  if (!number) throw new Error("metal: C++ number mode not found");
  number.variants.unshift({
    begin: /[+-]?(?:\b\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[hH]\b/,
  });

  return {
    ...lang,
    name: "Metal",
    aliases: ["msl"],
    // A superset of C++: most C++ samples are valid Metal, so
    // auto-detection would split between the two.
    disableAutodetect: true,
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMetal(hljs);
}

export const metal = { name: "metal", register };
export default metal;
