import type { LanguageType } from "./languages";

/**
 * A shared substrate for windowed rendering: text plus an engine checkpoint
 * every `checkpointInterval` lines, producing highlighted HTML for any line
 * range in O(range + interval) instead of O(document). See
 * `createTokenizedDocument`'s doc comment for the fidelity caveat and the
 * no-mid-document-edit scope.
 */
export interface TokenizedDocument {
  /** Replace the document. Cheap; tokenization is lazy. */
  setCode(code: string): void;
  /** Append to the document (streaming). Must be equivalent to setCode(old + chunk) but incremental. */
  append(chunk: string): void;
  /** Total line count (string scan; never triggers tokenization). */
  lineCount(): number;
  /** Highlighted HTML per line for [start, end) — same line HTML extendLines produces. Tokenizes lazily. */
  lineRange(start: number, end: number): string[];
  /** Lines tokenized so far (monotonically grows; for tests/introspection). */
  tokenizedThrough(): number;
}

export function createTokenizedDocument(options: {
  language: LanguageType<string>;
  /** Lines between engine checkpoints. @default 100 */
  checkpointInterval?: number;
  /** Forwarded to extendLines/renderHtml. @default "hljs-" */
  classPrefix?: string;
}): TokenizedDocument;
