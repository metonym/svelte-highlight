import cssnano from "cssnano";
import litePreset, { type LiteOptions } from "cssnano-preset-lite";
import postcss from "postcss";
import discardDuplicates from "postcss-discard-duplicates";
import mergeRules from "postcss-merge-rules";

export const minifyCss = (
  css: string,
  discardComments?: LiteOptions["discardComments"],
) => {
  return postcss([
    discardDuplicates(),
    mergeRules(),
    cssnano({ preset: litePreset({ discardComments }) }),
  ]).process(css).css;
};
