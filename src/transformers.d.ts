import type { ScopeEvent } from "./engine.d.ts";

export type EventTransform = (events: ScopeEvent[]) => ScopeEvent[];

/**
 * Runs `events` through each of `fns` in order, threading each transform's
 * output into the next. `transformEvents(events, [])` is a no-op.
 */
export function transformEvents(
  events: ScopeEvent[],
  fns: EventTransform[],
): ScopeEvent[];

/**
 * Wraps every match of `pattern` in its own `OPEN`/`CLOSE` pair of `scope`
 * (default `"mark"`). Only rewrites the interior of individual `TEXT`
 * leaves, so it can't unbalance existing `OPEN`/`CLOSE` nesting. Throws if
 * `pattern` doesn't have the `g` flag.
 */
export function markPattern(pattern: RegExp, scope?: string): EventTransform;

/**
 * Marks tabs and/or trailing whitespace. Composed entirely from
 * `markPattern` via `transformEvents` - no new matching logic.
 */
export function markWhitespace(options?: {
  tabs?: boolean;
  trailingSpace?: boolean;
  tabScope?: string;
  trailingScope?: string;
}): EventTransform;

/**
 * Wraps each 1-indexed line named in `lines` in an `OPEN`/`CLOSE` pair of
 * its literal scope (`"mark" | "ins" | "del"`, matching `ParsedMeta.lines`
 * in `fence.d.ts`, so `renderHtml` needs no changes to render it). A scope
 * already open when the line starts, or still open past its end, is
 * resumed inside the wrapper - the same "resume" trick `extendLines` uses
 * for per-line HTML, applied here to the raw event stream. Lines absent
 * from `lines` pass through unwrapped; `markLines({})` is a no-op.
 */
export function markLines(
  lines: Record<number, "mark" | "ins" | "del">,
): EventTransform;
