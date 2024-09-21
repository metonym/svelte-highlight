import type { Plugin } from "postcss";

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
          selector = `.${moduleName} ${selector}`;

          return selector;
        });
      });
    },
  };
}
