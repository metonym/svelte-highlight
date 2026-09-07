export interface ParsedMeta {
  /** 1-indexed line number -> the last-applied state for that line. */
  lines: Record<number, "mark" | "ins" | "del">;
  title?: string;
  showLineNumbers?: boolean;
}

/**
 * Parses the Expressive Code / Shiki-style meta-string vocabulary from a
 * Markdown/MDX code fence's info-string suffix, e.g. for
 * ` ```ts title="app.ts" {1,3-5} ins={7} showLineNumbers `, `meta` is
 * `title="app.ts" {1,3-5} ins={7} showLineNumbers`.
 *
 * Recognizes a bare `{<ranges>}` (state `"mark"`), `mark=`/`ins=`/`del=`
 * (each combinable), `title="<text>"`, and the bare `showLineNumbers` flag.
 * A line number named by more than one directive resolves to whichever
 * directive appears later in the string. Unknown tokens are ignored.
 */
export declare function parseMeta(meta: string): ParsedMeta;

/**
 * Resolves a Markdown fence info string's language word (or a bare grammar
 * name) to its canonical grammar name, e.g. `"ts"` or `"TypeScript"` ->
 * `"typescript"`. Trims, lowercases, and takes only the first
 * whitespace-delimited word, so passing a full info string like
 * `"ts title=\"app.ts\""` works. Returns `undefined` when the word doesn't
 * match a shipped grammar name or alias.
 */
export declare function resolveLanguageName(name: string): string | undefined;

/**
 * Highlights a single Markdown/MDX code fence into hljs-compatible HTML,
 * for use from framework adapters (mdsvex, markdown-it, rehype, ...) that
 * process fences outside the Svelte compiler.
 *
 * Renders each source line as `<span class="line">`, decorated with
 * `data-line-state="mark" | "ins" | "del"` per `meta`'s directives (see
 * `parseMeta`), wrapped in a `<pre class="hljs" data-language="...">` that
 * carries `data-title`/`data-show-line-numbers` when `meta` sets them.
 *
 * `lang` accepts either the grammar's canonical file name (e.g.
 * `"typescript"`) or a known alias (e.g. `"ts"`) - resolved internally via
 * `resolveLanguageName`. Rejects with `LanguageLoadError`
 * (`Unknown language: "<lang>"`) when neither resolves to a shipped
 * grammar.
 */
export declare function highlightFence(options: {
  code: string;
  lang: string;
  meta?: string;
}): Promise<string>;

export interface TextSegment {
  id: number;
  kind: "text";
  text: string;
  start: number;
  end: number;
}

export interface FenceSegment {
  id: number;
  kind: "fence";
  /** `resolveLanguageName` of the info string's first word; `undefined` when absent or unrecognized. */
  lang: string | undefined;
  /** The fence's raw info string (trimmed), e.g. `ts title="app.ts" {1,3}`. */
  info: string;
  /** `parseMeta` of everything in `info` after its first word. */
  meta: ParsedMeta;
  /** Fence content with the opening fence's indentation stripped per line, no trailing newline. */
  code: string;
  /** `true` while the fence has not yet seen a closing fence line. */
  open: boolean;
  start: number;
  end: number;
}

export type MarkdownSegment = TextSegment | FenceSegment;

/**
 * Headless, streaming CommonMark fence splitter: turns a growing Markdown
 * string into prose (`text`) and fenced-code (`fence`) segments with stable,
 * increasing `id`s, so each fence can drive its own highlighter and survive
 * both `append` and a regenerated buffer via `set` without losing identity.
 */
export interface FenceSplitter {
  /**
   * Appends `chunk` to the buffer. O(chunk): only rescans from the start of
   * the last segment, which by construction is the only one that can
   * change. Only the last segment object may be replaced; every earlier
   * segment object keeps its identity, so a keyed `{#each}` never re-mounts
   * them.
   */
  append(chunk: string): void;
  /**
   * Replaces the whole buffer with `text`. Segments before the first point
   * of divergence from the previous text keep their id and object identity.
   * The first rebuilt segment reuses its old id when its `kind` and (for a
   * fence) `info` are unchanged, so a regenerated fence keeps driving the
   * same highlighter instance. A no-op when `text` equals the current text.
   */
  set(text: string): void;
  /** The current segments. Same array identity until the next mutation. */
  segments(): readonly MarkdownSegment[];
  /** The full buffer text, as last passed to `append`/`set`. */
  text(): string;
  /** Clears the buffer and restarts ids at 1. */
  reset(): void;
}

/** Creates an empty {@link FenceSplitter}. */
export declare function createFenceSplitter(): FenceSplitter;
