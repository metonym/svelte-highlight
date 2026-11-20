import type { SvelteComponentTyped } from "svelte";
import type { ToolbarButtonProps } from "./ToolbarButton.svelte";

export type WrapToggleProps = Omit<
  ToolbarButtonProps,
  "label" | "pressed" | "href"
> & {
  /**
   * Whether wrapping is enabled. Bindable.
   * @default false
   */
  wrap?: boolean;

  /**
   * `aria-label` and `title`. The default slot shows a wrap icon. The
   * label stays the same when pressed; `aria-pressed` carries the state.
   * @default "Wrap"
   */
  text?: string;

  /* Style it with the `--toolbar-button-*` variables of `ToolbarButton`. */
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
