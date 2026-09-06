/**
 * Line-checkpoint incremental re-tokenization for editors. On each edit,
 * resume from the nearest line boundary before the change and stop once
 * tokenizer state matches the previous parse at a later line, reusing that
 * tail's events. Falls back to a full re-parse when state never converges
 * (e.g. an edit that unbalances a string for the rest of the file).
 *
 * Pure and DOM-free; HighlightEditable wires the result into a renderer.
 */
import { diffText } from "./text-diff.js";

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 */

/**
 * @typedef {{
 *   code: string,
 *   language: string,
 *   events: ScopeEvent[],
 *   checkpoints: Snapshot[],
 * }} IncrementalParse
 */

/**
 * Whether two checkpoints will emit the same events from here on.
 * `relevance`/`kwHits` are excluded; they only affect detection scoring.
 * @param {Snapshot} a
 * @param {Snapshot} b
 */
function stateConverges(a, b) {
  if (a.buffer !== b.buffer || a.openScopes !== b.openScopes) return false;
  if (!framesEqual(a.frames, b.frames)) return false;
  const aSubs = Object.keys(a.subContinuations);
  const bSubs = Object.keys(b.subContinuations);
  if (aSubs.length !== bSubs.length) return false;
  for (const name of aSubs) {
    const aRecord = a.subContinuations[name];
    const bRecord = b.subContinuations[name];
    if (!aRecord || !bRecord) return false;
    // beginPos is deliberately not compared here: it's an absolute code
    // position, so it legitimately differs between the old parse and a
    // resumed-after-edit one even when their *future* behavior is
    // identical (the carry decision it gates is relative to whichever
    // parse is asking, and stays consistent once frames/buffer/openScopes
    // - already compared above and below - agree).
    if (!framesEqual(aRecord.frames, bRecord.frames)) return false;
  }
  return true;
}

/**
 * @param {{ idx: number, beginMatch: string | undefined }[]} a
 * @param {{ idx: number, beginMatch: string | undefined }[]} b
 */
function framesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const af = /** @type {{ idx: number, beginMatch: string | undefined }} */ (
      a[i]
    );
    const bf = /** @type {{ idx: number, beginMatch: string | undefined }} */ (
      b[i]
    );
    if (af.idx !== bf.idx || af.beginMatch !== bf.beginMatch) return false;
  }
  return true;
}

/**
 * Default gap between line checkpoints. Matches the spirit of
 * `tokenized-document`'s interval: denser than its windowed default (100)
 * so mid-document edits still resume nearby, sparse enough that a 10k-line
 * file stores O(hundreds) of snapshots rather than O(lines).
 */
export const CHECKPOINT_INTERVAL = 32;

/**
 * Full parse with a line checkpoint every `CHECKPOINT_INTERVAL` lines (and
 * always at the document end). First paint or language change.
 *
 * The whole document is loaded up front and stepped through with
 * `advance()` rather than `append()`-ed line by line: each append forces
 * the engine to re-flatten the grown string and rescan every rule whose
 * cached miss it invalidated, which made this O(lines x length).
 * @param {Registry} registry
 * @param {string} language
 * @param {string} code
 * @returns {IncrementalParse}
 */
export function parseIncremental(registry, language, code) {
  const session = registry.createSession(language, { from: { code } });
  const checkpoints = [session.snapshot()];
  let linesSinceCheckpoint = 0;
  // Only newline-terminated lines are tokenized before finish(): a lexeme
  // ending at an unterminated tail may grow with the next keystroke, so no
  // checkpoint can be taken past it (`append()` stages such text likewise).
  let fedEnd = 0;
  for (let lineStart = 0; lineStart < code.length; ) {
    const newline = code.indexOf("\n", lineStart);
    linesSinceCheckpoint++;
    if (newline === -1) break;
    lineStart = fedEnd = newline + 1;
    if (linesSinceCheckpoint >= CHECKPOINT_INTERVAL) {
      session.advance(fedEnd);
      checkpoints.push(session.snapshot());
      linesSinceCheckpoint = 0;
    }
  }
  session.advance(fedEnd);
  // Always retain an end checkpoint so resume can land on the final state
  // even when the last interval is incomplete.
  if (linesSinceCheckpoint > 0 || checkpoints.length === 1) {
    checkpoints.push(session.snapshot());
  }
  const { events } = session.finish();
  return { code, language, events, checkpoints };
}

/**
 * Latest checkpoint at or before `maxPos`. Checkpoint `pos` can lag behind the
 * line it was recorded on when a construct needs more lookahead (multi-line
 * strings, etc.), so checkpoint index and line number are not 1:1.
 * @param {Snapshot[]} checkpoints
 * @param {number} maxPos
 */
function findResumeIndex(checkpoints, maxPos) {
  let lo = 0;
  let hi = checkpoints.length - 1;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const checkpoint = /** @type {Snapshot} */ (checkpoints[mid]);
    if (checkpoint.pos <= maxPos) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/**
 * Re-tokenizes `code` given the previous parse of the same language.
 * @param {Registry} registry
 * @param {string} language
 * @param {IncrementalParse} previous
 * @param {string} code
 * @returns {IncrementalParse}
 */
export function reparseIncremental(registry, language, previous, code) {
  if (previous.language !== language) {
    return parseIncremental(registry, language, code);
  }
  if (code === previous.code) return previous;

  const diff = diffText(previous.code, code);
  const resumeIndex = findResumeIndex(previous.checkpoints, diff.start);
  const resumeCheckpoint = /** @type {Snapshot} */ (
    previous.checkpoints[resumeIndex]
  );

  // Prefix up to the resume checkpoint is unchanged (within diffText's common
  // prefix). restore() clears the session event log, so reattach prefix events
  // separately.
  const prefixEvents = previous.events.slice(0, resumeCheckpoint.eventCount);
  // The full document is loaded so the tail can be walked with `advance()`
  // (see parseIncremental); tokenization still only proceeds line by line.
  const session = registry.createSession(language, {
    from: { code, snapshot: resumeCheckpoint },
  });
  const checkpoints = previous.checkpoints.slice(0, resumeIndex + 1);

  // Earliest position where old and new code match from here on.
  const newSuffixStart = diff.start + diff.inserted.length;
  const posOffset = code.length - previous.code.length;

  let convergedAtOldIndex = -1;
  let oldIndex = resumeIndex;
  let linesSinceCheckpoint = 0;

  for (
    let li = 0, lineStart = resumeCheckpoint.pos;
    lineStart < code.length;
    li++
  ) {
    const newline = code.indexOf("\n", lineStart);
    // An unterminated tail is staged, not tokenized (see parseIncremental);
    // it still gets its own iteration so the final checkpoint is stored.
    const isTail = newline === -1;
    if (!isTail) {
      lineStart = newline + 1;
      session.advance(lineStart);
    }
    const isLast = isTail || lineStart === code.length;
    const snap = session.snapshot();
    linesSinceCheckpoint++;
    // Check every line for convergence against previous checkpoints.
    // Store every line for a window right after the edit (typing tends to
    // stay near the cursor, so a follow-up edit here resumes in O(1)
    // instead of walking to the next interval boundary), then fall back to
    // the sparse interval so density doesn't stay O(lines) further out.
    let shouldStore =
      li < CHECKPOINT_INTERVAL || linesSinceCheckpoint >= CHECKPOINT_INTERVAL;
    if (snap.pos >= newSuffixStart) {
      const targetOldPos = snap.pos - posOffset;
      while (
        oldIndex < previous.checkpoints.length - 1 &&
        /** @type {Snapshot} */ (previous.checkpoints[oldIndex]).pos <
          targetOldPos
      ) {
        oldIndex++;
      }
      const oldCheckpoint = previous.checkpoints[oldIndex];
      // Need matching position, not just state. Top-level state repeats
      // between statements; wrong position would splice an unrelated tail.
      if (
        oldCheckpoint &&
        oldCheckpoint.pos === targetOldPos &&
        stateConverges(snap, oldCheckpoint)
      ) {
        convergedAtOldIndex = oldIndex;
        shouldStore = true;
      }
    }
    if (!shouldStore && isLast) shouldStore = true;
    if (shouldStore) {
      // snap.eventCount is session-local; shift to index the combined array.
      checkpoints.push({
        ...snap,
        eventCount: snap.eventCount + prefixEvents.length,
      });
      linesSinceCheckpoint = 0;
    }
    if (convergedAtOldIndex >= 0 || isLast) break;
  }

  if (convergedAtOldIndex >= 0) {
    const oldCheckpoint = /** @type {Snapshot} */ (
      previous.checkpoints[convergedAtOldIndex]
    );
    const events = [
      ...prefixEvents,
      ...session.events(),
      ...previous.events.slice(oldCheckpoint.eventCount),
    ];
    const eventOffset =
      prefixEvents.length + session.events().length - oldCheckpoint.eventCount;
    for (
      let i = convergedAtOldIndex + 1;
      i < previous.checkpoints.length;
      i++
    ) {
      const old = /** @type {Snapshot} */ (previous.checkpoints[i]);
      checkpoints.push({
        ...old,
        pos: old.pos + posOffset,
        eventCount: old.eventCount + eventOffset,
      });
    }
    return { code, language, events, checkpoints };
  }

  const tail = session.finish();
  return {
    code,
    language,
    events: [...prefixEvents, ...tail.events],
    checkpoints,
  };
}
