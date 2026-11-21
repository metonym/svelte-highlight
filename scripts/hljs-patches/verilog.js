import base from "highlight.js/lib/languages/verilog";

/**
 * Patches for highlight.js's Verilog grammar.
 *
 * - `systemverilog` alias. The grammar already takes `sv` and `svh`.
 *   Shiki names it `system-verilog`, and docs often spell out
 *   `systemverilog`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "systemverilog"];

  return lang;
}

export const verilog = { name: "verilog", register };
export default verilog;
