import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type AnsiOutputProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Terminal output, including ANSI SGR codes.
   */
  text: string;

  /**
   * Flip foreground to black/white when contrast on a background is too low.
   * @default true
   */
  autoContrast?: boolean;

  /**
   * Accessible name for the scrollable output region.
   * @default "Terminal output"
   */
  label?: string;

  /**
   * Output block padding.
   * @default "1em"
   */
  "--ansi-padding"?: string;

  /**
   * Output block background.
   * @default "#1e1e1e"
   */
  "--ansi-background"?: string;

  /**
   * Default text color.
   * @default "#d4d4d4"
   */
  "--ansi-foreground"?: string;

  /**
   * Monospace font family.
   * @default "ui-monospace, SFMono-Regular, Menlo, monospace"
   */
  "--ansi-font-family"?: string;

  /**
   * Font size.
   * @default "0.875em"
   */
  "--ansi-font-size"?: string;

  /**
   * Line height.
   * @default 1.5
   */
  "--ansi-line-height"?: string | number;

  /**
   * Tab size.
   * @default 4
   */
  "--ansi-tab-size"?: string | number;

  /**
   * Bold font weight.
   * @default 700
   */
  "--ansi-bold-weight"?: string | number;

  /**
   * Dim opacity.
   * @default 0.5
   */
  "--ansi-dim-opacity"?: string | number;

  /** Standard black. @default "#000000" */
  "--ansi-black"?: string;
  /** Standard red. @default "#cd0000" */
  "--ansi-red"?: string;
  /** Standard green. @default "#00cd00" */
  "--ansi-green"?: string;
  /** Standard yellow. @default "#cdcd00" */
  "--ansi-yellow"?: string;
  /** Standard blue. @default "#0000ee" */
  "--ansi-blue"?: string;
  /** Standard magenta. @default "#cd00cd" */
  "--ansi-magenta"?: string;
  /** Standard cyan. @default "#00cdcd" */
  "--ansi-cyan"?: string;
  /** Standard white. @default "#e5e5e5" */
  "--ansi-white"?: string;
  /** Bright black. @default "#7f7f7f" */
  "--ansi-bright-black"?: string;
  /** Bright red. @default "#ff0000" */
  "--ansi-bright-red"?: string;
  /** Bright green. @default "#00ff00" */
  "--ansi-bright-green"?: string;
  /** Bright yellow. @default "#ffff00" */
  "--ansi-bright-yellow"?: string;
  /** Bright blue. @default "#5c5cff" */
  "--ansi-bright-blue"?: string;
  /** Bright magenta. @default "#ff00ff" */
  "--ansi-bright-magenta"?: string;
  /** Bright cyan. @default "#00ffff" */
  "--ansi-bright-cyan"?: string;
  /** Bright white. @default "#ffffff" */
  "--ansi-bright-white"?: string;
};

export type AnsiOutputEvents = {};

export type AnsiOutputSlots = {};

export default class AnsiOutput extends SvelteComponentTyped<
  AnsiOutputProps,
  AnsiOutputEvents,
  AnsiOutputSlots
> {}
