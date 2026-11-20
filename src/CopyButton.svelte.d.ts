import type { SvelteComponentTyped } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

export type CopyButtonProps = HTMLButtonAttributes & {
  /** Text to copy. */
  code: string;

  /**
   * Copy handler.
   * @default (code) => navigator.clipboard.writeText(code)
   */
  copy?: (code: string) => void | Promise<void>;

  /**
   * Transform `code` before `copy`; the result is reported in `on:copy`.
   * @default (code) => code
   */
  transform?: (code: string) => string;

  /** How long the "copied" state lasts (ms). @default 2000 */
  timeout?: number;

  /** Button `aria-label`. @default "Copy" */
  text?: string;

  /**
   * Button `aria-label` while copied. Also announced to screen readers.
   * @default "Copied!"
   */
  copiedText?: string;

  /** Announced to screen readers when the copy fails. @default "Copy failed" */
  errorText?: string;

  /**
   * Overlay the container (`true`) or sit in normal flow (`false`).
   * Defaults to `false` inside `CodeToolbar`.
   * @default true
   */
  absolute?: boolean;

  /** Top offset. @default "0.5em" */
  "--copy-top"?: string;

  /** Right offset. @default "0.5em" */
  "--copy-right"?: string;

  /** Button size. @default "2em" */
  "--copy-size"?: string;

  /** Button padding. @default "0.5em" */
  "--copy-padding"?: string;

  /** Button background. @default "inherit" */
  "--copy-background"?: string;

  /** Button background on hover inside `CodeToolbar`. @default "color-mix(in srgb, currentColor 12%, transparent)" */
  "--copy-hover-background"?: string;

  /** Button color. @default "inherit" */
  "--copy-color"?: string;

  /** Button border radius. @default "4px" */
  "--copy-border-radius"?: string;

  /** Button border. @default "none" */
  "--copy-border"?: string;

  /** Button z-index. @default 2 */
  "--copy-z-index"?: string | number;
};

export type CopyButtonEvents = {
  copy: CustomEvent<{
    /** The code that was copied, after `transform` is applied. */
    code: string;
  }>;
  error: CustomEvent<{
    /** The error thrown by the copy behavior. */
    error: unknown;
  }>;

  /** Useful for prefetching an async copy on hover. */
  mouseenter: MouseEvent;

  /** Forwarded from the `button` element. */
  mouseleave: MouseEvent;
};

export type CopyButtonSlots = {
  default: {
    /** `true` while the "copied" state is active. */
    copied: boolean;

    /** `true` while async `copy` is in flight. */
    copying: boolean;
  };
};

export default class CopyButton extends SvelteComponentTyped<
  CopyButtonProps,
  CopyButtonEvents,
  CopyButtonSlots
> {}
