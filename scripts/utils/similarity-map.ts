import postcss from "postcss";
import { inlineCssVars } from "postcss-inline-css-vars";

const SIMPLE_TOKEN = /^\.hljs-[\w-]+$/;

/** A scope must appear (with a real `color`) in at least this fraction of
 * themes to be treated as a legitimate gap-fill target — filters out
 * one-off/typo scopes that most themes never touch at all. */
const CANONICAL_THRESHOLD_PCT = 0.1;

/** Minimum overlap-coefficient score to accept a donor. Below this the
 * corpus doesn't agree enough on what a scope "should" match. */
const MIN_SIMILARITY = 0.15;

/** Per-theme gap-fill proposals: scope token -> color to fill it with. */
export type GapFillProposals = Map<string, string>;

/**
 * Mines which `.hljs-*` scopes are declared with the same `color` across the
 * corpus — grouped in the same rule, e.g. `.hljs-attr, .hljs-number { color:
 * X }`, which is a deliberate authoring choice, not coincidence — to build a
 * similarity graph between scopes.
 *
 * For a theme that never styles a given canonical scope at all, proposes
 * borrowing color from that *same theme's* closest-styled sibling scope
 * (per the mined graph), rather than an arbitrary/foreign color pulled from
 * another theme's palette.
 */
export function buildGapFillProposals(
  rawCssByTheme: Map<string, string>,
): Map<string, GapFillProposals> {
  const themes: Array<{ name: string; declared: Map<string, string> }> = [];
  const coOccurrence = new Map<string, number>();
  const appearanceCount = new Map<string, number>();

  for (const [name, raw] of rawCssByTheme) {
    const root = postcss([inlineCssVars()]).process(raw, {
      from: undefined,
    }).root;

    const declared = new Map<string, string>();
    const pairsSeen = new Set<string>();

    root.walkRules((rule) => {
      const tokens = rule.selectors.filter((s) => SIMPLE_TOKEN.test(s));
      if (tokens.length === 0) return;

      let color: string | undefined;
      rule.walkDecls((decl) => {
        if (decl.prop === "color") color = decl.value;
      });

      // Some themes group scopes like `.hljs-formula, .hljs-attr,
      // .hljs-property, .hljs-params {}` with an intentionally empty body
      // (see default.css's "purposely ignored" comment) — a strong grouping
      // signal, but there's no actual color to mine, so only count
      // co-occurrence (and appearance) when the rule declares a real color.
      if (color) {
        for (const token of tokens) declared.set(token, color);

        for (let i = 0; i < tokens.length; i++) {
          for (let j = i + 1; j < tokens.length; j++) {
            pairsSeen.add([tokens[i], tokens[j]].sort().join("|"));
          }
        }
      }
    });

    for (const token of declared.keys()) {
      appearanceCount.set(token, (appearanceCount.get(token) ?? 0) + 1);
    }
    for (const pairKey of pairsSeen) {
      coOccurrence.set(pairKey, (coOccurrence.get(pairKey) ?? 0) + 1);
    }

    themes.push({ name, declared });
  }

  const threshold = Math.ceil(themes.length * CANONICAL_THRESHOLD_PCT);
  const canonicalTokens = [...appearanceCount.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([token]) => token);

  const similarity = (a: string, b: string): number => {
    const key = [a, b].sort().join("|");
    const co = coOccurrence.get(key) ?? 0;
    if (co === 0) return 0;
    const denom = Math.min(
      appearanceCount.get(a) ?? 1,
      appearanceCount.get(b) ?? 1,
    );
    return co / denom;
  };

  const proposalsByTheme = new Map<string, GapFillProposals>();
  for (const theme of themes) {
    const proposals: GapFillProposals = new Map();

    for (const token of canonicalTokens) {
      if (theme.declared.has(token)) continue;

      let best: { donor: string; score: number } | undefined;
      for (const [donor] of theme.declared) {
        const score = similarity(token, donor);
        if (score >= MIN_SIMILARITY && (!best || score > best.score)) {
          best = { donor, score };
        }
      }

      if (best) {
        const donorColor = theme.declared.get(best.donor);
        if (donorColor) proposals.set(token, donorColor);
      }
    }

    proposalsByTheme.set(theme.name, proposals);
  }

  return proposalsByTheme;
}
