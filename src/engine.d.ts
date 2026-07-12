/**
 * Stability tiers for this module's exports:
 *
 * - **Stable (semver-governed):** `ScopeEvent`, `TEXT`/`OPEN`/`CLOSE`,
 *   `TokenRange`, `HighlightResult`, `LineToken`, `Renderer`, `renderHtml`,
 *   `toRanges`, `extendLines`, `tokenLines`, `escapeHtml`,
 *   `createHtmlRenderer`, `createRangeRenderer`, `createLineRenderer`,
 *   `Registry` and all its methods, `createRegistry`, `registerAll`,
 *   `StreamSession`, `Snapshot` (see its own doc comment for a narrower
 *   guarantee), `DETECT_SAMPLE_LIMIT`.
 * - **Generated data (structure versioned with the library):** `GrammarIR`,
 *   `GrammarState` (see their doc comment).
 *
 * Event grammar: a well-formed `ScopeEvent[]` stream is balanced (every
 * `OPEN` has a matching later `CLOSE`, properly nested) and its `TEXT`
 * values, concatenated in order, equal the tokenized source.
 */

/**
 * Grammar IR produced by `scripts/utils/convert-language.ts` at build time.
 * Plain JSON: no functions, no highlight.js code.
 *
 * Generated data, not a hand-authored API: produced by the build pipeline
 * (`scripts/convert-grammars.ts`) and consumed by `registerAll`. Treat as an
 * opaque payload - field-level structure may change in any minor release.
 * Grammars should always come from the same package version as the engine.
 */
export interface GrammarState {
  /** Omitted when it's the default (1) - see convert-language.ts's compaction. */
  relevance?: number;
  rules: number[];
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
  illegal?: string;
  keywords?: Record<string, [string, number]>;
  keywordPattern?: string;
  wrapScope?: string;
  captureScopes?: Record<string, string | null>;
  endWrapScope?: string;
  endCaptureScopes?: Record<string, string | null>;
  endSameAsBegin?: boolean;
  onlyAtInputStart?: boolean;
  notAfterDot?: boolean;
  xmlTagGuard?: boolean;
  starts?: number;
}

/** Generated data - see `GrammarState`'s doc comment for the stability caveat. */
// biome-ignore lint/style/useNamingConvention: "IR" (intermediate representation) is an established term throughout this codebase's docs
export interface GrammarIR {
  name: string;
  caseInsensitive: boolean;
  unicode: boolean;
  aliases?: string[];
  disableAutodetect: boolean;
  supersetOf?: string;
  states: GrammarState[];
}

export type ScopeEvent = { t: 0; v: string } | { t: 1; s: string } | { t: 2 };

export const TEXT: 0;
export const OPEN: 1;
export const CLOSE: 2;

/**
 * Max leading characters used for auto-detection scoring
 * (`Registry#tokenizeAuto`/`highlightAuto`). Reused by
 * `svelte-highlight/auto-detect`'s tier-0 fingerprint scoring so both tiers
 * sample the same prefix of `code`.
 */
export const DETECT_SAMPLE_LIMIT: number;

export function escapeHtml(value: string): string;

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
 * Line-indexed `{ text, scopes }` tokens - the structured alternative to
 * re-splitting `renderHtml`'s output (see `src/split-lines.js`). Splits
 * solely on LF; see `tokenLines`'s JSDoc in `engine.js` for the exact
 * newline and edge-case semantics (CRLF, trailing newline, empty input),
 * which are chosen to match `splitLines` line-for-line.
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
 * Serializable parse checkpoint; JSON round-trips (see `Registry#resume`)
 * within one installed library version. Not guaranteed stable across
 * versions: a snapshot produced by an older or newer version of this
 * package may be rejected on resume. Callers that persist snapshots across
 * deploys (windowing, long-lived streaming sessions) should pin the engine
 * version or be prepared to discard stale snapshots.
 */
export interface Snapshot {
  pos: number;
  buffer: string;
  relevance: number;
  kwHits: Record<string, number>;
  frames: { idx: number; beginMatch: string | undefined; beginPos: number }[];
  openScopes: number;
  eventCount: number;
  /** Per sub-language name, the carried continuation - scoped to the
   * embedding occurrence that began at `beginPos` (see `Tokenizer`'s
   * `subContinuations` field). A later occurrence of the same name that
   * began elsewhere starts fresh rather than inheriting this state. */
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
  finish(options?: { canonicalize?: boolean }): HighlightResult;
  snapshot(): Snapshot;
  events(): ScopeEvent[];
}

/** The compiled program `Registry#get` returns; opaque other than its source IR's identity. */
export interface CompiledProgram {
  ir: GrammarIR;
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
    options?: { from?: { code: string; snapshot: Snapshot } },
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
