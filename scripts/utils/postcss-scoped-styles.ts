import type { Plugin } from "postcss";
import { PRE_SELECTOR } from "./regexes";

/**
 * Scopes CSS selectors to a given module name.
 *
 * @example
 * ```css
 * .moduleName p { color: red; }
 * .moduleName div { background: blue; }
 * ```
 */
export const postcssScopedStyles = (moduleName: string): Plugin => {
  return {
    postcssPlugin: "postcss-scoped-styles",
    // biome-ignore lint/style/useNamingConvention: PostCSS plugin API requires capitalized method names
    Once(root) {
      root.walkRules((rule) => {
        rule.selectors = rule.selectors.map((selector) => {
          if (PRE_SELECTOR.test(selector)) {
            selector = `pre.${moduleName}${selector.replace(PRE_SELECTOR, " ")}`;
          } else {
            selector = `.${moduleName} ${selector}`;
          }
          return selector;
        });
      });
    },
  };
};
