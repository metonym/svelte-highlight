export interface ParsedMeta {
  /** 1-indexed line number -> state (last directive wins). */
  lines: Record<number, "mark" | "ins" | "del">;
  title?: string;
  showLineNumbers?: boolean;
}

/**
 * Parses an Expressive Code / Shiki-style fence meta string, e.g.
 * `title="app.ts" {1,3-5} ins={7} showLineNumbers`. Supports `{ranges}`
 * (mark), `mark=`/`ins=`/`del=`, `title=`, and `showLineNumbers`; ignores the rest.
 */
export declare function parseMeta(meta: string): ParsedMeta;

/**
 * Resolves a fence info string's first word to a canonical grammar name
 * (`"ts"` -> `"typescript"`, case-insensitive), or `undefined` if unknown.
 */
export declare function resolveLanguageName(name: string): string | undefined;

/**
 * Highlights one Markdown code fence to hljs-compatible HTML (for mdsvex,
 * markdown-it, rehype, ...): `<span class="line">` per line with
 * `data-line-state` from `meta`, inside `<pre class="hljs">`. `lang` may be a
 * grammar name or alias; rejects with `LanguageLoadError` if unknown.
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
 * Streaming CommonMark fence splitter: splits growing Markdown into `text`
 * and `fence` segments with stable `id`s across `append` and `set`.
 */
export interface FenceSplitter {
  /**
   * Appends `chunk` in O(chunk). Only the last segment object may be
   * replaced; earlier ones keep their identity.
   */
  append(chunk: string): void;
  /**
   * Replaces the buffer. Segments before the first divergence keep their
   * identity; the first rebuilt one keeps its id if `kind` and `info` match.
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
