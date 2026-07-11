import type { GrammarIR } from "./engine.d.ts";

export interface ConvertResult {
  ir: GrammarIR;
  warnings: string[];
}

/**
 * @param hljs instance (e.g. from `highlight.js/lib/core`) with the grammar
 *   (and any sublanguages it embeds) already registered
 * @param name
 */
export function convertLanguage(hljs: unknown, name: string): ConvertResult;
