import type { Registry as EngineRegistry } from "./engine.d.ts";
import type { LanguageType } from "./languages";

/**
 * Shared registry used by all components; languages registered here are
 * visible everywhere. For an isolated instance (SSR, tests), use
 * `createRegistry()` from `svelte-highlight/engine`.
 */
export const registry: EngineRegistry;

/** Registers `language` (and any grammars it embeds via `subLanguage`) on the shared registry. */
export function ensureRegistered(language: LanguageType<string>): void;
