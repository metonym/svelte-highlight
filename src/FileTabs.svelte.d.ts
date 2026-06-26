import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type FileTabsProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Specify the file names to render as tabs.
   * @example ["App.svelte", "index.js"]
   */
  files: string[];

  /**
   * Specify the active file. Supports `bind:active`.
   * @default files[0]
   */
  active?: string;

  /**
   * Customize the gap between tabs.
   * @default 0
   */
  "--file-tabs-gap"?: string | number;

  /**
   * Customize the background color of the tab strip.
   * @default "inherit"
   */
  "--file-tabs-background"?: string;

  /**
   * Customize the padding of each tab.
   * @default "0.5em 1em"
   */
  "--tab-padding"?: string;

  /**
   * Customize the text color of an inactive tab.
   * @default "inherit"
   */
  "--tab-color"?: string;

  /**
   * Customize the background color of an inactive tab.
   * @default "transparent"
   */
  "--tab-background"?: string;

  /**
   * Customize the opacity of inactive tabs. Active and hovered tabs are
   * always fully opaque.
   * @default 0.55
   */
  "--tab-inactive-opacity"?: string | number;

  /**
   * Customize the text color of the active tab.
   * Defaults to the highlighted code block's text color.
   * @default the highlighted code's color
   */
  "--tab-active-color"?: string;

  /**
   * Customize the background color of the active tab.
   * Defaults to the highlighted code block's background.
   * @default the highlighted code's background
   */
  "--tab-active-background"?: string;

  /**
   * Customize the focus outline shown when a tab is focused via the keyboard.
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
