// Headless line diff: patience anchors + Myers, streaming sessions whose
// rows only change past the last sealed anchor, a row model for unified and
// split views, word-level diffs, moved-block detection, and review helpers.

/**
 * A run of the edit script. `equal` runs cover the same line count on both
 * sides (unless `unknown`, for gaps a patch doesn't include); `change` runs
 * delete `before[a, aEnd)` and insert `after[b, bEnd)`.
 * @typedef {{
 *   type: "equal" | "change",
 *   a: number, aEnd: number,
 *   b: number, bEnd: number,
 *   id?: number,
 *   unknown?: boolean,
 *   header?: string,
 * }} Block
 */

/**
 * @typedef {{
 *   beforeLines: string[],
 *   afterLines: string[],
 *   partial: string | null,
 *   blocks: Block[],
 *   pendingA: number,
 *   streaming: boolean,
 *   beforeNoEol: boolean,
 *   afterNoEol: boolean,
 *   sealedBlocks: number,
 *   version: number,
 * }} DiffState
 */

// Past this many edits in one region, Myers gives up and replaces the region.
const MAX_COST = 2000;
// An equal run at least this long seals everything before it while streaming.
const SEAL_RUN = 3;

/**
 * Splits text into lines without the trailing empty line a final "\n" makes.
 * @param {string} text
 * @returns {{ lines: string[], noEol: boolean }}
 */
export function splitText(text) {
  if (text === "") return { lines: [], noEol: false };
  const lines = text.split("\n");
  const noEol = lines[lines.length - 1] !== "";
  if (!noEol) lines.pop();
  return { lines, noEol };
}

/**
 * Maps each line to a small integer id, so comparisons are O(1).
 * @param {string[][]} sides
 * @param {(line: string) => string} key
 * @returns {Int32Array[]}
 */
function intern(sides, key) {
  /** @type {Map<string, number>} */
  const ids = new Map();
  return sides.map((lines) => {
    const out = new Int32Array(lines.length);
    for (let i = 0; i < lines.length; i++) {
      const k = key(/** @type {string} */ (lines[i]));
      let id = ids.get(k);
      if (id === undefined) {
        id = ids.size;
        ids.set(k, id);
      }
      out[i] = id;
    }
    return out;
  });
}

const WHITESPACE_RE = /\s+/g;

/** @param {boolean} ignoreWhitespace */
function lineKey(ignoreWhitespace) {
  return ignoreWhitespace
    ? (/** @type {string} */ line) => line.replace(WHITESPACE_RE, " ").trim()
    : (/** @type {string} */ line) => line;
}

/**
 * Appends a run, merging it into the previous run of the same type.
 * @param {Block[]} out
 * @param {"equal" | "change"} type
 * @param {number} a
 * @param {number} aEnd
 * @param {number} b
 * @param {number} bEnd
 */
function pushRun(out, type, a, aEnd, b, bEnd) {
  if (a === aEnd && b === bEnd) return;
  const last = out[out.length - 1];
  if (last && last.type === type && last.aEnd === a && last.bEnd === b) {
    last.aEnd = aEnd;
    last.bEnd = bEnd;
    return;
  }
  out.push({ type, a, aEnd, b, bEnd });
}

/**
 * Myers O(ND). With `prefix`, stops once all of `b` is consumed, so trailing
 * lines of `a` cost nothing (they stay "pending"). Returns the end of the
 * consumed `a` range.
 * @param {Int32Array} a
 * @param {number} aLo
 * @param {number} aHi
 * @param {Int32Array} b
 * @param {number} bLo
 * @param {number} bHi
 * @param {Block[]} out
 * @param {boolean} prefix
 * @returns {number}
 */
function myers(a, aLo, aHi, b, bLo, bHi, out, prefix) {
  const n = aHi - aLo;
  const m = bHi - bLo;
  const max = Math.min(n + m, MAX_COST);
  const offset = max + 1;
  // -1 marks a diagonal with no in-bounds point yet.
  const v = new Int32Array(2 * max + 3).fill(-1);
  v[offset + 1] = 0;
  /** @type {Int32Array[]} */
  const trace = [];
  let endX = -1;
  let endY = -1;

  /**
   * Furthest in-bounds x on diagonal `k`, and whether it came from `k + 1`.
   * @param {(k: number) => number} at
   * @param {number} k
   * @returns {[number, boolean]}
   */
  const pick = (at, k) => {
    let down = at(k + 1);
    if (down >= 0 && down - k > m) down = -1;
    let right = at(k - 1);
    right = right >= 0 && right + 1 <= n ? right + 1 : -1;
    return down >= right ? [down, true] : [right, false];
  };
  const fromV = (/** @type {number} */ k) =>
    /** @type {number} */ (v[offset + k]);

  outer: for (let d = 0; d <= max; d++) {
    // Only k in [-d-1, d+1] is read while backtracking from step d.
    trace.push(v.slice(offset - d - 1, offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let [x] = pick(fromV, k);
      if (x < 0) {
        v[offset + k] = -1;
        continue;
      }
      let y = x - k;
      while (x < n && y < m && a[aLo + x] === b[bLo + y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (y === m && (prefix || x === n)) {
        endX = x;
        endY = y;
        break outer;
      }
    }
  }

  if (endX < 0) {
    // Too many edits: treat the region as one replacement.
    if (prefix) {
      pushRun(out, "change", aLo, aLo, bLo, bHi);
      return aLo;
    }
    pushRun(out, "change", aLo, aHi, bLo, bHi);
    return aHi;
  }

  /** @type {Array<[number, number, number, number, "equal" | "change"]>} */
  const reversed = [];
  let x = endX;
  let y = endY;
  for (let d = trace.length - 1; d >= 0; d--) {
    const t = /** @type {Int32Array} */ (trace[d]);
    const k = x - y;
    if (d === 0) {
      if (x > 0) reversed.push([0, x, 0, y, "equal"]);
      break;
    }
    const [, fromDown] = pick(
      (kk) => /** @type {number} */ (t[kk + d + 1] ?? -1),
      k,
    );
    const prevK = fromDown ? k + 1 : k - 1;
    const prevX = /** @type {number} */ (t[prevK + d + 1]);
    const prevY = prevX - prevK;
    const snakeX = fromDown ? prevX : prevX + 1;
    const snakeY = snakeX - k;
    if (x > snakeX) reversed.push([snakeX, x, snakeY, y, "equal"]);
    reversed.push([prevX, snakeX, prevY, snakeY, "change"]);
    x = prevX;
    y = prevY;
  }
  for (let i = reversed.length - 1; i >= 0; i--) {
    const [x0, x1, y0, y1, type] = /** @type {any} */ (reversed[i]);
    pushRun(out, type, aLo + x0, aLo + x1, bLo + y0, bLo + y1);
  }
  return aLo + endX;
}

/**
 * Lines unique to both ranges, as an increasing (a, b) chain (patience).
 * @param {Int32Array} a
 * @param {number} aLo
 * @param {number} aHi
 * @param {Int32Array} b
 * @param {number} bLo
 * @param {number} bHi
 * @returns {Array<[number, number]>}
 */
function uniqueAnchors(a, aLo, aHi, b, bLo, bHi) {
  /** @type {Map<number, number>} id -> index in a, or -1 if repeated */
  const inA = new Map();
  for (let i = aLo; i < aHi; i++) {
    const id = /** @type {number} */ (a[i]);
    inA.set(id, inA.has(id) ? -1 : i);
  }
  /** @type {Map<number, number>} */
  const inB = new Map();
  for (let j = bLo; j < bHi; j++) {
    const id = /** @type {number} */ (b[j]);
    if (!inA.has(id) || inA.get(id) === -1) continue;
    inB.set(id, inB.has(id) ? -1 : j);
  }
  /** @type {Array<[number, number]>} */
  const pairs = [];
  for (const [id, j] of inB) {
    if (j === -1) continue;
    pairs.push([/** @type {number} */ (inA.get(id)), j]);
  }
  if (pairs.length === 0) return pairs;
  pairs.sort((p, q) => p[0] - q[0]);

  // Longest increasing subsequence on b, via patience sorting.
  /** @type {number[]} */
  const tails = [];
  const prev = new Int32Array(pairs.length).fill(-1);
  for (let i = 0; i < pairs.length; i++) {
    const bj = /** @type {[number, number]} */ (pairs[i])[1];
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const t = /** @type {[number, number]} */ (
        pairs[/** @type {number} */ (tails[mid])]
      );
      if (t[1] < bj) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = /** @type {number} */ (tails[lo - 1]);
    tails[lo] = i;
  }
  /** @type {Array<[number, number]>} */
  const chain = [];
  for (
    let i = /** @type {number} */ (tails[tails.length - 1]);
    i !== -1;
    i = /** @type {number} */ (prev[i])
  ) {
    chain.push(/** @type {[number, number]} */ (pairs[i]));
  }
  return chain.reverse();
}

/**
 * @param {Int32Array} a
 * @param {number} aLo
 * @param {number} aHi
 * @param {Int32Array} b
 * @param {number} bLo
 * @param {number} bHi
 * @param {Block[]} out
 */
function diffRange(a, aLo, aHi, b, bLo, bHi, out) {
  while (aLo < aHi && bLo < bHi && a[aLo] === b[bLo]) {
    pushRun(out, "equal", aLo, aLo + 1, bLo, bLo + 1);
    aLo++;
    bLo++;
  }
  let suffix = 0;
  while (
    aHi - suffix > aLo &&
    bHi - suffix > bLo &&
    a[aHi - suffix - 1] === b[bHi - suffix - 1]
  ) {
    suffix++;
  }
  const aMid = aHi - suffix;
  const bMid = bHi - suffix;

  if (aLo === aMid || bLo === bMid) {
    pushRun(out, "change", aLo, aMid, bLo, bMid);
  } else {
    const anchors = uniqueAnchors(a, aLo, aMid, b, bLo, bMid);
    if (anchors.length === 0) {
      myers(a, aLo, aMid, b, bLo, bMid, out, false);
    } else {
      let pa = aLo;
      let pb = bLo;
      for (const [ai, bi] of anchors) {
        diffRange(a, pa, ai, b, pb, bi, out);
        pushRun(out, "equal", ai, ai + 1, bi, bi + 1);
        pa = ai + 1;
        pb = bi + 1;
      }
      diffRange(a, pa, aMid, b, pb, bMid, out);
    }
  }
  if (suffix > 0) pushRun(out, "equal", aMid, aHi, bMid, bHi);
}

/**
 * Line diff of two line arrays.
 * @param {string[]} before
 * @param {string[]} after
 * @param {{ ignoreWhitespace?: boolean }} [options]
 * @returns {Block[]}
 */
export function diffLines(before, after, { ignoreWhitespace = false } = {}) {
  const [a, b] = /** @type {[Int32Array, Int32Array]} */ (
    intern([before, after], lineKey(ignoreWhitespace))
  );
  /** @type {Block[]} */
  const out = [];
  diffRange(a, 0, a.length, b, 0, b.length, out);
  return out;
}

/**
 * Diffs `before` against a prefix of `after` that is still growing: the end
 * of `before` that `after` hasn't reached yet is left out ("pending").
 * @param {Int32Array} a
 * @param {number} aLo
 * @param {Int32Array} b
 * @param {number} bLo
 * @param {Block[]} out
 * @returns {number} where the pending part of `before` starts
 */
function diffPrefix(a, aLo, b, bLo, out) {
  let aI = aLo;
  let bI = bLo;
  while (aI < a.length && bI < b.length && a[aI] === b[bI]) {
    aI++;
    bI++;
  }
  pushRun(out, "equal", aLo, aI, bLo, bI);
  if (bI === b.length) return aI;
  // Bound the lookahead so a stray "}" can't match 5,000 lines ahead.
  const window = Math.min(a.length, aI + (b.length - bI) * 4 + 200);
  return myers(a, aI, window, b, bI, b.length, out, true);
}

/**
 * Stateful diff that reuses sealed work when `after` only grows.
 * @param {{ ignoreWhitespace?: boolean }} [options]
 */
export function createDiffSession({ ignoreWhitespace = false } = {}) {
  let before = "";
  let after = "";
  let wasStreaming = false;
  /** @type {Block[]} */
  let sealed = [];
  let sealA = 0;
  let sealB = 0;
  let version = 0;

  /** @type {DiffState | null} */
  let last = null;

  /**
   * @param {string} beforeText
   * @param {string} afterText
   * @param {{ streaming?: boolean }} [options]
   * @returns {DiffState}
   */
  function update(beforeText, afterText, { streaming = false } = {}) {
    if (
      last &&
      beforeText === before &&
      afterText === after &&
      streaming === wasStreaming
    ) {
      return last;
    }
    const grows =
      streaming && wasStreaming && beforeText === before
        ? afterText.startsWith(after)
        : false;
    if (!grows) {
      sealed = [];
      sealA = 0;
      sealB = 0;
    }
    before = beforeText;
    after = afterText;
    wasStreaming = streaming;

    const b4 = splitText(beforeText);
    /** @type {string[]} */
    let afterLines;
    /** @type {string | null} */
    let partial = null;
    let afterNoEol = false;
    if (streaming) {
      const cut = afterText.lastIndexOf("\n");
      afterLines = cut === -1 ? [] : afterText.slice(0, cut).split("\n");
      const rest = afterText.slice(cut + 1);
      partial = rest === "" ? null : rest;
    } else {
      const split = splitText(afterText);
      afterLines = split.lines;
      afterNoEol = split.noEol;
    }

    // A missing final newline on one side only counts as a change.
    const key = lineKey(ignoreWhitespace);
    const eolMismatch = !streaming && b4.noEol !== afterNoEol;
    const [a, b] = /** @type {[Int32Array, Int32Array]} */ (
      intern([b4.lines, afterLines], (line) => key(line))
    );
    if (eolMismatch) {
      if (b4.noEol && a.length > 0) a[a.length - 1] = -1;
      if (afterNoEol && b.length > 0) b[b.length - 1] = -2;
    }

    /** @type {Block[]} */
    const tail = [];
    let pendingA = b4.lines.length;
    if (streaming) {
      pendingA = diffPrefix(a, sealA, b, sealB, tail);
    } else {
      diffRange(a, sealA, a.length, b, sealB, b.length, tail);
    }

    const blocks = sealed.slice();
    for (const block of tail) {
      const prev = blocks[blocks.length - 1];
      if (
        prev &&
        prev.type === block.type &&
        prev.aEnd === block.a &&
        prev.bEnd === block.b
      ) {
        blocks[blocks.length - 1] = {
          ...prev,
          aEnd: block.aEnd,
          bEnd: block.bEnd,
        };
      } else {
        blocks.push({ ...block });
      }
    }
    // Positional ids, so a change keeps its id across streamed updates.
    let id = 0;
    for (const block of blocks) {
      if (block.type === "change") block.id = id++;
    }

    if (streaming) {
      // Seal through the last long equal run; later chunks only diff past it.
      for (let i = blocks.length - 1; i >= 0; i--) {
        const block = /** @type {Block} */ (blocks[i]);
        if (block.type === "equal" && block.aEnd - block.a >= SEAL_RUN) {
          sealed = blocks.slice(0, i + 1).map((x) => ({ ...x }));
          sealA = block.aEnd;
          sealB = block.bEnd;
          break;
        }
      }
    }

    version++;
    last = {
      beforeLines: b4.lines,
      afterLines,
      partial,
      blocks,
      pendingA,
      streaming,
      beforeNoEol: b4.noEol,
      afterNoEol,
      sealedBlocks: streaming ? sealed.length : blocks.length,
      version,
    };
    return last;
  }

  return { update };
}

/**
 * One-shot diff of two texts.
 * @param {string} before
 * @param {string} after
 * @param {{ ignoreWhitespace?: boolean }} [options]
 * @returns {DiffState}
 */
export function diffTexts(before, after, options) {
  return createDiffSession(options).update(before, after);
}

/**
 * @typedef {{
 *   key: string,
 *   kind: "context" | "del" | "add" | "change" | "fold" | "pending" | "incoming",
 *   old?: number,
 *   new?: number,
 *   change?: number,
 *   pairOld?: number,
 *   pairNew?: number,
 *   moved?: number,
 *   movedTo?: number,
 *   movedFrom?: number,
 *   first?: boolean,
 *   fold?: { a: number, aEnd: number, b: number, bEnd: number, unknown: boolean, header: string },
 *   count?: number,
 * }} Row
 */

/**
 * Unified or split rows, with unchanged runs past `context` folded unless
 * their key is in `expanded`.
 * @param {DiffState} state
 * @param {{
 *   view?: "unified" | "split",
 *   context?: number,
 *   expanded?: Set<string>,
 *   moves?: Map<number, { group: number, to?: number, from?: number }>,
 *   movesNew?: Map<number, { group: number, to?: number, from?: number }>,
 * }} [options]
 * @returns {Row[]}
 */
export function buildRows(
  state,
  {
    view = "unified",
    context = 3,
    expanded = new Set(),
    moves = new Map(),
    movesNew = new Map(),
  } = {},
) {
  /** @type {Row[]} */
  const rows = [];
  const { blocks } = state;
  const hasChanges =
    blocks.some((b) => b.type === "change") || state.partial !== null;

  /** @param {number} a @param {number} b */
  const pushContext = (a, b) =>
    rows.push({ key: `c${a}:${b}`, kind: "context", old: a, new: b });

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = /** @type {Block} */ (blocks[bi]);
    if (block.type === "change") {
      const dels = block.aEnd - block.a;
      const adds = block.bEnd - block.b;
      const id = /** @type {number} */ (block.id);
      if (view === "split") {
        const n = Math.max(dels, adds);
        for (let i = 0; i < n; i++) {
          /** @type {Row} */
          const row = {
            key: `x${id}:${i}`,
            kind: "change",
            change: id,
            first: i === 0,
          };
          if (i < dels) row.old = block.a + i;
          if (i < adds) row.new = block.b + i;
          const mo = row.old === undefined ? undefined : moves.get(row.old);
          const mn = row.new === undefined ? undefined : movesNew.get(row.new);
          if (mo) {
            row.moved = mo.group;
            if (mo.to !== undefined) row.movedTo = mo.to;
          }
          if (mn) {
            row.moved = mn.group;
            if (mn.from !== undefined) row.movedFrom = mn.from;
          }
          rows.push(row);
        }
      } else {
        for (let i = 0; i < dels; i++) {
          /** @type {Row} */
          const row = {
            key: `d${block.a + i}`,
            kind: "del",
            old: block.a + i,
            change: id,
            first: i === 0,
          };
          if (i < adds) row.pairNew = block.b + i;
          const mo = moves.get(block.a + i);
          if (mo) {
            row.moved = mo.group;
            if (mo.to !== undefined) row.movedTo = mo.to;
          }
          rows.push(row);
        }
        for (let i = 0; i < adds; i++) {
          /** @type {Row} */
          const row = {
            key: `a${block.b + i}`,
            kind: "add",
            new: block.b + i,
            change: id,
            first: dels === 0 && i === 0,
          };
          if (i < dels) row.pairOld = block.a + i;
          const mn = movesNew.get(block.b + i);
          if (mn) {
            row.moved = mn.group;
            if (mn.from !== undefined) row.movedFrom = mn.from;
          }
          rows.push(row);
        }
      }
      continue;
    }

    const n = block.aEnd - block.a;
    const foldKey = `f${block.a}:${block.b}`;
    const isFirst = bi === 0;
    const isLast = bi === blocks.length - 1 && state.partial === null;
    if (block.unknown) {
      rows.push({
        key: foldKey,
        kind: "fold",
        fold: {
          a: block.a,
          aEnd: block.aEnd,
          b: block.b,
          bEnd: block.bEnd,
          unknown: true,
          header: block.header ?? hunkHeader(blocks, bi + 1),
        },
        count: Math.max(n, block.bEnd - block.b),
      });
      continue;
    }
    const lead = isFirst ? 0 : context;
    const trail = isLast && !state.streaming ? 0 : context;
    if (!hasChanges || expanded.has(foldKey) || n <= lead + trail + 1) {
      if (!hasChanges && !expanded.has(foldKey) && n > 0) {
        rows.push({
          key: foldKey,
          kind: "fold",
          fold: {
            a: block.a,
            aEnd: block.aEnd,
            b: block.b,
            bEnd: block.bEnd,
            unknown: false,
            header: "",
          },
          count: n,
        });
        continue;
      }
      for (let i = 0; i < n; i++) pushContext(block.a + i, block.b + i);
      continue;
    }
    for (let i = 0; i < lead; i++) pushContext(block.a + i, block.b + i);
    const hidden = n - lead - trail;
    rows.push({
      key: foldKey,
      kind: "fold",
      fold: {
        a: block.a + lead,
        aEnd: block.aEnd - trail,
        b: block.b + lead,
        bEnd: block.bEnd - trail,
        unknown: false,
        header: isLast ? "" : hunkHeader(blocks, bi + 1, context),
      },
      count: hidden,
    });
    for (let i = n - trail; i < n; i++) pushContext(block.a + i, block.b + i);
  }

  if (state.partial !== null) {
    rows.push({
      key: `i${state.afterLines.length}`,
      kind: "incoming",
      new: state.afterLines.length,
    });
  }
  if (state.streaming && state.pendingA < state.beforeLines.length) {
    rows.push({
      key: "pending",
      kind: "pending",
      old: state.pendingA,
      count: state.beforeLines.length - state.pendingA,
    });
  }
  return rows;
}

/**
 * `@@ -a,n +b,m @@` for the hunk that starts at block `from`.
 * @param {Block[]} blocks
 * @param {number} from
 * @param {number} [context]
 */
function hunkHeader(blocks, from, context = 3) {
  const start = blocks[from];
  if (!start) return "";
  let a0 = start.a;
  let b0 = start.b;
  let a1 = start.aEnd;
  let b1 = start.bEnd;
  // Extend through changes separated by short equal runs, then take the
  // trailing context.
  for (let i = from + 1; i < blocks.length; i++) {
    const block = /** @type {Block} */ (blocks[i]);
    const n = block.aEnd - block.a;
    if (
      block.type === "equal" &&
      (n > context * 2 || i === blocks.length - 1)
    ) {
      const take = Math.min(n, context);
      a1 = block.a + take;
      b1 = block.b + take;
      break;
    }
    a1 = block.aEnd;
    b1 = block.bEnd;
  }
  a0 = Math.max(0, a0 - context);
  b0 = Math.max(0, b0 - context);
  return `@@ -${a0 + 1},${a1 - a0} +${b0 + 1},${b1 - b0} @@`;
}

/**
 * Lines removed in one change and added in another, in runs of at least
 * `minLines`, ignoring indentation.
 * @param {DiffState} state
 * @param {{ minLines?: number }} [options]
 */
export function detectMoves(state, { minLines = 3 } = {}) {
  /** @type {Map<number, { group: number, to?: number, from?: number }>} */
  const oldMoves = new Map();
  /** @type {Map<number, { group: number, to?: number, from?: number }>} */
  const newMoves = new Map();
  /** @type {Map<string, number[]>} */
  const addsByKey = new Map();
  /** @type {Map<number, number>} new index -> change id */
  const addChange = new Map();
  /** @type {Map<number, number>} old index -> change id */
  const delChange = new Map();
  const moveKey = (/** @type {string} */ line) => line.trim();
  const trivial = (/** @type {string} */ k) =>
    k.replace(/[\s{}()[\];,]/g, "").length < 3;

  for (const block of state.blocks) {
    if (block.type !== "change") continue;
    for (let j = block.b; j < block.bEnd; j++) {
      addChange.set(j, /** @type {number} */ (block.id));
      const k = moveKey(/** @type {string} */ (state.afterLines[j]));
      if (trivial(k)) continue;
      let list = addsByKey.get(k);
      if (!list) addsByKey.set(k, (list = []));
      list.push(j);
    }
    for (let i = block.a; i < block.aEnd; i++) {
      delChange.set(i, /** @type {number} */ (block.id));
    }
  }

  let group = 0;
  for (const block of state.blocks) {
    if (block.type !== "change") continue;
    let i = block.a;
    while (i < block.aEnd) {
      if (oldMoves.has(i)) {
        i++;
        continue;
      }
      const k = moveKey(/** @type {string} */ (state.beforeLines[i]));
      let best = 0;
      let bestJ = -1;
      for (const j of addsByKey.get(k) ?? []) {
        if (addChange.get(j) === block.id || newMoves.has(j)) continue;
        let len = 0;
        while (
          i + len < block.aEnd &&
          addChange.has(j + len) &&
          !newMoves.has(j + len) &&
          moveKey(/** @type {string} */ (state.beforeLines[i + len])) ===
            moveKey(/** @type {string} */ (state.afterLines[j + len]))
        ) {
          len++;
        }
        if (len > best) {
          best = len;
          bestJ = j;
        }
      }
      if (best >= minLines) {
        for (let t = 0; t < best; t++) {
          oldMoves.set(i + t, { group, to: bestJ + t });
          newMoves.set(bestJ + t, { group, from: i + t });
        }
        group++;
        i += best;
      } else {
        i++;
      }
    }
  }
  return { oldMoves, newMoves, groups: group };
}

const WORD_RE = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;

/**
 * Character ranges that differ between two lines, by word tokens.
 * Returns empty ranges when the lines share too little to be worth it.
 * @param {string} oldText
 * @param {string} newText
 * @returns {{ old: Array<[number, number]>, new: Array<[number, number]>, similarity: number }}
 */
export function wordDiff(oldText, newText) {
  const ta = oldText.match(WORD_RE) ?? [];
  const tb = newText.match(WORD_RE) ?? [];
  if (ta.length + tb.length > 1200) {
    return { old: [], new: [], similarity: 0 };
  }
  const [a, b] = /** @type {[Int32Array, Int32Array]} */ (
    intern([ta, tb], (t) => t)
  );
  /** @type {Block[]} */
  const ops = [];
  diffRange(a, 0, a.length, b, 0, b.length, ops);

  const offsets = (/** @type {string[]} */ tokens) => {
    const out = new Int32Array(tokens.length + 1);
    for (let i = 0; i < tokens.length; i++) {
      out[i + 1] =
        /** @type {number} */ (out[i]) +
        /** @type {string} */ (tokens[i]).length;
    }
    return out;
  };
  const oa = offsets(ta);
  const ob = offsets(tb);

  let same = 0;
  /** @type {Array<[number, number]>} */
  const oldRanges = [];
  /** @type {Array<[number, number]>} */
  const newRanges = [];
  /**
   * @param {Array<[number, number]>} list
   * @param {number} s
   * @param {number} e
   * @param {string} text
   */
  const add = (list, s, e, text) => {
    if (s === e) return;
    const prev = list[list.length - 1];
    // Bridge whitespace-only gaps so "a b c" reads as one change.
    if (prev && /^\s*$/.test(text.slice(prev[1], s))) prev[1] = e;
    else list.push([s, e]);
  };
  for (const op of ops) {
    if (op.type === "equal") {
      same +=
        /** @type {number} */ (oa[op.aEnd]) - /** @type {number} */ (oa[op.a]);
      continue;
    }
    add(
      oldRanges,
      /** @type {number} */ (oa[op.a]),
      /** @type {number} */ (oa[op.aEnd]),
      oldText,
    );
    add(
      newRanges,
      /** @type {number} */ (ob[op.b]),
      /** @type {number} */ (ob[op.bEnd]),
      newText,
    );
  }
  const total = oldText.length + newText.length;
  const similarity = total === 0 ? 1 : (2 * same) / total;
  if (similarity < 0.35) return { old: [], new: [], similarity };
  return { old: oldRanges, new: newRanges, similarity };
}

/**
 * Text with each change taken from `after` unless its id is rejected.
 * @param {DiffState} state
 * @param {Map<number, "accepted" | "rejected">} decisions
 */
export function applyReview(state, decisions) {
  /** @type {string[]} */
  const out = [];
  for (const block of state.blocks) {
    if (block.type === "equal") {
      out.push(...state.afterLines.slice(block.b, block.bEnd));
    } else if (decisions.get(/** @type {number} */ (block.id)) === "rejected") {
      out.push(...state.beforeLines.slice(block.a, block.aEnd));
    } else {
      out.push(...state.afterLines.slice(block.b, block.bEnd));
    }
  }
  if (state.streaming) {
    out.push(...state.beforeLines.slice(state.pendingA));
  }
  const text = out.join("\n");
  return out.length === 0 || state.afterNoEol ? text : `${text}\n`;
}

/**
 * Added and removed line counts.
 * @param {DiffState} state
 */
export function diffStats(state) {
  let additions = 0;
  let deletions = 0;
  let changes = 0;
  for (const block of state.blocks) {
    if (block.type !== "change") continue;
    additions += block.bEnd - block.b;
    deletions += block.aEnd - block.a;
    changes++;
  }
  return { additions, deletions, changes };
}

/**
 * A unified patch (`git apply`-able) for the diff.
 * @param {DiffState} state
 * @param {{ oldPath?: string, newPath?: string, context?: number }} [options]
 */
export function toUnifiedPatch(
  state,
  { oldPath = "a", newPath = "b", context = 3 } = {},
) {
  const { blocks, beforeLines, afterLines } = state;
  const lines = [`--- ${oldPath}`, `+++ ${newPath}`];
  let i = 0;
  while (i < blocks.length) {
    while (i < blocks.length && blocks[i]?.type === "equal") i++;
    if (i >= blocks.length) break;
    const first = /** @type {Block} */ (blocks[i]);
    const a0 = Math.max(0, first.a - context);
    const b0 = Math.max(0, first.b - context);
    /** @type {string[]} */
    const body = [];
    for (let k = a0; k < first.a; k++) body.push(` ${beforeLines[k]}`);
    let end = i;
    let a1 = first.a;
    let b1 = first.b;
    for (let j = i; j < blocks.length; j++) {
      const block = /** @type {Block} */ (blocks[j]);
      if (block.type === "equal") {
        const n = block.aEnd - block.a;
        const isLast = j === blocks.length - 1;
        if (n > context * 2 || isLast) {
          const take = Math.min(n, context);
          for (let k = 0; k < take; k++)
            body.push(` ${beforeLines[block.a + k]}`);
          a1 = block.a + take;
          b1 = block.b + take;
          end = j;
          break;
        }
        for (let k = block.a; k < block.aEnd; k++)
          body.push(` ${beforeLines[k]}`);
      } else {
        for (let k = block.a; k < block.aEnd; k++)
          body.push(`-${beforeLines[k]}`);
        for (let k = block.b; k < block.bEnd; k++)
          body.push(`+${afterLines[k]}`);
      }
      a1 = block.aEnd;
      b1 = block.bEnd;
      end = j + 1;
    }
    lines.push(`@@ -${a0 + 1},${a1 - a0} +${b0 + 1},${b1 - b0} @@`, ...body);
    i = Math.max(end, i + 1);
  }
  return `${lines.join("\n")}\n`;
}
