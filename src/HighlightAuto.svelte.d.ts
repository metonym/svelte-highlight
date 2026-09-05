import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName, LanguageType } from "./languages";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * Languages to consider for auto-detection. Combines with `languages`
     * when both are given (`languageNames` further filters `languages`'
     * pool); in the default (no `languages`) path, this becomes the exact
     * candidate list tier-0 detection loads, skipping the fingerprint step.
     * @example ["javascript", "typescript"]
     */
    languageNames?: (LanguageName | (string & {}))[];

    /**
     * Explicit language modules to detect among. When provided, detection
     * is synchronous and SSR-highlighted, exactly like `Highlight`, over
     * this bounded, deterministic-bundle pool - the escape hatch for the
     * old (pre-tiered) always-synchronous default behavior.
     *
     * Without this prop, `HighlightAuto` renders plain escaped text on the
     * server and on first client paint (dynamic import can't run in
     * Svelte's synchronous SSR), then upgrades to highlighted output once a
     * tier-0 fingerprint match's grammar finishes loading; `on:highlight`
     * fires after that async completion instead of synchronously.
     * @example [typescript, python, rust]
     */
    languages?: LanguageType<string>[];
  };

export type HighlightAutoEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The language name inferred by `highlight.js`.
     * @example "css"
     */
    language: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlightAuto(...).events` returns. See
     * `svelte-highlight/engine` for headless consumption (`tokenLines`,
     * `toRanges`, custom renderers).
     */
    events: ScopeEvent[];
  }>;
};

export type HighlightAutoSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlightAuto(...).events` returns. See
     * `svelte-highlight/engine` for headless consumption (`tokenLines`,
     * `toRanges`, custom renderers).
     */
    events: ScopeEvent[];
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
