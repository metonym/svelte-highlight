/// <reference types="svelte" />
import { SvelteComponent } from "svelte";

export interface HighlightLiteProps {
  /**
   * @default ""
   */
  code?: string;

  /**
   * @default ""
   */
  highlighted?: string;

  /**
   * @default { name: undefined, register: undefined }
   */
  language?: { name: string; register: any };
}

export default class HighlightLite extends SvelteComponent<HighlightLiteProps, {}, {}> {}
