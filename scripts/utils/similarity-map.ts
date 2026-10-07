import postcss from "postcss";
import { inlineCssVars } from "postcss-inline-css-vars";

const SIMPLE_TOKEN = /^\.hljs-[\w-]+$/;

/** Min fraction of themes coloring a scope for it to be a gap-fill target. */
const CANONICAL_THRESHOLD_PCT = 0.1;

/** Min overlap-coefficient score to accept a donor. */
const MIN_SIMILARITY = 0.15;

/** Scope token -> fill color. */
export type GapFillProposals = Map<string, string>;

/**
 * Builds a scope similarity graph from `.hljs-*` scopes grouped in the same
 * colored rule across all themes. For each canonical scope a theme never
 * styles, proposes the color of that theme's most similar styled scope.
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

      // Skip intentionally empty groups (default.css "purposely ignored").
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
