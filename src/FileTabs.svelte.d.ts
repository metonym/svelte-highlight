import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type FileTabsProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Tab labels.
   * @example ["App.svelte", "index.js"]
   */
  files: string[];

  /**
   * Active file (`bind:active`).
   * @default files[0]
   */
  active?: string;

  /**
   * Gap between tabs.
   * @default 0
   */
  "--file-tabs-gap"?: string | number;

  /**
   * Tab strip background.
   * @default "inherit"
   */
  "--file-tabs-background"?: string;

  /**
   * Tab padding.
   * @default "0.5em 1em"
   */
  "--tab-padding"?: string;

  /**
   * Inactive tab text color.
   * @default "inherit"
   */
  "--tab-color"?: string;

  /**
   * Inactive tab background.
   * @default "transparent"
   */
  "--tab-background"?: string;

  /**
   * Inactive tab opacity. Active/hovered tabs stay opaque.
   * @default 0.55
   */
  "--tab-inactive-opacity"?: string | number;

  /**
   * Active tab text color.
   * Defaults to the highlighted code block's text color.
   * @default the highlighted code's color
   */
  "--tab-active-color"?: string;

  /**
   * Active tab background.
   * Defaults to the highlighted code block's background.
   * @default the highlighted code's background
   */
  "--tab-active-background"?: string;

  /**
   * Keyboard focus outline.
   * @default "2px solid currentColor"
   */
  "--tab-focus-outline"?: string;
};

export type FileTabsEvents = {
  change: CustomEvent<{
    /**
     * The newly active file.
     */
    active: string;
  }>;
};

export type FileTabsSlots = {
  default: {
    /**
     * The active file.
     */
    active: string;
  };
};

export default class FileTabs extends SvelteComponentTyped<
  FileTabsProps,
  FileTabsEvents,
  FileTabsSlots
> {}
