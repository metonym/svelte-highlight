/**
 * All exports are semver-stable except `GrammarIR`/`GrammarState` (generated
 * data) and `Snapshot` (stable within one version only).
 *
 * A `ScopeEvent[]` stream is balanced (`OPEN`/`CLOSE` properly nested) and its
 * `TEXT` values concatenate to the tokenized source.
 */

/**
 * Generated grammar IR (plain JSON). Treat as opaque: its structure may change
 * in any minor release, so use grammars from the same package version.
 */
export interface GrammarState {
  /** Defaults to 1. */
  relevance?: number;
  rules?: number[];
  scope?: string;
  begin?: string;
  end?: string;
  endsWithParent?: boolean;
  endsParent?: boolean;
  skip?: boolean;
  excludeBegin?: boolean;
  excludeEnd?: boolean;
  returnBegin?: boolean;
  returnEnd?: boolean;
  subLanguage?: string | string[];
  /** Only enforced during auto-detection. */
  illegal?: string;
  /** A word -> [scope, relevance] map, or an index into `GrammarIR.keywordTables`. */
  keywords?: Record<string, [string, number]> | number;
  keywordPattern?: string;
  wrapScope?: string;
  captureScopes?: Record<string, string | null>;
  endWrapScope?: string;
  endCaptureScopes?: Record<string, string | null>;
  endSameAsBegin?: boolean;
  onlyAtInputStart?: boolean;
  notAfterDot?: boolean;
  xmlTagGuard?: boolean;
  letterBoundaryGuard?: boolean;
  beginWordSet?: string[];
  starts?: number;
}

/** Generated data; see `GrammarState`. */
// biome-ignore lint/style/useNamingConvention: "IR" (intermediate representation) is an established term throughout this codebase's docs
export interface GrammarIR {
  name: string;
  caseInsensitive?: boolean;
  unicode?: boolean;
  aliases?: string[];
  disableAutodetect?: boolean;
  supersetOf?: string;
  states: GrammarState[];
  /** Keyword tables shared by index, as `[scope, relevance, "word word ..."]` groups. */
  keywordTables?: Array<Array<[string, number, string]>>;
}

export type ScopeEvent = { t: 0; v: string } | { t: 1; s: string } | { t: 2 };

export const TEXT: 0;
export const OPEN: 1;
export const CLOSE: 2;

export function escapeHtml(value: string): string;

/** Scope name to CSS classes, e.g. `"title.class_"` -> `"hljs-title class_"`. */
export function scopeToCssClass(name: string, prefix: string): string;

export interface TokenRange {
  start: number;
  end: number;
  scope: string;
}

export function renderHtml(
  events: ScopeEvent[],
  options?: { classPrefix?: string },
): string;

export function extendLines(
  newEvents: ScopeEvent[],
  openScopes: string[],
  pendingHtml: string,
  options?: { classPrefix?: string },
): { completedLines: string[]; pendingHtml: string; openScopes: string[] };

export function toRanges(events: ScopeEvent[]): TokenRange[];

export interface LineToken {
  /** Token text; never contains a line break. */
  text: string;
  /** Open scope stack, outermost first, e.g. ["keyword"] or ["meta", "string"]. */
  scopes: string[];
}

/**
 * Line-indexed tokens, split only on LF to match `splitLines` on
 * `renderHtml` output line-for-line.
 */
export function tokenLines(events: ScopeEvent[]): LineToken[][];

/** A conforming render target over a `ScopeEvent[]` stream. */
export interface Renderer<Out> {
  render(events: ScopeEvent[]): Out;
}

export function createHtmlRenderer(options?: {
  classPrefix?: string;
}): Renderer<string>;

export function createRangeRenderer(): Renderer<TokenRange[]>;

export function createLineRenderer(): Renderer<LineToken[][]>;

export interface HighlightResult {
  language: string | undefined;
  relevance: number;
  value: string;
  events: ScopeEvent[];
  secondBest?: { language: string | undefined; relevance: number };
}

/**
 * Serializable parse checkpoint for `Registry#resume`. Only valid within one
 * package version, and read-only (it may share state with its tokenizer).
 */
export interface Snapshot {
  pos: number;
  buffer: string;
  relevance: number;
  kwHits: Record<string, number>;
  frames: { idx: number; beginMatch: string | undefined; beginPos: number }[];
  openScopes: number;
  eventCount: number;
  /** Embedded-language state by name, resumed only by the occurrence that
   * began at `beginPos`. */
  subContinuations: Record<
    string,
    {
      beginPos: number;
      frames: {
        idx: number;
        beginMatch: string | undefined;
        beginPos: number;
      }[];
    }
  >;
}

export interface StreamSession {
  append(text: string): void;
  /** Tokenizes preloaded `from.code` up to the first lexeme at or past `stopAt`. */
  advance(stopAt: number): void;
  /** Like `append(text.slice(fedLength))`, where `text` extends everything
   * fed so far; avoids repeated string concatenation. */
  feed(text: string): void;
  /** Replaces fed `[from, to)` with `text`, re-parsing only what changed;
   * `events()` match a fresh session. Returns how many leading `events()`
   * entries are unchanged objects (0 on the first call). */
  replace(from: number, to: number, text: string): number;
  /** Latest `replace()` checkpoint within both limits, where rendering can
   * resume: `events()[0, eventCount)` covers text before `textPos` and leaves
   * `scopes` open. */
  checkpointBefore(limits: {
    eventCount?: number;
    textPos?: number;
  }): { textPos: number; eventCount: number; scopes: string[] } | undefined;
  finish(options?: { canonicalize?: boolean }): HighlightResult;
  snapshot(): Snapshot;
  events(): ScopeEvent[];
  /** Returns and forgets events since the last call. Afterward `events()`,
   * `finish()`, and `eventCount`s cover only later events; don't mix with
   * `replace()`. */
  takeEvents(): ScopeEvent[];
}

/** Opaque compiled grammar. */
export interface CompiledProgram {
  ir: GrammarIR;
}

/**
 * Thrown by `tokenize`, `highlight`, `tokenizeRanges`, and `createSession`
 * for an unregistered `language` (not by `resume`).
 */
export class UnknownLanguageError extends Error {
  constructor(language: string);
  language: string;
}

/**
 * Thrown when a parse exceeds 500,000 iterations and 3 per character
 * consumed, i.e. a grammar that stops advancing.
 */
export class TokenizerLoopError extends Error {
  constructor(grammarName: string, iterations: number);
  grammarName: string;
  iterations: number;
}

export interface Registry {
  register(ir: GrammarIR): unknown;
  get(name: string): CompiledProgram | undefined;
  listLanguages(): string[];
  tokenize(
    code: string,
    language: string,
  ): { language: string; relevance: number; events: ScopeEvent[] };
  tokenizeAuto(
    code: string,
    subset?: string[],
  ): {
    language: string | undefined;
    relevance: number;
    events: ScopeEvent[];
    secondBest?: { language: string | undefined; relevance: number };
  };
  highlight(code: string, options: { language: string }): HighlightResult;
  highlightAuto(code: string, subset?: string[]): HighlightResult;
  tokenizeRanges(code: string, options: { language: string }): TokenRange[];
  createSession(
    language: string,
    options?: {
      from?: { code: string; snapshot?: Snapshot; windowed?: boolean };
    },
  ): StreamSession;
  resume(
    code: string,
    language: string,
    snapshot: Snapshot,
  ): { events: ScopeEvent[]; relevance: number };
}

export function createRegistry(): Registry;

export function registerAll(
  registry: Registry,
  language: { name: string; register: GrammarIR; dependencies?: unknown[] },
): void;
