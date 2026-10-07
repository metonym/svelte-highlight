import type { LanguageType } from "./languages";

/**
 * Text plus an engine checkpoint every `checkpointInterval` lines, producing
 * highlighted HTML for any line range in O(range + interval).
 */
export interface TokenizedDocument {
  /** Replace the document. Cheap; tokenization is lazy. */
  setCode(code: string): void;
  /** Append to the document; equivalent to `setCode(old + chunk)`. */
  append(chunk: string): void;
  /** Total line count (string scan; never triggers tokenization). */
  lineCount(): number;
  /** Highlighted HTML per line for [start, end). Tokenizes lazily. */
  lineRange(start: number, end: number): string[];
  /** Plain source text per line for [start, end), without the `"\n"`. Never triggers tokenization. */
  textRange(start: number, end: number): string[];
  /** Lines tokenized so far (monotonic). */
  tokenizedThrough(): number;
  /**
   * Tokenize through `line` without rendering, so a later `lineRange` there is
   * cheap. Returns true once the whole document has been fed.
   */
  tokenizeThrough(line: number): boolean;
  /** Retained engine checkpoints (one per `checkpointInterval` tokenized lines, never evicted). */
  checkpointCount(): number;
}

export function createTokenizedDocument(options: {
  language: LanguageType<string>;
  /** Lines between engine checkpoints. @default 100 */
  checkpointInterval?: number;
  /** Forwarded to extendLines/renderHtml. @default "hljs-" */
  classPrefix?: string;
}): TokenizedDocument;
