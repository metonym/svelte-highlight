import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { FenceSegment, MarkdownSegment } from "./fence";
import type { LanguageType } from "./languages";

export type MarkdownStreamProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Growing Markdown buffer. A value that doesn't extend the previous one
   * (e.g. a regenerated reply) replaces it.
   * @default ""
   */
  text?: string;

  /**
   * Stream finished; a trailing unclosed fence is treated as closed.
   * @default false
   */
  done?: boolean;

  /**
   * Resolves a fence's language, cached per name. Plaintext is used while
   * loading and when it returns `undefined` or rejects.
   * @default resolves via `loadLanguage`, falling back to plaintext
   */
  resolveLanguage?: (
    lang: string | undefined,
    segment: FenceSegment,
  ) => LanguageType<string> | Promise<LanguageType<string>> | undefined;

  /**
   * Show a blinking caret in the open fence while streaming.
   * @default true
   */
  caret?: boolean;

  /**
   * Keep streaming fences scrolled to the bottom unless the user scrolls away.
   * @default true
   */
  autoScroll?: boolean;

  /**
   * Screen-reader announcement (once, by the last fence) when `done`
   * becomes `true`. `""` disables it.
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
  /** Fires once per fence, when it first appears. */
  fence: CustomEvent<{
    id: number;
    lang: string | undefined;
  }>;

  /** Fires once when `done` becomes `true`. */
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
