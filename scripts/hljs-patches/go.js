import base from "highlight.js/lib/languages/go";

/**
 * Patches for highlight.js's Go grammar.
 *
 * - Go 1.18: `any` and `comparable` predeclared type/constraint identifiers.
 * - Go 1.21: `min`, `max`, and `clear` built-in functions.
 * - Go 1.18 generics: a `[T any, U comparable]` type-parameter list in a
 *   `func` signature is scanned with the keyword table (so constraints style
 *   as types) instead of being swallowed by the stock title rule, which
 *   styled every identifier in it as a function title.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string[]; built_in: string[]; "variable.language": string[] }} */ (
      lang.keywords
    );

  // `keywords` is built fresh per call in the stock grammar, so pushing is
  // safe (and propagates to the `params` mode, which shares the object).
  keywords.type.push("any", "comparable");
  keywords.built_in.push("min", "max", "clear");

  const contains = /** @type {any[]} */ (lang.contains);
  const functionMode = contains.find((mode) => mode.className === "function");
  if (!functionMode) throw new Error("go patch: function mode not found");
  const functionContains = /** @type {any[]} */ (functionMode.contains);
  const paramsIndex = functionContains.findIndex(
    (mode) => mode.className === "params",
  );
  if (paramsIndex === -1) throw new Error("go patch: params mode not found");
  functionContains.splice(paramsIndex, 0, {
    begin: /\[/,
    end: /\]/,
    keywords: lang.keywords,
    relevance: 0,
  });

  return lang;
}

export const go = { name: "go", register };
export default go;
