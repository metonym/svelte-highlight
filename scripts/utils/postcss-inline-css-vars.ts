import type { Plugin } from "postcss";

const RE_CSS_VARS = /var\((--[^)]+)\)/g;

const isCssVar = (value: string) => value.includes("var(");

/**
 * PostCSS plugin to inline CSS variables.
 * @example
 * **Before**
 * ```ts
 * :root { --color-primary: #000; }
 * .class { color: var(--color-primary); }
 * ```
 *
 * **After**
 * ```css
 * .class { color: #000; }
 * ```
 */
export const postcssInlineCssVars = (): Plugin => {
  return {
    postcssPlugin: "postcss-plugin:inline-css-vars",
    Once(root) {
      // Extract CSS variables from :root.
      let cssVars: Record<string, string> = {};
      let hasRootVars = false;

      root.walkRules(":root", (rule) => {
        hasRootVars = true;
        rule.walkDecls((decl) => {
          cssVars[decl.prop] = decl.value;
        });
        rule.remove();
      });

      // Skip if no CSS variables were found.
      if (!hasRootVars) return;

      // Resolve nested variables in the CSS vars definitions first.
      let changed = true;
      while (changed) {
        changed = false;
        for (const [prop, value] of Object.entries(cssVars)) {
          if (isCssVar(value)) {
            const newValue = value.replace(RE_CSS_VARS, (match, varName) => {
              return cssVars[varName] || match;
            });
            if (newValue !== value) {
              cssVars[prop] = newValue;
              changed = true;
            }
          }
        }
      }

      // Replace var() references with resolved values.
      root.walkDecls((decl) => {
        if (isCssVar(decl.value)) {
          decl.value = decl.value.replace(RE_CSS_VARS, (match, varName) => {
            return cssVars[varName] || match;
          });
        }
      });
    },
  };
};
