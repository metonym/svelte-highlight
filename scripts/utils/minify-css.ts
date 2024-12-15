import cssnano from "cssnano";
import litePreset from "cssnano-preset-lite";
import postcss from "postcss";
import discardDuplicates from "postcss-discard-duplicates";
import mergeRules from "postcss-merge-rules";

export const minifyCss = (
  css: string,
  options?: {
    discardComments?: "preserve-license" | "remove-all";
  },
) => {
  return postcss([
    discardDuplicates(),
    mergeRules(),
    cssnano({
      preset: litePreset({
        discardComments:
          options?.discardComments === "preserve-license"
            ? {
                remove: (comment) => {
                  if (/(License|Author)/i.test(comment)) {
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
