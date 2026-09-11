import base from "highlight.js/lib/languages/dart";

/**
 * Patches for highlight.js's Dart grammar.
 *
 * - Inside a `class` / `interface` header the stock grammar only knows
 *   `extends` and `implements`; `with` (mixin application) and `on` (`mixin
 *   class M on Base`) were styled as class titles.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const contains = /** @type {any[]} */ (lang.contains);
  const classHeader = contains.find(
    (mode) =>
      mode.className === "class" && mode.beginKeywords === "class interface",
  );
  if (!classHeader) throw new Error("dart patch: class header mode not found");
  const clauseKeywords = /** @type {any[]} */ (classHeader.contains).find(
    (mode) => mode.beginKeywords === "extends implements",
  );
  if (!clauseKeywords)
    throw new Error("dart patch: class clause mode not found");
  clauseKeywords.beginKeywords = "extends implements with on";

  return lang;
}

export const dart = { name: "dart", register };
export default dart;
