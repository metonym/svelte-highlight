/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface LegacyProps {
  /**
   * @default { name: undefined, register: undefined }
   */
  language?: {
    name?: string;
    register: (hljs: any) => Record<string, any>;
  };

  /**
   * @default "svelte-highlight"
   */
  class?: string;
  code?: string;
  id?: string;
  style?: string;
  contenteditable?: boolean | "true" | "false";
  spellcheck?: boolean;
}

export default class Legacy extends SvelteComponentTyped<
  LegacyProps,
  {},
  { default: {} }
> {}
