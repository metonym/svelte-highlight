import hlsl from "./hlsl.js";

const SHADERLAB_KEYWORDS = [
  "Properties",
  "SubShader",
  "Pass",
  "Tags",
  "LOD",
  "Fallback",
  "CustomEditor",
  "Category",
  "UsePass",
  "GrabPass",
  "Blend",
  "Cull",
  "ZWrite",
  "ZTest",
  "ColorMask",
  "Offset",
  "Stencil",
  "Ref",
  "Comp",
  "Lighting",
  "Fog",
  "AlphaTest",
  "AlphaToMask",
  "Name",
  "Material",
  "SetTexture",
  "BindChannels",
  "Conservative",
  "BlendOp",
  "ZClip",
  "ReadMask",
  "WriteMask",
  "Fail",
  "ZFail",
  "CompFront",
  "CompBack",
  "PassFront",
  "PassBack",
  "FailFront",
  "FailBack",
  "ZFailFront",
  "ZFailBack",
  "Dependency",
  "PackageRequirements",
];

const SHADERLAB_TYPES = "Range Color Float Vector Int Cube CubeArray Integer";

const SHADERLAB_LITERALS = [
  "One|0",
  "Zero|0",
  "SrcAlpha|0",
  "OneMinusSrcAlpha|0",
  "DstColor|0",
  "Off|0",
  "On|0",
  "Back|0",
  "Front|0",
  "LEqual|0",
  "Always|0",
  "Less|0",
  "Greater|0",
  "Equal|0",
  "NotEqual|0",
  "Never|0",
  "RGBA|0",
  "RGB|0",
  "A|0",
  "GEqual|0",
  "True|0",
  "False|0",
  // Remaining blend factors.
  "SrcColor|0",
  "OneMinusSrcColor|0",
  "DstAlpha|0",
  "OneMinusDstAlpha|0",
  "OneMinusDstColor|0",
  "SrcAlphaSaturate|0",
  // BlendOp operations.
  "Add|0",
  "Sub|0",
  "RevSub|0",
  "Min|0",
  "Max|0",
  // Stencil operations.
  "Keep|0",
  "Replace|0",
  "IncrSat|0",
  "DecrSat|0",
  "Invert|0",
  "IncrWrap|0",
  "DecrWrap|0",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineShaderlab(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const SHADER_HEADER = {
    begin: [/\bShader\b/, /\s+/, /"[^"]*"/],
    beginScope: { 1: "keyword", 3: "string" },
    relevance: 10,
  };

  const PROPERTY_NAME = {
    className: "variable",
    begin: /\b_[A-Za-z]\w*(?=\s*\()/,
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /\[[A-Za-z]\w*(?:\([^)\n]*\))?\]/,
    relevance: 0,
  };

  // A render-state command can read a property instead of a literal:
  // `Cull [_Cull]`, `Blend [_SrcBlend] [_DstBlend]`. The underscore
  // keeps it apart from the `[Attribute]` form above.
  const PROPERTY_REFERENCE = {
    begin: [/\[/, /_[A-Za-z]\w*/, /\]/],
    beginScope: { 2: "variable" },
    relevance: 0,
  };

  const NUMERIC_TYPE = {
    className: "type",
    begin: /\b(?:2DArray|2D|3D)\b/,
    relevance: 0,
  };

  const CG_BLOCK = {
    begin: /\b(?:CGPROGRAM|CGINCLUDE)\b/,
    end: /\bENDCG\b/,
    beginScope: "meta",
    endScope: "meta",
    subLanguage: "hlsl",
    relevance: 10,
  };

  const HLSL_BLOCK = {
    begin: /\b(?:HLSLPROGRAM|HLSLINCLUDE)\b/,
    end: /\bENDHLSL\b/,
    beginScope: "meta",
    endScope: "meta",
    subLanguage: "hlsl",
    relevance: 10,
  };

  return {
    name: "ShaderLab",
    aliases: ["unity-shader"],
    keywords: {
      keyword: SHADERLAB_KEYWORDS,
      type: SHADERLAB_TYPES,
      literal: SHADERLAB_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      CG_BLOCK,
      HLSL_BLOCK,
      SHADER_HEADER,
      STRING,
      ATTRIBUTE,
      PROPERTY_REFERENCE,
      PROPERTY_NAME,
      NUMERIC_TYPE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("hlsl", hlsl.register);
  return defineShaderlab(hljs);
}

export const shaderlab = { name: "shaderlab", register };
export default shaderlab;
