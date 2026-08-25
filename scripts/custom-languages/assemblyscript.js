import typescriptRegister from "highlight.js/lib/languages/typescript";

const AS_TYPES = "i8|i16|i32|i64|u8|u16|u32|u64|f32|f64|usize|v128|bool";

const AS_DECORATORS =
  "inline|external|global|operator|lazy|unmanaged|final|unsafe";

const AS_BUILTINS = "changetype|unchecked|idof|load|store";

/** @param {import("highlight.js").HLJSApi} _hljs */
function defineAssemblyscript(_hljs) {
  const wasmType = {
    className: "type",
    begin: new RegExp(String.raw`\b(?:${AS_TYPES})\b`),
    relevance: 0,
  };

  const decorator = {
    className: "meta",
    begin: new RegExp(String.raw`@(?:${AS_DECORATORS})\b`),
    relevance: 10,
  };

  const genericBuiltin = {
    begin: [/\b(?:changetype|idof)\b/, /\s*</],
    beginScope: { 1: "built_in" },
    end: />/,
    contains: [wasmType],
    relevance: 10,
  };

  const genericLoadStore = {
    begin: [/\b(?:load|store)\b/, /\s*</],
    beginScope: { 1: "built_in" },
    end: />/,
    contains: [wasmType],
    relevance: 0,
  };

  const builtinCall = {
    className: "built_in",
    begin: new RegExp(String.raw`\b(?:${AS_BUILTINS})\b`),
    relevance: 0,
  };

  const memoryOp = {
    begin: [/\bmemory\b/, /\./, /(?:size|grow|copy|fill)\b/],
    beginScope: { 1: "built_in", 3: "built_in" },
    relevance: 10,
  };

  return {
    name: "AssemblyScript",
    aliases: ["assemblyscript", "asc"],
    subLanguage: "typescript",
    contains: [
      decorator,
      genericBuiltin,
      genericLoadStore,
      builtinCall,
      memoryOp,
      wasmType,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("typescript", typescriptRegister);
  return defineAssemblyscript(hljs);
}

export const assemblyscript = { name: "assemblyscript", register };
export default assemblyscript;
