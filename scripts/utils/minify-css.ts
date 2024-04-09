import cssnano from "cssnano";
import litePreset, { type LiteOptions } from "cssnano-preset-lite";
import postcss from "postcss";

export const minifyCss = (
  css: string,
  discardComments?: LiteOptions["discardComments"],
) => {
  return postcss([
    cssnano({ preset: litePreset({ discardComments }) }),
  ]).process(css).css;
};
