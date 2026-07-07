import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type LangTagProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * Highlighted HTML.
     */
    highlighted: string;

    /**
     * Language name.
     * @default "plaintext"
     */
    languageName?: LanguageName | (string & {});

    /**
     * Accessible name for the scrollable code region.
     * @default "Code"
     */
    label?: string;
  };

export type LangTagEvents = {};

export type LangTagSlots = {};

export default class LangTag extends SvelteComponentTyped<
  LangTagProps,
  LangTagEvents,
  LangTagSlots
> {}
