/**
 * Convert a theme's `.hljs-<scope>` color/background-color rules into
 * `::highlight(hljs-<scope>)` rules. Font-style, font-weight, and any
 * property other than color/background-color are dropped (the API's
 * cross-browser envelope), as are compound and descendant selectors.
 */
export function highlightRules(theme: string): string;
