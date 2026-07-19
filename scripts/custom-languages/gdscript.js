const GDSCRIPT_KEYWORDS =
  "if elif else for while match break continue pass return class class_name extends is in as self super signal func static const enum var breakpoint await assert and or not preload";

const GDSCRIPT_TYPES =
  "bool int float String StringName Vector2 Vector2i Vector3 Vector3i Vector4 Vector4i Rect2 Rect2i Transform2D Transform3D Plane Quaternion AABB Basis Projection Color NodePath RID Object Callable Signal Dictionary Array Variant PackedByteArray PackedInt32Array PackedInt64Array PackedFloat32Array PackedFloat64Array PackedStringArray PackedVector2Array PackedVector3Array PackedColorArray";

const GDSCRIPT_LITERALS = "true false null";

const GDSCRIPT_BUILT_IN_CONSTANTS = "PI TAU INF NAN";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGDScript(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F_]+\b/ },
      { begin: /\b0[bB][01_]+\b/ },
      {
        begin: /(?:\b\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?\b/,
      },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // `&"name"` StringName literal.
  const STRING_NAME = {
    className: "symbol",
    begin: /&"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `^"path"` NodePath literal.
  const NODE_PATH_STRING = {
    className: "symbol",
    begin: /\^"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `$NodePath/To/Node` and `%UniqueNodeName` shorthand node references.
  const NODE_PATH = {
    className: "variable",
    begin: /[$%][A-Za-z_]\w*(?:\/[A-Za-z_]\w*)*/,
    relevance: 0,
  };

  // `@export`, `@export_range(...)`, `@onready`, etc. Matched generically
  // rather than hardcoding every specific annotation name.
  const ANNOTATION = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  return {
    name: "GDScript",
    aliases: ["gd", "gdscript"],
    keywords: {
      keyword: GDSCRIPT_KEYWORDS,
      type: GDSCRIPT_TYPES,
      literal: GDSCRIPT_LITERALS,
      built_in: GDSCRIPT_BUILT_IN_CONSTANTS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      ANNOTATION,
      STRING_NAME,
      NODE_PATH_STRING,
      STRING,
      NODE_PATH,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGDScript(hljs);
}

export const gdscript = { name: "gdscript", register };
export default gdscript;
