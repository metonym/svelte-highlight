const WGSL_KEYWORDS =
  "alias break case const const_assert continue continuing default diagnostic discard else enable fn for if let loop override requires return struct switch var while";

const WGSL_TYPES =
  "bool f16 f32 i32 u32 vec2 vec3 vec4 mat2x2 mat2x3 mat2x4 mat3x2 mat3x3 mat3x4 mat4x2 mat4x3 mat4x4 array atomic ptr sampler sampler_comparison texture_1d texture_2d texture_2d_array texture_3d texture_cube texture_cube_array texture_multisampled_2d texture_storage_1d texture_storage_2d texture_storage_2d_array texture_storage_3d texture_depth_2d texture_depth_2d_array texture_depth_cube texture_depth_cube_array texture_depth_multisampled_2d";

const WGSL_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineWgsl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+[iuhf]?\b/ },
      { begin: /\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?[ifh]?\b/ },
      { begin: /\.\d+(?:[eE][+-]?\d+)?[ifh]?\b/ },
    ],
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfn/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  return {
    name: "WGSL",
    aliases: ["wgsl"],
    keywords: {
      keyword: WGSL_KEYWORDS,
      type: WGSL_TYPES,
      literal: WGSL_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ATTRIBUTE,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineWgsl(hljs);
}

export const wgsl = { name: "wgsl", register };
export default wgsl;
