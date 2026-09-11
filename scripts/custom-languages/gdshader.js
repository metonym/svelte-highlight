import glslRegister from "highlight.js/lib/languages/glsl";

// `struct` is not in hljs's GLSL keyword table, so it is added here.
const GDSHADER_QUALIFIERS =
  "uniform varying in out inout flat smooth instance global group_uniforms stencil_mode struct";

const GDSHADER_TYPES =
  "float int uint bool vec2 vec3 vec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4 bvec2 bvec3 bvec4 mat2 mat3 mat4 sampler2D isampler2D usampler2D sampler2DArray sampler3D samplerCube samplerCubeArray samplerExternalOES void";

const GDSHADER_FUNCTIONS =
  "texture textureLod mix clamp smoothstep normalize dot cross length distance reflect refract sin cos pow abs floor fract step min max sqrt inversesqrt fma round sign dFdx dFdy fwidth";

const GDSHADER_HINTS =
  "hint_range hint_color source_color hint_normal hint_default_white hint_default_black hint_default_transparent hint_screen_texture hint_depth_texture hint_normal_roughness_texture hint_anisotropy hint_roughness_r hint_roughness_g hint_roughness_b hint_roughness_a hint_roughness_normal hint_roughness_gray hint_enum " +
  "filter_nearest filter_linear filter_nearest_mipmap filter_linear_mipmap filter_nearest_mipmap_anisotropic filter_linear_mipmap_anisotropic repeat_enable repeat_disable instance_index";

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
  // Godot 4.x spatial built-ins.
  "POINT_SIZE",
  "INV_PROJECTION_MATRIX",
  "MODEL_NORMAL_MATRIX",
  "VIEWPORT_SIZE",
  "OUTPUT_IS_SRGB",
  "NODE_POSITION_WORLD",
  "NODE_POSITION_VIEW",
  "CAMERA_DIRECTION_WORLD",
  "CAMERA_VISIBLE_LAYERS",
  "VIEW_INDEX",
  "VIEW_MONO_LEFT",
  "VIEW_RIGHT",
  "EYE_OFFSET",
  "TANGENT",
  "BINORMAL",
  "BONE_INDICES",
  "BONE_WEIGHTS",
  "CUSTOM0",
  "CUSTOM1",
  "CUSTOM2",
  "CUSTOM3",
  "VIEW",
  "LIGHT_VERTEX",
  "ALPHA_SCISSOR_THRESHOLD",
  "ALPHA_HASH_SCALE",
  "ALPHA_ANTIALIASING_EDGE",
  "ALPHA_TEXTURE_COORDINATE",
  "SPECULAR",
  "SPECULAR_AMOUNT",
  "ANISOTROPY_FLOW",
  "SSS_TRANSMITTANCE_DEPTH",
  "SSS_TRANSMITTANCE_COLOR",
  "SSS_TRANSMITTANCE_BOOST",
  "LIGHT_IS_DIRECTIONAL",
  // canvas_item built-ins.
  "CANVAS_MATRIX",
  "SCREEN_MATRIX",
  "AT_LIGHT_PASS",
  "SPECULAR_SHININESS",
  "SPECULAR_SHININESS_TEXTURE",
  "NORMAL_TEXTURE",
  "LIGHT_POSITION",
  "LIGHT_DIRECTION",
  "LIGHT_ENERGY",
  "SHADOW_VERTEX",
  "SHADOW_MODULATE",
  "REGION_RECT",
  // particles built-ins (the generic-looking NUMBER/INDEX/SIZE/MASS/ACTIVE
  // are left out on purpose: a user constant can carry those names in
  // every other shader type).
  "CUSTOM",
  "VELOCITY",
  "DELTA",
  "LIFETIME",
  "TRANSFORM",
  "EMISSION_TRANSFORM",
  "RANDOM_SEED",
  "RESTART",
  "RESTART_POSITION",
  "RESTART_ROT_SCALE",
  "RESTART_VELOCITY",
  "RESTART_COLOR",
  "RESTART_CUSTOM",
  "COLLIDED",
  "COLLISION_NORMAL",
  "COLLISION_DEPTH",
  "ATTRACTOR_FORCE",
  "EMITTER_VELOCITY",
  "INTERPOLATE_TO_END",
  "AMOUNT_RATIO",
  "USERDATA1",
  "USERDATA2",
  "USERDATA3",
  "USERDATA4",
  "USERDATA5",
  "USERDATA6",
  // sky and fog built-ins.
  "HALF_RES_COLOR",
  "QUARTER_RES_COLOR",
  "LIGHT0_ENABLED",
  "LIGHT0_DIRECTION",
  "LIGHT0_ENERGY",
  "LIGHT0_COLOR",
  "LIGHT0_SIZE",
  "LIGHT1_ENABLED",
  "LIGHT1_DIRECTION",
  "LIGHT1_ENERGY",
  "LIGHT1_COLOR",
  "LIGHT1_SIZE",
  "LIGHT2_ENABLED",
  "LIGHT2_DIRECTION",
  "LIGHT2_ENERGY",
  "LIGHT2_COLOR",
  "LIGHT2_SIZE",
  "LIGHT3_ENABLED",
  "LIGHT3_DIRECTION",
  "LIGHT3_ENERGY",
  "LIGHT3_COLOR",
  "LIGHT3_SIZE",
  "OBJECT_POSITION",
  "UVW",
];

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  const base = /** @type {any} */ (glslRegister(hljs));

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

  // Godot's `u` (uint) and `f` (float) suffixes also apply to hex and
  // leading-dot literals; without these variants the GLSL base number rule
  // matched `0xFF` and `.5` and left the suffix as a stray identifier.
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+[uU]?\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?[fFuU]?\b/ },
      { begin: /\B\.\d+(?:[eE][-+]?\d+)?[fF]?\b/ },
    ],
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
