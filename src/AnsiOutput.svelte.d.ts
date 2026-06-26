import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type AnsiOutputProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Specify the terminal output to render. May contain ANSI SGR escape codes.
   */
  text: string;

  /**
   * Keep spans with a background readable by flipping the foreground to black or
   * white when it wouldn't read on that background (e.g. white text on a white
   * background). Only spans that set a background are adjusted.
   * @default true
   */
  autoContrast?: boolean;

  /**
   * Customize the padding of the output block.
   * @default "1em"
   */
  "--ansi-padding"?: string;

  /**
   * Customize the background color of the output block.
   * @default "#1e1e1e"
   */
  "--ansi-background"?: string;

  /**
   * Customize the default (un-colored) text color.
   * @default "#d4d4d4"
   */
  "--ansi-foreground"?: string;

  /**
   * Customize the monospace font family.
   * @default "ui-monospace, SFMono-Regular, Menlo, monospace"
   */
  "--ansi-font-family"?: string;

  /**
   * Customize the font size.
   * @default "0.875em"
   */
  "--ansi-font-size"?: string;

  /**
   * Customize the line height.
   * @default 1.5
   */
  "--ansi-line-height"?: string | number;

  /**
   * Customize the tab size.
   * @default 4
   */
  "--ansi-tab-size"?: string | number;

  /**
   * Customize the font weight applied to bold text.
   * @default 700
   */
  "--ansi-bold-weight"?: string | number;

  /**
   * Customize the opacity applied to dim text.
   * @default 0.5
   */
  "--ansi-dim-opacity"?: string | number;

  /** Customize the standard black color. @default "#000000" */
  "--ansi-black"?: string;
  /** Customize the standard red color. @default "#cd0000" */
  "--ansi-red"?: string;
  /** Customize the standard green color. @default "#00cd00" */
  "--ansi-green"?: string;
  /** Customize the standard yellow color. @default "#cdcd00" */
  "--ansi-yellow"?: string;
  /** Customize the standard blue color. @default "#0000ee" */
  "--ansi-blue"?: string;
  /** Customize the standard magenta color. @default "#cd00cd" */
  "--ansi-magenta"?: string;
  /** Customize the standard cyan color. @default "#00cdcd" */
  "--ansi-cyan"?: string;
  /** Customize the standard white color. @default "#e5e5e5" */
  "--ansi-white"?: string;
  /** Customize the bright black color. @default "#7f7f7f" */
  "--ansi-bright-black"?: string;
  /** Customize the bright red color. @default "#ff0000" */
  "--ansi-bright-red"?: string;
  /** Customize the bright green color. @default "#00ff00" */
  "--ansi-bright-green"?: string;
  /** Customize the bright yellow color. @default "#ffff00" */
  "--ansi-bright-yellow"?: string;
  /** Customize the bright blue color. @default "#5c5cff" */
  "--ansi-bright-blue"?: string;
  /** Customize the bright magenta color. @default "#ff00ff" */
  "--ansi-bright-magenta"?: string;
  /** Customize the bright cyan color. @default "#00ffff" */
  "--ansi-bright-cyan"?: string;
  /** Customize the bright white color. @default "#ffffff" */
  "--ansi-bright-white"?: string;
};

export type AnsiOutputEvents = {};

export type AnsiOutputSlots = {};

export default class AnsiOutput extends SvelteComponentTyped<
  AnsiOutputProps,
  AnsiOutputEvents,
  AnsiOutputSlots
> {}
