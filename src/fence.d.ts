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
 * `lang` must be the grammar's canonical file name (e.g. `"typescript"`,
 * not `"ts"`) - alias resolution is the caller's job. Rejects with
 * `LanguageLoadError` (`Unknown language: "<lang>"`) when `lang` doesn't
 * resolve to a shipped grammar.
 */
export declare function highlightFence(options: {
  code: string;
  lang: string;
  meta?: string;
}): Promise<string>;
