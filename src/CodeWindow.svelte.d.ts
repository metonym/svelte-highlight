import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CodeWindowProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Specify the window chrome style.
   * @default "macos"
   */
  variant?: "macos" | "terminal" | "plain";

  /**
   * Specify the title shown in the title bar.
   * @default ""
   */
  title?: string;

  /**
   * Customize the background color of the window body.
   * @default "#1e1e1e"
   */
  "--window-background"?: string;

  /**
   * Customize the border of the window.
   * @default "1px solid rgba(255, 255, 255, 0.1)"
   */
  "--window-border"?: string;

  /**
   * Customize the corner radius of the window.
   * @default "0"
   */
  "--window-radius"?: string;

  /**
   * Customize the gap between items in the title bar.
   * @default "0.5em"
   */
  "--titlebar-gap"?: string;

  /**
   * Customize the padding of the title bar.
   * @default "0.65em 1em"
   */
  "--titlebar-padding"?: string;

  /**
   * Customize the background color of the title bar.
   * @default "#2d2d2d"
   */
  "--titlebar-background"?: string;

  /**
   * Customize the bottom border of the title bar.
   * @default "1px solid rgba(255, 255, 255, 0.1)"
   */
  "--titlebar-border"?: string;

  /**
   * Customize the text color of the title bar.
   * @default "rgba(255, 255, 255, 0.6)"
   */
  "--titlebar-color"?: string;

  /**
   * Customize the font family of the title bar.
   * @default "system-ui, -apple-system, sans-serif"
   */
  "--titlebar-font-family"?: string;

  /**
   * Customize the font size of the title bar.
   * @default "0.8125em"
   */
  "--titlebar-font-size"?: string;

  /**
   * Customize the gap between the macOS traffic-light dots.
   * @default "0.5em"
   */
  "--dot-gap"?: string;

  /**
   * Customize the diameter of the macOS traffic-light dots.
   * @default "0.75em"
   */
  "--dot-size"?: string;

  /**
   * Customize the color of the "close" traffic-light dot.
   * @default "#ff5f56"
   */
  "--dot-close"?: string;

  /**
   * Customize the color of the "minimize" traffic-light dot.
   * @default "#ffbd2e"
   */
  "--dot-minimize"?: string;

  /**
   * Customize the color of the "maximize" traffic-light dot.
   * @default "#27c93f"
   */
  "--dot-maximize"?: string;

  /**
   * Customize the font family of the terminal prompt.
   * @default "ui-monospace, monospace"
   */
  "--prompt-font-family"?: string;

  /**
   * Customize the font weight of the terminal prompt.
   * @default 700
   */
  "--prompt-font-weight"?: string | number;

  /**
   * Customize the color of the terminal prompt.
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
