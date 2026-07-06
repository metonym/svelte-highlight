import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName, LanguageType } from "./languages";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * Built-in language names to consider for auto-detection.
     * This can improve performance and accuracy.
     * @example ["javascript", "typescript"]
     */
    languageNames?: (LanguageName | (string & {}))[];

    /**
     * Custom grammars (e.g. `svelte-highlight/languages/*`) to register and
     * consider for auto-detection. Custom grammars are otherwise invisible
     * to `HighlightAuto` unless a `Highlight` component registered them first.
     * @example
     * import svelte from "svelte-highlight/languages/svelte";
     * // ...
     * languages={[svelte]}
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
     * The second-best heuristically detected language, if any.
     * @example { language: "typescript", relevance: 8 }
     */
    secondBest?: { language: string; relevance: number };
  }>;
};

export type HighlightAutoSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
