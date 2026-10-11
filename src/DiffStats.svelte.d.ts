import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { DiffController } from "./diff-controller";

export type DiffStatsProps = HTMLAttributes<HTMLSpanElement> & {
  /**
   * A controller from `createDiffController`. Shows +additions,
   * −deletions, the change count, and the position after navigating.
   */
  diff: DiffController;
};

export default class DiffStats extends SvelteComponentTyped<
  DiffStatsProps,
  Record<string, never>,
  Record<string, never>
> {}
