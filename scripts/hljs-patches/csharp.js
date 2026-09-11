import base from "highlight.js/lib/languages/csharp";

/**
 * Patches for highlight.js's C# grammar.
 *
 * - `checked` was missing from the keyword list even though `unchecked` is
 *   there.
 * - C# 13 `allows` (as in `where T : allows ref struct`). Inside a class /
 *   interface header the stock grammar styles every word as a title except
 *   `where` and `class`; the constraint keywords `struct`, `notnull`,
 *   `unmanaged`, `allows`, and `ref` now join that exception list.
 * - C# 11 UTF-8 string literals: the `u8` suffix on `"..."` and `"""..."""`
 *   is part of the string token.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; built_in: string[]; literal: string[] }} */ (
      lang.keywords
    );

  // Built fresh per call by the stock grammar (`NORMAL_KEYWORDS.concat(...)`),
  // and shared with every nested mode, so pushing propagates.
  keywords.keyword.push("checked", "allows");

  const contains = /** @type {any[]} */ (lang.contains);
  const classHeader = contains.find(
    (mode) => mode.beginKeywords === "class interface",
  );
  if (!classHeader)
    throw new Error("csharp patch: class header mode not found");
  const whereClause = /** @type {any[]} */ (classHeader.contains).find(
    (mode) => mode.beginKeywords === "where class",
  );
  if (!whereClause)
    throw new Error("csharp patch: where clause mode not found");
  whereClause.beginKeywords = "where class struct notnull unmanaged allows ref";

  const string = contains.find(
    (mode) =>
      Array.isArray(mode.variants) &&
      mode.variants[0]?.begin instanceof RegExp &&
      mode.variants[0].begin.source.startsWith('"""'),
  );
  if (!string) throw new Error("csharp patch: string mode not found");
  const variants = /** @type {any[]} */ (string.variants);

  // Raw string literal: `"""..."""u8`. The object is function-local in the
  // stock grammar, so mutating it also covers the params copy.
  const rawString = variants[0];
  rawString.begin = new RegExp(`${rawString.begin.source}(?:u8|U8)?`);

  // Regular string literal: `"..."u8`. hljs.QUOTE_STRING_MODE is a shared
  // core constant, so swap in an inherited copy rather than mutating it.
  const quoteIndex = variants.findIndex(
    (variant) => variant.begin === '"' && variant.end === '"',
  );
  if (quoteIndex === -1)
    throw new Error("csharp patch: quote string variant not found");
  variants[quoteIndex] = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    end: /"(?:u8|U8)?/,
  });

  return lang;
}

export const csharp = { name: "csharp", register };
export default csharp;
