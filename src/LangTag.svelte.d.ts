import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";

export type LangTagProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Specify the text to highlight.
     */
    code: any;

    /**
     * Provide the highlighted code.
     */
    highlighted: string;

    /**
     * Provide the language name.
     * @default "plaintext"
     */
    languageName?: string;
  };

export type LangTagEvents = {};

export type LangTagSlots = {};

export default class LangTag extends SvelteComponentTyped<
  LangTagProps,
  LangTagEvents,
  LangTagSlots
> {}
