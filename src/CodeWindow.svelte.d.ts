import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CodeWindowProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Window chrome style.
   * @default "macos"
   */
  variant?: "macos" | "terminal" | "plain";

  /**
   * Title bar text.
   * @default ""
   */
  title?: string;

  /**
   * Window body background.
   * @default "#1e1e1e"
   */
  "--window-background"?: string;

  /**
   * Window border.
   * @default "1px solid rgba(255, 255, 255, 0.1)"
   */
  "--window-border"?: string;

  /**
   * Window corner radius.
   * @default "0"
   */
  "--window-radius"?: string;

  /**
   * Title bar gap.
   * @default "0.5em"
   */
  "--titlebar-gap"?: string;

  /**
   * Title bar padding.
   * @default "0.65em 1em"
   */
  "--titlebar-padding"?: string;

  /**
   * Title bar background.
   * @default "#2d2d2d"
   */
  "--titlebar-background"?: string;

  /**
   * Title bar bottom border.
   * @default "1px solid rgba(255, 255, 255, 0.1)"
   */
  "--titlebar-border"?: string;

  /**
   * Title bar text color.
   * @default "rgba(255, 255, 255, 0.6)"
   */
  "--titlebar-color"?: string;

  /**
   * Title bar font family.
   * @default "system-ui, -apple-system, sans-serif"
   */
  "--titlebar-font-family"?: string;

  /**
   * Title bar font size.
   * @default "0.8125em"
   */
  "--titlebar-font-size"?: string;

  /**
   * Traffic-light dot gap.
   * @default "0.5em"
   */
  "--dot-gap"?: string;

  /**
   * Traffic-light dot size.
   * @default "0.75em"
   */
  "--dot-size"?: string;

  /**
   * Close dot color.
   * @default "#ff5f56"
   */
  "--dot-close"?: string;

  /**
   * Minimize dot color.
   * @default "#ffbd2e"
   */
  "--dot-minimize"?: string;

  /**
   * Maximize dot color.
   * @default "#27c93f"
   */
  "--dot-maximize"?: string;

  /**
   * Terminal prompt font family.
   * @default "ui-monospace, monospace"
   */
  "--prompt-font-family"?: string;

  /**
   * Terminal prompt font weight.
   * @default 700
   */
  "--prompt-font-weight"?: string | number;

  /**
   * Terminal prompt color.
   * @default "inherit"
   */
  "--prompt-color"?: string;
};

export type CodeWindowEvents = {};

export type CodeWindowSlots = {
  default: {};
};

export default class CodeWindow extends SvelteComponentTyped<
  CodeWindowProps,
  CodeWindowEvents,
  CodeWindowSlots
> {}
