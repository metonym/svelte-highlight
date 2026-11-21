import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { CodeRegionProps, LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type HighlightAutoLazyProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps &
  CodeRegionProps & {
    /** Code to highlight. */
    code: any;

    /**
     * Detect among these grammars only. Skips the fingerprint step and
     * loads each named grammar on demand. Use canonical names.
     * @example ["javascript", "typescript"]
     */
    languageNames?: (LanguageName | (string & {}))[];
  };

export type HighlightAutoLazyEvents = {
  /**
   * Fires when a detection result renders. Does not fire for the
   * plain-text placeholder shown during SSR and while grammars load.
   */
  highlight: CustomEvent<{
    /** The highlighted HTML. */
    highlighted: string;

    /** The detected language name, e.g. `"css"`. */
    language: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];

    /**
     * Runner-up candidate and its relevance score; `undefined` when no other
     * candidate scored above zero.
     */
    secondBest?: { language: string | undefined; relevance: number };
  }>;
};

export type HighlightAutoLazySlots = {
  default: {
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  };
};

/**
 * Like `HighlightAuto`, but does not import every grammar. It scores the
 * code against a small fingerprint index, loads only a few likely
 * grammars, and lets the relevance engine pick among them and every
 * grammar already registered.
 *
 * Renders plain text during SSR and until the grammars load.
 */
export default class HighlightAutoLazy extends SvelteComponentTyped<
  HighlightAutoLazyProps,
  HighlightAutoLazyEvents,
  HighlightAutoLazySlots
> {}
