const WGSL_KEYWORDS =
  "alias break case const const_assert continue continuing default diagnostic discard else enable fn for if let loop override requires return struct switch var while";

const WGSL_TYPES =
  "bool f16 f32 i32 u32 vec2 vec3 vec4 vec2f vec3f vec4f vec2h vec3h vec4h vec2i vec3i vec4i vec2u vec3u vec4u mat2x2 mat2x3 mat2x4 mat3x2 mat3x3 mat3x4 mat4x2 mat4x3 mat4x4 mat2x2f mat2x3f mat2x4f mat3x2f mat3x3f mat3x4f mat4x2f mat4x3f mat4x4f mat2x2h mat2x3h mat2x4h mat3x2h mat3x3h mat3x4h mat4x2h mat4x3h mat4x4h array atomic ptr sampler sampler_comparison texture_1d texture_2d texture_2d_array texture_3d texture_cube texture_cube_array texture_multisampled_2d texture_storage_1d texture_storage_2d texture_storage_2d_array texture_storage_3d texture_depth_2d texture_depth_2d_array texture_depth_cube texture_depth_cube_array texture_depth_multisampled_2d";

const WGSL_LITERALS = "true false";

const WGSL_BUILTINS =
  "vertex_index instance_index position frag_depth sample_index sample_mask local_invocation_id local_invocation_index global_invocation_id workgroup_id num_workgroups front_facing subgroup_invocation_id subgroup_size";

const WGSL_ADDRESS_SPACE_KEYWORDS =
  "storage uniform workgroup private function handle read write read_write";

const WGSL_BUILTIN_FUNCTIONS =
  "all any select arrayLength abs acos acosh asin asinh atan atanh atan2 ceil clamp cos cosh countLeadingZeros countOneBits countTrailingZeros cross degrees determinant distance dot dot4U8Packed dot4I8Packed exp exp2 extractBits faceForward firstLeadingBit firstTrailingBit floor fma fract frexp insertBits inverseSqrt ldexp length log log2 max min mix modf normalize pow quantizeToF16 radians reflect refract reverseBits round saturate sign sin sinh smoothstep sqrt step tan tanh transpose trunc dpdx dpdxCoarse dpdxFine dpdy dpdyCoarse dpdyFine fwidth fwidthCoarse fwidthFine textureDimensions textureGather textureGatherCompare textureLoad textureNumLayers textureNumLevels textureNumSamples textureSample textureSampleBias textureSampleCompare textureSampleCompareLevel textureSampleGrad textureSampleLevel textureSampleBaseClampToEdge textureStore atomicLoad atomicStore atomicAdd atomicSub atomicMax atomicMin atomicAnd atomicOr atomicXor atomicExchange atomicCompareExchangeWeak pack4x8snorm pack4x8unorm pack4xI8 pack4xU8 pack4xI8Clamp pack4xU8Clamp pack2x16snorm pack2x16unorm pack2x16float unpack4x8snorm unpack4x8unorm unpack4xI8 unpack4xU8 unpack2x16snorm unpack2x16unorm unpack2x16float storageBarrier textureBarrier workgroupBarrier workgroupUniformLoad subgroupAdd subgroupExclusiveAdd subgroupInclusiveAdd subgroupAll subgroupAnd subgroupAny subgroupBallot subgroupBroadcast subgroupBroadcastFirst subgroupElect subgroupMax subgroupMin subgroupMul subgroupExclusiveMul subgroupInclusiveMul subgroupOr subgroupShuffle subgroupShuffleDown subgroupShuffleUp subgroupShuffleXor subgroupXor quadBroadcast quadSwapDiagonal quadSwapX quadSwapY bitcast";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineWgsl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+[iuhf]?\b/ },
      { begin: /\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?[iufh]?\b/ },
      { begin: /\.\d+(?:[eE][+-]?\d+)?[iufh]?\b/ },
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

  const BUILTIN_FUNCTION_CALL = {
    className: "built_in",
    begin: new RegExp(
      `\\b(?:${WGSL_BUILTIN_FUNCTIONS.split(" ").join("|")})(?=\\s*\\()`,
    ),
    relevance: 0,
  };

  const ADDRESS_SPACE_KEYWORDS = {
    keyword: WGSL_ADDRESS_SPACE_KEYWORDS,
    type: WGSL_TYPES,
  };

  const VAR_ADDRESS_SPACE = {
    begin: [/\bvar\b/, /\s*</],
    beginScope: { 1: "keyword" },
    end: />/,
    keywords: ADDRESS_SPACE_KEYWORDS,
  };

  const PTR_ADDRESS_SPACE = {
    begin: [/\bptr\b/, /\s*</],
    beginScope: { 1: "type" },
    end: />/,
    keywords: ADDRESS_SPACE_KEYWORDS,
  };

  return {
    name: "WGSL",
    aliases: ["wgsl"],
    keywords: {
      keyword: WGSL_KEYWORDS,
      type: WGSL_TYPES,
      literal: WGSL_LITERALS,
      built_in: WGSL_BUILTINS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ATTRIBUTE,
      VAR_ADDRESS_SPACE,
      PTR_ADDRESS_SPACE,
      FUNCTION,
      BUILTIN_FUNCTION_CALL,
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
