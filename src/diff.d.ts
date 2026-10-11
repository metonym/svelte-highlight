/**
 * A run of the edit script. `equal` runs cover the same lines on both sides
 * (except `unknown` gaps from a patch); `change` runs delete
 * `before[a, aEnd)` and insert `after[b, bEnd)`.
 */
export interface Block {
  type: "equal" | "change";
  a: number;
  aEnd: number;
  b: number;
  bEnd: number;
  /** Position among change blocks. Stable while `after` only grows. */
  id?: number;
  /** Lines a patch doesn't include. */
  unknown?: boolean;
  /** Hunk header to show on an unknown gap's fold. */
  header?: string;
}

export interface DiffState {
  beforeLines: string[];
  /** Complete lines of `after`; while streaming, the partial line is in `partial`. */
  afterLines: string[];
  partial: string | null;
  blocks: Block[];
  /** Where the part of `before` that a stream hasn't reached starts. */
  pendingA: number;
  streaming: boolean;
  beforeNoEol: boolean;
  afterNoEol: boolean;
  /** Blocks that won't change as `after` grows. */
  sealedBlocks: number;
  version: number;
}

export interface DiffOptions {
  /** Treat lines that differ only in whitespace as equal. @default false */
  ignoreWhitespace?: boolean;
}

/** Splits text into lines, without the empty line a final "\n" makes. */
export function splitText(text: string): { lines: string[]; noEol: boolean };

/** Line diff: common prefix/suffix, patience anchors, then Myers. */
export function diffLines(
  before: string[],
  after: string[],
  options?: DiffOptions,
): Block[];

export interface DiffSession {
  /**
   * Diffs two texts. With `streaming`, `after` may be a growing prefix:
   * calls that only append re-diff from the last sealed anchor.
   */
  update(
    before: string,
    after: string,
    options?: { streaming?: boolean },
  ): DiffState;
}

export function createDiffSession(options?: DiffOptions): DiffSession;

/** One-shot diff of two texts. */
export function diffTexts(
  before: string,
  after: string,
  options?: DiffOptions,
): DiffState;

export interface MoveInfo {
  group: number;
  /** For a removed line: where it moved to. */
  to?: number;
  /** For an added line: where it moved from. */
  from?: number;
}

export interface Row {
  key: string;
  kind: "context" | "del" | "add" | "change" | "fold" | "pending" | "incoming";
  /** 0-based line in `before`. */
  old?: number;
  /** 0-based line in `after`. */
  new?: number;
  /** Change block id. */
  change?: number;
  /** Unified view: the paired line on the other side, for word diffs. */
  pairOld?: number;
  pairNew?: number;
  moved?: number;
  movedTo?: number;
  movedFrom?: number;
  /** First row of its change. */
  first?: boolean;
  fold?: {
    a: number;
    aEnd: number;
    b: number;
    bEnd: number;
    unknown: boolean;
    header: string;
  };
  /** Hidden lines in a fold, or unreached lines in a pending row. */
  count?: number;
}

export function buildRows(
  state: DiffState,
  options?: {
    view?: "unified" | "split";
    /** @default 3 */
    context?: number;
    /** Fold keys to show expanded. */
    expanded?: Set<string>;
    moves?: Map<number, MoveInfo>;
    movesNew?: Map<number, MoveInfo>;
  },
): Row[];

/** Lines removed in one change and added in another, ignoring indentation. */
export function detectMoves(
  state: DiffState,
  options?: { /** @default 3 */ minLines?: number },
): {
  oldMoves: Map<number, MoveInfo>;
  newMoves: Map<number, MoveInfo>;
  groups: number;
};

/**
 * Character ranges that differ between two lines, by word tokens. Empty
 * when the lines share too little (`similarity < 0.35`).
 */
export function wordDiff(
  oldText: string,
  newText: string,
): {
  old: Array<[number, number]>;
  new: Array<[number, number]>;
  similarity: number;
};

/** `after`, with each rejected change reverted to `before`. */
export function applyReview(
  state: DiffState,
  decisions: Map<number, "accepted" | "rejected">,
): string;

export function diffStats(state: DiffState): {
  additions: number;
  deletions: number;
  changes: number;
};

/** A unified patch for the diff. */
export function toUnifiedPatch(
  state: DiffState,
  options?: { oldPath?: string; newPath?: string; context?: number },
): string;
