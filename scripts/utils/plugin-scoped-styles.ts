import type { Plugin } from "postcss";

const RE_PRE = /^pre /;

export function pluginScopedStyles({
  moduleName,
}: {
  moduleName: string;
}): Plugin {
  return {
    postcssPlugin: "postcss-plugin:scoped-styles",
    Once(root) {
      root.walkRules((rule) => {
        rule.selectors = rule.selectors.map((selector) => {
          if (RE_PRE.test(selector)) {
            selector = `pre.${moduleName}${selector.replace(RE_PRE, " ")}`;
          } else {
            selector = `.${moduleName} ${selector}`;
          }

          return selector;
        });
      });
    },
  };
};
