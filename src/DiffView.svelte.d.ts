import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { Row } from "./diff";
import type { Annotation, DiffController } from "./diff-controller";

export type DiffViewProps = HTMLAttributes<HTMLDivElement> & {
  /** A controller from `createDiffController`. */
  diff: DiffController;

  /**
   * While streaming, keep the newest row in view until the reader scrolls.
   * @default true
   */
  follow?: boolean;

  /**
   * Show accept/reject buttons on each change. Filling the `actions` slot
   * shows it without this.
   * @default false
   */
  review?: boolean;

  /**
   * Wrap long lines instead of scrolling each side sideways. Rows are
   * measured, so wrapped rows keep virtualization.
   * @default false
   */
  wrap?: boolean;

  /** @default "default" */
  palette?: "default" | "colorblind";

  /**
   * Extra rows rendered above and below the viewport.
   * @default 10
   */
  overscan?: number;

  /**
   * Handle n/p (next/previous change), e/c (expand/collapse), v (view),
   * and a/r/u (accept/reject/undo, with `review`) while focused.
   * @default true
   */
  keyboard?: boolean;
};

export type DiffViewSlots = {
  /** Replaces a fold row. */
  fold: {
    fold: NonNullable<Row["fold"]>;
    count: number | undefined;
    toggle: () => void;
  };
  /** Replaces an annotation card. The row grows to fit it. */
  note: { note: Annotation };
  /** Controls shown on the first row of each change. */
  actions: {
    change: number;
    decision: "accepted" | "rejected" | undefined;
    decide: (decision: "accepted" | "rejected" | undefined) => void;
  };
};

export default class DiffView extends SvelteComponentTyped<
  DiffViewProps,
  Record<string, never>,
  DiffViewSlots
> {}
