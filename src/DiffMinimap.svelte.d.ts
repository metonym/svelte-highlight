import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { DiffController } from "./diff-controller";

export type DiffMinimapProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * A controller from `createDiffController`. Shows one mark per change
   * and the visible area of every `DiffView` on it. Click to jump.
   */
  diff: DiffController;
};

export default class DiffMinimap extends SvelteComponentTyped<
  DiffMinimapProps,
  Record<string, never>,
  Record<string, never>
> {}
