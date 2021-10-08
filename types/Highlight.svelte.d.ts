/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface HighlightProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * @default { name: undefined, register: undefined }
   */
  language?: {
    name?: string;
    register: (hljs: any) => Record<string, any>;
  };

  /**
   * Source code to highlight
   */
  code?: string;

  /**
   * Add a language tag to the top-right
   * of the code block
   */
  langtag?: boolean;
}

export default class Highlight extends SvelteComponentTyped<
  HighlightProps,
  { highlight: CustomEvent<{ highlighted: string }> },
  { default: { highlighted?: string } }
> {}
