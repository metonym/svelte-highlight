import base from "highlight.js/lib/languages/kotlin";

/**
 * Patches for highlight.js's Kotlin grammar.
 *
 * - Unsigned integer literals (stable since Kotlin 1.5): the `u` / `U`
 *   suffix, optionally followed by `L`, on decimal, hex, octal, and binary
 *   integers (`42u`, `0xFFu`, `1UL`). The stock grammar only knew `L`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const contains = /** @type {any[]} */ (lang.contains);
  const numberIndex = contains.findIndex(
    (mode) => mode.className === "number" && Array.isArray(mode.variants),
  );
  if (numberIndex === -1)
    throw new Error("kotlin patch: number mode not found");

  // The stock NUMERIC mode is a module-level constant shared across calls,
  // so build a patched copy instead of mutating it.
  const numeric = contains[numberIndex];
  const INTEGER_SUFFIX = "[lL]?\\b";
  const patchedVariants = /** @type {any[]} */ (numeric.variants).map(
    (variant) =>
      typeof variant.begin === "string" &&
      variant.begin.endsWith(INTEGER_SUFFIX)
        ? {
            ...variant,
            begin: `${variant.begin.slice(0, -INTEGER_SUFFIX.length)}(?:[uU][lL]?|[lL])?\\b`,
          }
        : variant,
  );
  if (patchedVariants.every((variant, i) => variant === numeric.variants[i]))
    throw new Error("kotlin patch: no integer variants found to patch");
  contains[numberIndex] = { ...numeric, variants: patchedVariants };

  return lang;
}

export const kotlin = { name: "kotlin", register };
export default kotlin;
