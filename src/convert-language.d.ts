import type { GrammarIR } from "./engine.d.ts";

export interface ConvertResult {
  ir: GrammarIR;
  warnings: string[];
}

/**
 * Converts a registered hljs grammar to the engine IR.
 * @param hljs instance (e.g. from `highlight.js/lib/core`) with the grammar
 *   and its sublanguages registered
 * @param grammarSource raw source of the grammar's file, to recover data the
 *   compiled mode tree doesn't expose
 */
export function convertLanguage(
  hljs: unknown,
  name: string,
  grammarSource?: string,
): ConvertResult;
