import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type LangTagProps = HTMLAttributes<HTMLPreElement> & {
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

  /**
   * Set to `true` for the language name to be
   * displayed at the top right of the code block.
   *
   * Use style props to customize styles:
   * - `--langtag-background`
   * - `--langtag-color`
   * - `--langtag-border-radius`
   *
   * @default false
   */
  langtag?: boolean;
};

export type LangTagEvents = {};

export type LangTagSlots = {};

export default class LangTag extends SvelteComponentTyped<
  LangTagProps,
  LangTagEvents,
  LangTagSlots
> {}
