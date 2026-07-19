const HLSL_KEYWORDS =
  "if else for while do return break continue switch case default static const inline in out inout register packoffset namespace class typedef discard struct void true false";

const HLSL_TYPES =
  "float float2 float3 float4 float2x2 float3x3 float4x4 float2x3 float2x4 float3x2 float3x4 float4x2 float4x3 int int2 int3 int4 uint uint2 uint3 uint4 bool bool2 bool3 bool4 half half2 half3 half4 double matrix vector Texture1D Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray Texture3D TextureCube TextureCubeArray SamplerState SamplerComparisonState RWTexture1D RWTexture1DArray RWTexture2D RWTexture2DArray RWTexture3D Buffer StructuredBuffer RWStructuredBuffer AppendStructuredBuffer ConsumeStructuredBuffer ByteAddressBuffer RWByteAddressBuffer ConstantBuffer cbuffer tbuffer";

const HLSL_BUILTINS =
  "mul dot cross normalize saturate lerp clamp pow sqrt rsqrt abs min max tex2D tex2Dlod tex2Dbias tex2Dproj tex2Dgrad Sample SampleLevel SampleGrad SampleCmp SampleBias Load Gather sample frac floor ceil round sign reflect refract length distance transpose determinant exp exp2 log log2 sin cos tan asin acos atan atan2 sinh cosh tanh step smoothstep ddx ddy fwidth mad rcp any all isnan isinf asfloat asint asuint clip";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHlsl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+[uUlL]?\b/ },
      { begin: /\b\d+\.\d*(?:[eE][+-]?\d+)?[fFhHlL]?\b/ },
      { begin: /\B\.\d+(?:[eE][+-]?\d+)?[fFhHlL]?\b/ },
      { begin: /\b\d+[eE][+-]?\d+[fFhHlL]?\b/ },
      { begin: /\b\d+[fFhHuUlL]?\b/ },
    ],
    relevance: 0,
  };

  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-zA-Z_]+/,
    end: /$/,
    keywords: {
      keyword:
        "define include ifdef ifndef endif else elif undef pragma if line error",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        begin: /"/,
        end: /"/,
      },
      {
        className: "string",
        begin: /</,
        end: />/,
      },
    ],
  };

  // A bare `: identifier` scan can't structurally tell a semantic apart
  // from a ternary (`cond ? a : b`) or switch/case colon without deeper
  // parsing, so it leans on a real HLSL convention instead: semantics are
  // always ALL_CAPS (POSITION, TEXCOORD0, SV_TARGET, ...), while ternary/
  // case values are ordinary (usually camelCase) identifiers.
  const SEMANTIC = {
    begin: [/:/, /\s*/, /(?!register\b|packoffset\b)[A-Z][A-Z0-9_]*/],
    beginScope: { 3: "attr" },
    relevance: 0,
  };

  const ATTRIBUTE = {
    // A leading word character or `]` means this is array indexing (e.g.
    // `arr[i]`, `buf[0][process(x)]`) rather than an HLSL attribute, so the
    // guard character is matched in its own group and left unscoped
    // instead of excluded with a negative lookbehind. The `(...)` argument
    // list is optional: parameterless attributes like [unroll]/[loop]/
    // [branch]/[flatten]/[earlydepthstencil] are common too.
    begin: [/(?:^|[^\w\]])/, /\[[a-zA-Z_]\w*(?:\([^)]*\))?\]/],
    beginScope: { 2: "meta" },
    relevance: 0,
  };

  return {
    name: "HLSL",
    aliases: ["hlsl"],
    case_insensitive: false,
    keywords: {
      keyword: HLSL_KEYWORDS,
      type: HLSL_TYPES,
      built_in: HLSL_BUILTINS,
      literal: "true false",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      PREPROCESSOR,
      ATTRIBUTE,
      SEMANTIC,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHlsl(hljs);
}

export const hlsl = { name: "hlsl", register };
export default hlsl;
