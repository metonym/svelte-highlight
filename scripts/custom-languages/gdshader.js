import glslRegister from "highlight.js/lib/languages/glsl";

const GDSHADER_QUALIFIERS =
  "uniform varying in out inout flat smooth instance global group_uniforms stencil_mode";

const GDSHADER_TYPES =
  "float int uint bool vec2 vec3 vec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4 bvec2 bvec3 bvec4 mat2 mat3 mat4 sampler2D isampler2D usampler2D sampler2DArray sampler3D samplerCube samplerCubeArray samplerExternalOES void";

const GDSHADER_FUNCTIONS =
  "texture textureLod mix clamp smoothstep normalize dot cross length distance reflect refract sin cos pow abs floor fract step min max sqrt inversesqrt fma round sign dFdx dFdy fwidth";

const GDSHADER_HINTS =
  "hint_range hint_color source_color hint_normal hint_default_white hint_default_black hint_screen_texture hint_depth_texture hint_normal_roughness_texture filter_linear_mipmap repeat_enable instance_index";

const GDSHADER_BUILTIN_VARS = [
  "VERTEX",
  "NORMAL",
  "UV",
  "UV2",
  "COLOR",
  "ALBEDO",
  "ALPHA",
  "METALLIC",
  "ROUGHNESS",
  "EMISSION",
  "TIME",
  "PI",
  "TAU",
  "E",
  "FRAGCOORD",
  "SCREEN_UV",
  "TEXTURE",
  "TEXTURE_PIXEL_SIZE",
  "SCREEN_PIXEL_SIZE",
  "MODELVIEW_MATRIX",
  "PROJECTION_MATRIX",
  "INV_VIEW_MATRIX",
  "VIEW_MATRIX",
  "MODEL_MATRIX",
  "WORLD_POSITION",
  "CAMERA_POSITION_WORLD",
  "LIGHT_COLOR",
  "LIGHT",
  "ATTENUATION",
  "DIFFUSE_LIGHT",
  "SPECULAR_LIGHT",
  "DEPTH",
  "POINT_COORD",
  "INSTANCE_CUSTOM",
  "INSTANCE_ID",
  "VERTEX_ID",
  "SDF",
  "NORMAL_MAP",
  "RIM",
  "CLEARCOAT",
  "ANISOTROPY",
  "AO",
  "SSS_STRENGTH",
  "BACKLIGHT",
  "FOG",
  "RADIANCE",
  "IRRADIANCE",
  "EYEDIR",
  "POSITION",
  "SKY_COORDS",
  "AT_CUBEMAP_PASS",
  "AT_HALF_RES_PASS",
  "AT_QUARTER_RES_PASS",
];

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  const base = glslRegister(hljs);

  const SHADER_META = {
    className: "meta",
    begin: /^\s*(?:shader_type|render_mode)\b[^;\n]*;/,
    relevance: 10,
  };

  const FUNCTION_DECL = {
    className: "title function_",
    begin: /\b(?:vertex|fragment|light|sky|fog|start|process)(?=\s*\()/,
    relevance: 5,
  };

  const HINT_META = {
    className: "meta",
    begin: new RegExp(`\\b(?:${GDSHADER_HINTS.split(" ").join("|")})\\b`),
    relevance: 0,
  };

  const BUILTIN_VAR = {
    className: "variable language_",
    begin: new RegExp(`\\b(?:${GDSHADER_BUILTIN_VARS.join("|")})\\b`),
    relevance: 0,
  };

  const SWIZZLE = {
    className: "property",
    begin: /\.(?:[xyzw]{1,4}|[rgba]{1,4})\b/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?[fFuU]?\b/,
    relevance: 0,
  };

  return {
    ...base,
    name: "Godot Shading Language",
    aliases: ["gdshader"],
    keywords: {
      ...base.keywords,
      keyword: `${base.keywords.keyword} ${GDSHADER_QUALIFIERS}`,
      type: `${base.keywords.type} ${GDSHADER_TYPES}`,
      built_in: `${base.keywords.built_in} ${GDSHADER_FUNCTIONS}`,
    },
    contains: [
      SHADER_META,
      FUNCTION_DECL,
      HINT_META,
      BUILTIN_VAR,
      SWIZZLE,
      NUMBER,
      ...base.contains,
    ],
  };
}

export const gdshader = { name: "gdshader", register };
export default gdshader;
