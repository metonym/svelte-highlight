import type { Plugin } from "postcss";

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
    postcssPlugin: "postcss-plugin:scoped-styles",
    Once(root) {
      root.walkRules((rule) => {
        rule.selectors = rule.selectors.map((selector) => {
          if (/^pre /.test(selector)) {
            selector = `pre.${moduleName}${selector.replace(/^pre /, " ")}`;
          } else {
            selector = `.${moduleName} ${selector}`;
          }
          return selector;
        });
      });
    },
  };
};
