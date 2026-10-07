import type { Plugin } from "postcss";
import type { GapFillProposals } from "./similarity-map.ts";

/**
 * Appends a `{ color }` rule per proposal. Must run after
 * `removeDeadDeclarations` and before `mergeRules` so fills can merge.
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
