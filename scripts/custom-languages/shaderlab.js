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
