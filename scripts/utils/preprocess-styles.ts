import cssnano from "cssnano";
import litePreset from "cssnano-preset-lite";
import postcss, { type Plugin } from "postcss";
import discardDuplicates from "postcss-discard-duplicates";
import { inlineCssVars } from "postcss-inline-css-vars";
import mergeRules from "postcss-merge-rules";
import { LICENSE_OR_AUTHOR } from "./regexes.ts";
import {
  type RemoveDeadDeclarationsStats,
  removeDeadDeclarations,
} from "./remove-dead-declarations.ts";

/**
 * Raw styles from `highlight.js` are preprocessed for consistency.
 * - Inlining CSS variables.
 * - Removing declarations unconditionally overridden later in the file.
 * - Discarding duplicate rules.
 * - Merging rules.
 * - Discarding comments (but preserving license comments).
 * - Minifying the CSS.
 */
export const preprocessStyles = (
  css: string,
  options?: {
    plugins?: Plugin[];
    discardComments?: "preserve-license" | "remove-all";
    deadDeclarationStats?: RemoveDeadDeclarationsStats;
  },
) => {
  return postcss([
    inlineCssVars(),
    removeDeadDeclarations(options?.deadDeclarationStats),
    ...(options?.plugins ?? []),
    discardDuplicates(),
    mergeRules(),
    cssnano({
      preset: litePreset({
        discardComments:
          options?.discardComments === "preserve-license"
            ? {
                remove: (comment) => {
                  if (LICENSE_OR_AUTHOR.test(comment)) {
                    // Preserve license comments.
                    return false;
                  }

                  return true;
                },
              }
            : options?.discardComments === "remove-all"
              ? { removeAll: true }
              : undefined,
      }),
    }),
  ]).process(css).css;
};

const stripCommentsProcessor = postcss([
  cssnano({ preset: litePreset({ discardComments: { removeAll: true } }) }),
]);

/**
 * Drop every comment (license ones too) from CSS that `preprocessStyles`
 * already processed. Same output as re-running `preprocessStyles` on the
 * source with `discardComments: "remove-all"`, but skips the second full
 * plugin pass (var inlining, dead-declaration removal, rule merging).
 */
export const stripComments = (css: string) =>
  stripCommentsProcessor.process(css).css;
