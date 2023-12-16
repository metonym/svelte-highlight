// @ts-check
import cssnano from "cssnano";
import litePreset from "cssnano-preset-lite";
import postcss from "postcss";

/** @type {(css: string, discardComments?: import('cssnano-preset-lite').Options['discardComments']) => string} */
export const minifyCss = (css, discardComments = false) => {
  const preset = litePreset({
    discardComments,
  });

  return postcss([cssnano({ preset })]).process(css).css;
};
