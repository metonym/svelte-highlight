import type { Plugin } from "postcss";
import type { GapFillProposals } from "./similarity-map.ts";

/**
 * Appends a `{ color }`-only rule for each proposed gap fill (see
 * `buildGapFillProposals`). Runs after `removeDeadDeclarations` so the newly
 * added rules are never mistaken for dead code, and before `mergeRules`/
 * `cssnano` so an added rule can still merge with an existing one that
 * happens to share the same color.
 */
export const fillSimilarityGaps = (proposals: GapFillProposals): Plugin => ({
  postcssPlugin: "fill-similarity-gaps",
  OnceExit(root) {
    for (const [token, color] of proposals) {
      root.append({
        selector: token,
        nodes: [{ prop: "color", value: color }],
      });
    }
  },
});
fillSimilarityGaps.postcss = true;
