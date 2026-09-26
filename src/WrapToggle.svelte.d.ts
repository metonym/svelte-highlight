import type { SvelteComponentTyped } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

export type WrapToggleProps = HTMLButtonAttributes & {
  /**
   * Whether wrapping is enabled. Bindable.
   * @default false
   */
  wrap?: boolean;

  /**
   * Unpressed `aria-label` and default slot fallback text.
   * @default "Wrap"
   */
  text?: string;

  /**
   * Pressed `aria-label`. The default slot fallback text stays `text`
   * regardless of state.
   * @default "Wrapped"
   */
  pressedText?: string;

  /**
   * Gap between the button's content.
   * @default "0.4em"
   */
  "--wrap-toggle-gap"?: string;

  /**
   * Button padding.
   * @default "0.5em 0.75em"
   */
  "--wrap-toggle-padding"?: string;

  /**
   * Button background.
   * @default "inherit"
   */
  "--wrap-toggle-background"?: string;

  /**
   * Button color.
   * @default "inherit"
   */
  "--wrap-toggle-color"?: string;

  /**
   * Button border radius.
   * @default "4px"
   */
  "--wrap-toggle-border-radius"?: string;

  /**
   * Button border.
   * @default "none"
   */
  "--wrap-toggle-border"?: string;

  /**
   * Button font size.
   * @default "inherit"
   */
  "--wrap-toggle-font-size"?: string;
};

export type WrapToggleEvents = {};

export type WrapToggleSlots = {
  default: {
    /**
     * Current wrap state.
     */
    wrap: boolean;
  };
};

export default class WrapToggle extends SvelteComponentTyped<
  WrapToggleProps,
  WrapToggleEvents,
  WrapToggleSlots
> {}
