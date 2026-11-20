import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CodeToolbarProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Language badge text. Omitted entirely when unset.
   */
  languageName?: string;

  /**
   * File name shown before the badge, with a `title` attribute for
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
   * Tint painted over the theme background.
   * @default "color-mix(in srgb, currentColor 5%, transparent)"
   */
  "--toolbar-background"?: string;

  /**
   * Text color of the toolbar content. Defaults to the theme's text color.
   * @default "inherit"
   */
  "--toolbar-color"?: string;

  /**
   * Toolbar bottom border.
   * @default "1px solid color-mix(in srgb, currentColor 14%, transparent)"
   */
  "--toolbar-border"?: string;

  /**
   * Toolbar padding.
   * @default "0.25em 0.375em 0.25em 1em"
   */
  "--toolbar-padding"?: string;

  /**
   * Gap between the title, badge and controls.
   * @default "0.75em"
   */
  "--toolbar-gap"?: string;

  /**
   * Minimum height of the toolbar.
   * @default "2.75em"
   */
  "--toolbar-height"?: string;

  /**
   * Toolbar font family.
   * @default "system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif"
   */
  "--toolbar-font-family"?: string;

  /**
   * Toolbar font size.
   * @default "0.8125em"
   */
  "--toolbar-font-size"?: string;

  /**
   * Stacking order of a sticky toolbar.
   * @default 3
   */
  "--toolbar-z-index"?: string | number;

  /**
   * Language badge background.
   * @default "color-mix(in srgb, currentColor 10%, transparent)"
   */
  "--langtag-background"?: string;

  /**
   * Language badge text color.
   * @default "color-mix(in srgb, currentColor 72%, transparent)"
   */
  "--langtag-color"?: string;

  /**
   * Language badge padding.
   * @default "0.125em 0.625em"
   */
  "--langtag-padding"?: string;

  /**
   * Language badge corner radius.
   * @default "999px"
   */
  "--langtag-border-radius"?: string;

  /**
   * Language badge font size.
   * @default "0.875em"
   */
  "--langtag-font-size"?: string;
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
