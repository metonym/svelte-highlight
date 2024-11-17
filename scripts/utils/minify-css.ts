import cssnano from "cssnano";
import litePreset, { type LiteOptions } from "cssnano-preset-lite";
import postcss from "postcss";

export const minifyPreset = (
  discardComments?: LiteOptions["discardComments"],
) => [cssnano({ preset: litePreset({ discardComments }) })];

export const minifyCss = (
  css: string,
  discardComments?: LiteOptions["discardComments"],
) => {
  return postcss(minifyPreset(discardComments)).process(css).css;
};
