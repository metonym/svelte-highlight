import type { GrammarIR } from "./engine.d.ts";

export interface ConvertResult {
  ir: GrammarIR;
  warnings: string[];
}

/**
 * @param hljs instance (e.g. from `highlight.js/lib/core`) with the grammar
 *   (and any sublanguages it embeds) already registered
 * @param name
 * @param grammarSource raw source text of the grammar's own file, used only
 *   to recover data that the compiled mode tree doesn't expose
 */
export function convertLanguage(
  hljs: unknown,
  name: string,
  grammarSource?: string,
): ConvertResult;
