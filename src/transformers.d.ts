import type { ScopeEvent } from "./engine.d.ts";

export type EventTransform = (events: ScopeEvent[]) => ScopeEvent[];

/** Run `events` through each of `fns` in order. */
export function transformEvents(
  events: ScopeEvent[],
  fns: EventTransform[],
): ScopeEvent[];

/**
 * Wrap every match of `pattern` (within single `TEXT` events) in `scope`
 * (default `"mark"`). Throws if `pattern` lacks the `g` flag.
 */
export function markPattern(pattern: RegExp, scope?: string): EventTransform;

/** Mark tabs and/or trailing whitespace. */
export function markWhitespace(options?: {
  tabs?: boolean;
  trailingSpace?: boolean;
  tabScope?: string;
  trailingScope?: string;
}): EventTransform;

/**
 * Wrap each 1-indexed line in `lines` in its scope (`"mark" | "ins" |
 * "del"`). Scopes spanning the line boundary are resumed inside the wrapper.
 */
export function markLines(
  lines: Record<number, "mark" | "ins" | "del">,
): EventTransform;
