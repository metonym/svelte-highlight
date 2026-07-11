/**
 * Grammar IR produced by `scripts/utils/convert-language.ts` at build time.
 * Plain JSON: no functions, no highlight.js code.
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

export interface HighlightResult {
  language: string | undefined;
  relevance: number;
  value: string;
  events: ScopeEvent[];
  secondBest?: { language: string | undefined; relevance: number };
}

/** Serializable parse checkpoint; JSON round-trips (see `Registry#resume`). */
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
