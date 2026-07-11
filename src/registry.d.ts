import type { Registry as EngineRegistry } from "./engine.d.ts";
import type { LanguageType } from "./languages";

/**
 * Shared engine registry: components register languages onto this one
 * instance on demand, same pattern as the shared `hljs.registerLanguage`
 * singleton it replaces. A language registered here is visible to
 * `<Highlight>` and vice versa. For an isolated instance (SSR request
 * isolation, tests), use `createRegistry()` from `svelte-highlight/engine`.
 */
export const registry: EngineRegistry;

/**
 * Registers `language` (and any grammars it embeds via `subLanguage`, e.g.
 * astro's html/typescript/css/javascript) on the shared registry.
 */
export function ensureRegistered(language: LanguageType<string>): void;
