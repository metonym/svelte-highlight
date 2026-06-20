import { scopeSelectors } from "../../src/scoped.js";
import { PRE_SELECTOR } from "./regexes.ts";

/**
 * Scope theme CSS for docs previews where `class={moduleName}` is on the
 * highlighted element, not a wrapper div. Uses `scopeSelectors` from
 * `src/scoped.js`.
 */
export const scopeStylesheet = (css: string, moduleName: string): string =>
  scopeSelectors(css, (selector) =>
    PRE_SELECTOR.test(selector)
      ? `pre.${moduleName}${selector.replace(PRE_SELECTOR, " ")}`
      : `.${moduleName} ${selector}`,
  );
