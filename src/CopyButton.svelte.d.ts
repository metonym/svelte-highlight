import type { SvelteComponentTyped } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

export type CopyButtonProps = HTMLButtonAttributes & {
  /**
   * Text to copy.
   */
  code: string;

  /**
   * Copy handler. Defaults to `navigator.clipboard.writeText`.
   * @default (code) => navigator.clipboard.writeText(code)
   */
  copy?: (code: string) => void | Promise<void>;

  /**
   * How long the "copied" state lasts (ms).
   * @default 2000
   */
  timeout?: number;

  /**
   * Copy button `aria-label`.
   * Used as the fallback text only if the default icon slot is overridden.
   * @default "Copy"
   */
  text?: string;

  /**
   * Copied state `aria-label`.
   * Used as the fallback text only if the default icon slot is overridden.
   * @default "Copied!"
   */
  copiedText?: string;

  /**
   * Top offset.
   * @default "0.5em"
   */
  "--copy-top"?: string;

  /**
   * Right offset.
   * @default "0.5em"
   */
  "--copy-right"?: string;

  /**
   * Button size.
   * @default "2em"
   */
  "--copy-size"?: string;

  /**
   * Button padding.
   * @default "0.5em"
   */
  "--copy-padding"?: string;

  /**
   * Button background.
   * @default "inherit"
   */
  "--copy-background"?: string;

  /**
   * Button color.
   * @default "inherit"
   */
  "--copy-color"?: string;

  /**
   * Button border radius.
   * @default "4px"
   */
  "--copy-border-radius"?: string;

  /**
   * Button border.
   * @default "none"
   */
  "--copy-border"?: string;

  /**
   * Button z-index.
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
   * Useful for prefetching an async copy on hover.
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
     * `true` while async `copy` is in flight.
     */
    copying: boolean;
  };
};

export default class CopyButton extends SvelteComponentTyped<
  CopyButtonProps,
  CopyButtonEvents,
  CopyButtonSlots
> {}
