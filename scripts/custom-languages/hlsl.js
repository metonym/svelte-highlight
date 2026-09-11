const HLSL_KEYWORDS =
  "if else for while do return break continue switch case default static const inline in out inout register packoffset namespace class typedef discard struct void true false " +
  // Storage classes, type modifiers and interpolation modifiers.
  "groupshared precise snorm unorm extern shared volatile uniform globallycoherent row_major column_major " +
  "linear centroid nointerpolation noperspective sample " +
  // DXC (HLSL 2021 / SM 6.x library) declarations.
  "enum interface template typename export operator this";

const HLSL_TYPES =
  "float float2 float3 float4 float2x2 float3x3 float4x4 float2x3 float2x4 float3x2 float3x4 float4x2 float4x3 int int2 int3 int4 uint uint2 uint3 uint4 bool bool2 bool3 bool4 half half2 half3 half4 double matrix vector Texture1D Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray Texture3D TextureCube TextureCubeArray SamplerState SamplerComparisonState RWTexture1D RWTexture1DArray RWTexture2D RWTexture2DArray RWTexture3D Buffer StructuredBuffer RWStructuredBuffer AppendStructuredBuffer ConsumeStructuredBuffer ByteAddressBuffer RWByteAddressBuffer ConstantBuffer cbuffer tbuffer RWBuffer " +
  // SM 6.2 sized scalar/vector types and the min-precision family.
  "float16_t float16_t2 float16_t3 float16_t4 int16_t int16_t2 int16_t3 int16_t4 uint16_t uint16_t2 uint16_t3 uint16_t4 int64_t int64_t2 int64_t3 int64_t4 uint64_t uint64_t2 uint64_t3 uint64_t4 float64_t double2 double3 double4 " +
  "min16float min16float2 min16float3 min16float4 min16int min16int2 min16int3 min16int4 min16uint min16uint2 min16uint3 min16uint4 min10float min12int " +
  // Geometry/tessellation streams and DXR objects.
  "TriangleStream LineStream PointStream InputPatch OutputPatch RaytracingAccelerationStructure RayDesc RayQuery BuiltInTriangleIntersectionAttributes";

const HLSL_BUILTINS =
  "mul dot cross normalize saturate lerp clamp pow sqrt rsqrt abs min max tex2D tex2Dlod tex2Dbias tex2Dproj tex2Dgrad Sample SampleLevel SampleGrad SampleCmp SampleBias Load Gather sample frac floor ceil round sign reflect refract length distance transpose determinant exp exp2 log log2 sin cos tan asin acos atan atan2 sinh cosh tanh step smoothstep ddx ddy fwidth mad rcp any all isnan isinf asfloat asint asuint clip " +
  "trunc fmod modf frexp ldexp fma degrees radians faceforward lit dst countbits firstbithigh firstbitlow reversebits f16tof32 f32tof16 asdouble msad4 select " +
  "dot2add dot4add_u8packed dot4add_i8packed IsHelperLane " +
  // Resource methods.
  "SampleCmpLevelZero GatherRed GatherGreen GatherBlue GatherAlpha GatherCmp GetDimensions Load2 Load3 Load4 Store Store2 Store3 Store4 Append Consume IncrementCounter DecrementCounter " +
  "EvaluateAttributeAtSample EvaluateAttributeCentroid EvaluateAttributeSnapped " +
  // Barriers and atomics.
  "GroupMemoryBarrier GroupMemoryBarrierWithGroupSync DeviceMemoryBarrier DeviceMemoryBarrierWithGroupSync AllMemoryBarrier AllMemoryBarrierWithGroupSync " +
  "InterlockedAdd InterlockedAnd InterlockedOr InterlockedXor InterlockedMin InterlockedMax InterlockedExchange InterlockedCompareExchange InterlockedCompareStore " +
  // SM 6.0 wave and quad intrinsics.
  "WaveIsFirstLane WaveGetLaneCount WaveGetLaneIndex WaveActiveAnyTrue WaveActiveAllTrue WaveActiveAllEqual WaveActiveBallot WaveReadLaneAt WaveReadLaneFirst WaveActiveCountBits WaveActiveSum WaveActiveProduct WaveActiveBitAnd WaveActiveBitOr WaveActiveBitXor WaveActiveMin WaveActiveMax WavePrefixCountBits WavePrefixSum WavePrefixProduct WaveMatch " +
  "QuadReadAcrossX QuadReadAcrossY QuadReadAcrossDiagonal QuadReadLaneAt QuadAny QuadAll " +
  // DXR and mesh shader intrinsics.
  "TraceRay TraceRayInline Proceed ReportHit IgnoreHit AcceptHitAndEndSearch CallShader DispatchRaysIndex DispatchRaysDimensions WorldRayOrigin WorldRayDirection RayTCurrent RayTMin ObjectRayOrigin ObjectRayDirection InstanceIndex InstanceID PrimitiveIndex HitKind SetMeshOutputCounts DispatchMesh";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHlsl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      // Integer suffixes: `u`, `l`, `ll`, `ul`, `ull`, `lu`, `llu`.
      {
        begin: /\b0[xX][0-9a-fA-F]+(?:[uU]?[lL]{1,2}|[lL]{1,2}[uU]|[uU])?\b/,
      },
      { begin: /\b\d+\.\d*(?:[eE][+-]?\d+)?[fFhHlL]?\b/ },
      { begin: /\B\.\d+(?:[eE][+-]?\d+)?[fFhHlL]?\b/ },
      { begin: /\b\d+[eE][+-]?\d+[fFhHlL]?\b/ },
      { begin: /\b\d+(?:[fFhH]|[uU]?[lL]{1,2}|[lL]{1,2}[uU]|[uU])?\b/ },
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
  // ALL_CAPS (POSITION, TEXCOORD0, SV_TARGET, ...) or system values in
  // their documented casing (SV_VertexID, SV_DispatchThreadID), while
  // ternary/case values are ordinary (usually camelCase) identifiers. The
  // trailing `\b` keeps a base class (`class Lambert : IShade`) from being
  // half-matched as `IS`.
  const SEMANTIC = {
    begin: [
      /:/,
      /\s*/,
      /(?!register\b|packoffset\b)(?:SV_\w+|[A-Z][A-Z0-9_]*)\b/,
    ],
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
