import base from "highlight.js/lib/languages/kotlin";

/**
 * Patches for highlight.js's Kotlin grammar.
 *
 * - Unsigned integer literals (stable since Kotlin 1.5): the `u` / `U`
 *   suffix, optionally followed by `L`, on decimal, hex, octal, and binary
 *   integers (`42u`, `0xFFu`, `1UL`). The stock grammar only knew `L`.
 * - Kotlin 2.2 context parameters: `context(logger: Logger) fun f()`.
 *   `context` is a soft keyword, so it is styled only when `(` follows,
 *   and not after a `.` (`foo.context(x)` stays a plain call).
 * - Kotlin 2.2 multi-dollar interpolation: in `$$"..."` and `$$"""..."""`
 *   only `$$name` and `$${expr}` interpolate. A lone `$schema` is plain
 *   text. Prefixes of two to four dollars are covered.
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

  // Context parameters. The guard mode swallows `.context` so a member
  // call stays plain; it must sit before the keyword mode.
  const functionIndex = contains.findIndex(
    (mode) => mode.className === "function" && mode.beginKeywords === "fun",
  );
  if (functionIndex === -1)
    throw new Error("kotlin patch: function mode not found");
  contains.splice(
    functionIndex,
    0,
    { match: /\.\s*context\b/, relevance: 0 },
    { match: /\bcontext(?=\s*\()/, scope: "keyword", relevance: 0 },
  );

  // Multi-dollar strings. STRING is built fresh per call and shared with
  // the params and `${}` modes, so new variants reach every string.
  const string = contains.find(
    (mode) =>
      mode.className === "string" &&
      Array.isArray(mode.variants) &&
      mode.variants[0]?.begin === '"""',
  );
  if (!string) throw new Error("kotlin patch: string mode not found");
  const variants = /** @type {any[]} */ (string.variants);
  const tripleEnd = variants[0].end;
  if (!variants.some((variant) => variant.begin === '"' && variant.end === '"'))
    throw new Error("kotlin patch: quote variant not found");

  const multiDollar = [];
  for (const count of [4, 3, 2]) {
    const dollars = "\\$".repeat(count);
    const interpolation = [
      {
        className: "variable",
        begin: dollars + hljs.UNDERSCORE_IDENT_RE,
      },
      {
        className: "subst",
        begin: `${dollars}\\{`,
        end: /\}/,
        contains: [hljs.C_NUMBER_MODE, string],
      },
    ];
    multiDollar.push(
      { begin: `${dollars}"""`, end: tripleEnd, contains: interpolation },
      {
        begin: `${dollars}"`,
        end: '"',
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE, ...interpolation],
      },
    );
  }
  variants.unshift(...multiDollar);

  return lang;
}

export const kotlin = { name: "kotlin", register };
export default kotlin;
