import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CodeToolbarProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Language badge text. Omitted entirely when unset.
   */
  languageName?: string;

  /**
   * File name shown next to the badge, with a `title` attribute for
   * truncation.
   * @default ""
   */
  title?: string;

  /**
   * Whether the toolbar sticks to the top of its scrolling ancestor via
   * `position: sticky`.
   * @default true
   */
  sticky?: boolean;

  /**
   * Accessible name for the `role="toolbar"` root. Omitted when unset.
   */
  label?: string;

  /**
   * Toolbar background.
   * @default "inherit"
   */
  "--toolbar-background"?: string;

  /**
   * Toolbar text color.
   * @default "inherit"
   */
  "--toolbar-color"?: string;

  /**
   * Toolbar bottom border.
   * @default "1px solid rgba(0, 0, 0, 0.1)"
   */
  "--toolbar-border"?: string;

  /**
   * Toolbar padding.
   * @default "0.5em 1em"
   */
  "--toolbar-padding"?: string;

  /**
   * Gap between toolbar children.
   * @default "0.5em"
   */
  "--toolbar-gap"?: string;

  /**
   * Minimum height of the toolbar.
   * @default "2.5em"
   */
  "--toolbar-height"?: string;

  /**
   * Toolbar font family.
   * @default "inherit"
   */
  "--toolbar-font-family"?: string;

  /**
   * Toolbar font size.
   * @default "inherit"
   */
  "--toolbar-font-size"?: string;

  /**
   * Toolbar stacking order.
   * @default 2
   */
  "--toolbar-z-index"?: string | number;
};

export type CodeToolbarEvents = {};

export type CodeToolbarSlots = {
  start: {};
  default: {};
};

export default class CodeToolbar extends SvelteComponentTyped<
  CodeToolbarProps,
  CodeToolbarEvents,
  CodeToolbarSlots
> {}
