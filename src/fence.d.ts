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
