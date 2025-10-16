import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CopyButtonProps = HTMLAttributes<HTMLButtonElement> & {
  /**
   * The code content to copy to clipboard.
   */
  code?: string;

  /**
   * Custom function to handle copying. If provided, this completely replaces
   * the default clipboard API. Should return true for success, false for failure.
   */
  copyFn?: ((text: string) => Promise<boolean> | boolean) | undefined;

  /**
   * Text to display when the button is in the default state.
   * @default "Copy"
   */
  copyText?: string;

  /**
   * Text to display when the button is in the copied state.
   * @default "Copied!"
   */
  copiedText?: string;

  /**
   * Time in milliseconds before resetting the copied state.
   * @default 2000
   */
  copyTimeout?: number;
};

export type CopyButtonEvents = {
  copy: CustomEvent<{
    /**
     * Whether the copy operation was successful.
     */
    success: boolean;

    /**
     * The text that was copied.
     */
    text: string;
  }>;
};

export type CopyButtonSlots = {
  default: {
    /**
     * Whether the button is currently in the copied state.
     */
    isCopied: boolean;
  };
};

export default class CopyButton extends SvelteComponentTyped<
  CopyButtonProps,
  CopyButtonEvents,
  CopyButtonSlots
> {}
