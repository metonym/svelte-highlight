import type { SvelteComponentTyped } from "svelte";
import type {
  HTMLAnchorAttributes,
  HTMLButtonAttributes,
} from "svelte/elements";

export type ToolbarButtonProps = Omit<HTMLButtonAttributes, "type"> &
  Pick<HTMLAnchorAttributes, "target" | "rel" | "download"> & {
    /**
     * Accessible name (`aria-label`) and tooltip (`title`).
     */
    label: string;

    /**
     * Set it to make a toggle button. Sets `aria-pressed` and the
     * pressed style. Leave it unset for a plain action.
     * @default undefined
     */
    pressed?: boolean;

    /**
     * Renders an `<a>` with this `href` instead of a `<button>`.
     * @default undefined
     */
    href?: string;

    /**
     * Width and height of the button.
     * @default "2em"
     */
    "--toolbar-button-size"?: string;

    /**
     * Gap between the button's content.
     * @default "0.4em"
     */
    "--toolbar-button-gap"?: string;

    /**
     * Button padding.
     * @default "0.3em"
     */
    "--toolbar-button-padding"?: string;

    /**
     * Button background.
     * @default "transparent"
     */
    "--toolbar-button-background"?: string;

    /**
     * Icon and text color.
     * @default "color-mix(in srgb, currentColor 72%, transparent)"
     */
    "--toolbar-button-color"?: string;

    /**
     * Button background on hover.
     * @default "color-mix(in srgb, currentColor 12%, transparent)"
     */
    "--toolbar-button-hover-background"?: string;

    /**
     * Button background when pressed or active.
     * @default "color-mix(in srgb, currentColor 18%, transparent)"
     */
    "--toolbar-button-pressed-background"?: string;

    /**
     * Button border radius.
     * @default "6px"
     */
    "--toolbar-button-border-radius"?: string;

    /**
     * Button border.
     * @default "none"
     */
    "--toolbar-button-border"?: string;

    /**
     * Button font size.
     * @default "inherit"
     */
    "--toolbar-button-font-size"?: string;
  };

export type ToolbarButtonEvents = {
  click: WindowEventMap["click"];
};

export type ToolbarButtonSlots = {
  /** The icon or text inside the button. */
  default: Record<string, never>;
};

/**
 * An icon button styled to match `CodeToolbar`. Use it for custom
 * actions such as a download or a link to a playground. `WrapToggle`
 * is built on it.
 */
export default class ToolbarButton extends SvelteComponentTyped<
  ToolbarButtonProps,
  ToolbarButtonEvents,
  ToolbarButtonSlots
> {}
