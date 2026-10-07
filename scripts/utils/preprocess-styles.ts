import litePreset from "cssnano-preset-lite";
import postcss, { type AcceptedPlugin, type Plugin } from "postcss";
import discardDuplicates from "postcss-discard-duplicates";
import { inlineCssVars } from "postcss-inline-css-vars";
import mergeRules from "postcss-merge-rules";
import { LICENSE_OR_AUTHOR } from "./regexes.ts";
import {
  type RemoveDeadDeclarationsStats,
  removeDeadDeclarations,
} from "./remove-dead-declarations.ts";

/**
 * Equivalent to `cssnano({ preset: litePreset(options) })` without importing
 * `cssnano`, which eagerly loads cssnano-preset-default (svgo, caniuse-lite).
 */
const cssnanoLite = (options: Parameters<typeof litePreset>[0]) =>
  postcss(
    litePreset(options).plugins.flatMap(
      ([plugin, pluginOptions]): AcceptedPlugin[] =>
        pluginOptions === false || pluginOptions?.exclude
          ? []
          : [plugin(pluginOptions)],
    ),
  );

/** Drops the newlines hljs styles put between selectors in a list. */
const joinSelectors: Plugin = {
  postcssPlugin: "join-selectors",
  Rule(rule) {
    rule.selector = rule.selectors.join(",");
  },
};

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
    joinSelectors,
    cssnanoLite({
      discardComments:
        options?.discardComments === "preserve-license"
          ? { remove: (comment) => !LICENSE_OR_AUTHOR.test(comment) }
          : options?.discardComments === "remove-all"
            ? { removeAll: true }
            : undefined,
    }),
  ]).process(css).css;
};

const stripCommentsProcessor = postcss([
  cssnanoLite({ discardComments: { removeAll: true } }),
]);

/** Same as `preprocessStyles` with `"remove-all"`, for already-processed CSS. */
export const stripComments = (css: string) =>
  stripCommentsProcessor.process(css).css;
