import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { FenceSegment, MarkdownSegment } from "./fence";
import type { LanguageType } from "./languages";

export type MarkdownStreamProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Growing Markdown buffer. On change, `splitter.append` is used when the
   * new value starts with the previous one; otherwise the whole buffer is
   * replaced via `splitter.set` (a regenerated reply, say).
   * @default ""
   */
  text?: string;

  /**
   * Stream finished. Forwarded to every fence's `HighlightStream` as
   * `done || !segment.open`, so a trailing open fence is treated as closed
   * once the overall stream ends.
   * @default false
   */
  done?: boolean;

  /**
   * Resolves a fence's language. The default dynamically imports the
   * grammar via `loadLanguage`, falling back to plaintext while loading and
   * whenever `lang` is `undefined`, unrecognized, or the returned promise
   * rejects -- it never throws. Results are cached per canonical name for
   * the component's lifetime.
   * @default resolves via `loadLanguage`, falling back to plaintext
   */
  resolveLanguage?: (
    lang: string | undefined,
    segment: FenceSegment,
  ) => LanguageType<string> | Promise<LanguageType<string>> | undefined;

  /**
   * Show a blinking caret at the end of the last open fence while streaming.
   * @default true
   */
  caret?: boolean;

  /**
   * Keep each streaming fence scrolled to the bottom, unless the user has
   * scrolled away from it.
   * @default true
   */
  autoScroll?: boolean;

  /**
   * Announced by the last fence's visually-hidden live region once `done`
   * becomes `true` -- every other fence gets `""` so completion is
   * announced only once. Set to `""` to disable the announcement.
   * @default "Code finished streaming"
   */
  doneText?: string;

  /**
   * Space between prose and fence segments.
   * @default "1em"
   */
  "--md-gap"?: string;

  /**
   * `white-space` of the default prose block.
   * @default "pre-wrap"
   */
  "--md-text-white-space"?: string;
};

export type MarkdownStreamEvents = {
  /**
   * Fires once, the first time a fence segment appears.
   */
  fence: CustomEvent<{
    id: number;
    lang: string | undefined;
  }>;

  /**
   * Fires once when `done` becomes `true`.
   */
  done: CustomEvent<null>;
};

export type MarkdownStreamSlots = {
  text: {
    segment: MarkdownSegment & { kind: "text" };
  };
  fence: {
    segment: FenceSegment;
    /** The resolved language, or plaintext while loading/unknown. */
    language: LanguageType<string>;
  };
};

export default class MarkdownStream extends SvelteComponentTyped<
  MarkdownStreamProps,
  MarkdownStreamEvents,
  MarkdownStreamSlots
> {}
