import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /** Code to highlight. */
    code: any;

    /**
     * Candidate languages for auto-detection (improves speed and accuracy).
     * @example ["javascript", "typescript"]
     */
    languageNames?: (LanguageName | (string & {}))[];
  };

export type HighlightAutoEvents = {
  /** Fires when the highlighting result changes, including to empty. */
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

export type HighlightAutoSlots = {
  default: {
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
