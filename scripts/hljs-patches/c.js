import base from "highlight.js/lib/languages/c";

/**
 * Patches for highlight.js's C grammar.
 *
 * - C23 `nullptr` literal, alongside the existing `true` / `false` / `NULL`.
 * - C23 bit-precise integer suffixes `wb` / `WB` (and `uwb` / `WBu`
 *   combinations) for `_BitInt` literals, alongside `u` / `l` / `ll`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string; built_in: string }} */ (
      lang.keywords
    );

  // The stock literal list is a space-separated string built per call.
  keywords.literal = `${keywords.literal} nullptr`;

  const contains = /** @type {any[]} */ (lang.contains);
  const numbers = contains.find((mode) => mode.className === "number");
  if (!numbers) throw new Error("c patch: number mode not found");
  const suffixed = /** @type {any[]} */ (numbers.variants).find(
    (variant) =>
      variant.match instanceof RegExp &&
      variant.match.source.includes("(ll|LL|l|L)(u|U)?"),
  );
  if (!suffixed) throw new Error("c patch: suffixed number variant not found");
  suffixed.match = new RegExp(
    suffixed.match.source.replace(
      "(ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?",
      "(ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L|wb|WB)?|(wb|WB)(u|U)?",
    ),
  );

  return lang;
}

export const c = { name: "c", register };
export default c;
