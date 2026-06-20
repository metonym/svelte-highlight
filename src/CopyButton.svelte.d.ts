import type { SvelteComponentTyped } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

export type CopyButtonProps = HTMLButtonAttributes & {
  /**
   * Specify the text to copy to the clipboard.
   */
  code: string;

  /**
   * Override the copy behavior. Receives the `code` to copy and may
   * return a promise. When omitted, the native Clipboard API is used.
   * @default (code) => navigator.clipboard.writeText(code)
   */
  copy?: (code: string) => void | Promise<void>;

  /**
   * Set the duration in milliseconds to show the
   * "copied" state before reverting.
   * @default 2000
   */
  timeout?: number;

  /**
   * Specify the accessible label (`aria-label`) for the button.
   * Used as the fallback text only if the default icon slot is overridden.
   * @default "Copy"
   */
  text?: string;

  /**
   * Specify the accessible label (`aria-label`) shown after a successful copy.
   * Used as the fallback text only if the default icon slot is overridden.
   * @default "Copied!"
   */
  copiedText?: string;

  /**
   * Customize the top offset of the button.
   * @default "0.5em"
   */
  "--copy-top"?: string;

  /**
   * Customize the right offset of the button.
   * @default "0.5em"
   */
  "--copy-right"?: string;

  /**
   * Customize the width and height of the button.
   * @default "2em"
   */
  "--copy-size"?: string;

  /**
   * Customize the inner padding of the button.
   * @default "0.5em"
   */
  "--copy-padding"?: string;

  /**
   * Customize the background color of the button.
   * @default "inherit"
   */
  "--copy-background"?: string;

  /**
   * Customize the foreground color of the button.
   * @default "inherit"
   */
  "--copy-color"?: string;

  /**
   * Customize the border radius of the button.
   * @default "4px"
   */
  "--copy-border-radius"?: string;

  /**
   * Customize the border of the button.
   * @default "none"
   */
  "--copy-border"?: string;

  /**
   * Customize the stacking order of the button.
   * @default 2
   */
  "--copy-z-index"?: string | number;
};

export type CopyButtonEvents = {
  copy: CustomEvent<{
    /**
     * The code that was copied.
     */
    code: string;
  }>;
  error: CustomEvent<{
    /**
     * The error thrown by the copy behavior.
     */
    error: unknown;
  }>;

  /**
   * Forwarded from the `button` element. Useful for prefetching
   * an async copy on hover.
   */
  mouseenter: MouseEvent;

  /**
   * Forwarded from the `button` element.
   */
  mouseleave: MouseEvent;
};

export type CopyButtonSlots = {
  default: {
    /**
     * `true` while the "copied" state is active.
     */
    copied: boolean;

    /**
     * `true` while an async `copy` is in flight (before it resolves).
     * Useful for rendering a pending state for slow copy functions.
     */
    copying: boolean;
  };
};

export default class CopyButton extends SvelteComponentTyped<
  CopyButtonProps,
  CopyButtonEvents,
  CopyButtonSlots
> {}
