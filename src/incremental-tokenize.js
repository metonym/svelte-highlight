/**
 * Incremental re-tokenization for editors: resume from the checkpoint before
 * an edit and stop once tokenizer state re-converges with the previous parse,
 * reusing its tail. Falls back to parsing to the end when it never converges.
 */
import { diffText } from "./text-diff.js";

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 */

/**
 * `events[0, head)` and the last `tail` events are the same objects as in
 * `from`, so consumers can find the changed span without comparing arrays.
 * @typedef {{
 *   from: ScopeEvent[],
 *   head: number,
 *   tail: number,
 * }} EventReuse
 */

/**
 * Counts of leading/trailing events identical in both arrays (never
 * overlapping); O(document) unless `reuse` is relative to `prevEvents`.
 * @param {ScopeEvent[]} prevEvents
 * @param {ScopeEvent[]} events
 * @param {EventReuse} [reuse]
 * @returns {{ prefix: number, suffix: number }}
 */
export function sharedEvents(prevEvents, events, reuse) {
  if (reuse !== undefined && reuse.from === prevEvents) {
    return { prefix: reuse.head, suffix: reuse.tail };
  }
  const prevCount = prevEvents.length;
  const count = events.length;
  const shared = Math.min(prevCount, count);
  let prefix = 0;
  while (prefix < shared && prevEvents[prefix] === events[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < shared - prefix &&
    prevEvents[prevCount - 1 - suffix] === events[count - 1 - suffix]
  ) {
    suffix++;
  }
  return { prefix, suffix };
}

/**
 * @typedef {{
 *   code: string,
 *   language: string,
 *   events: ScopeEvent[],
 *   checkpoints: Snapshot[],
 *   reuse?: EventReuse,
 * }} IncrementalParse
 */

/**
 * Whether two checkpoints will emit the same events from here on.
 * `relevance`/`kwHits` are excluded: they only affect detection scoring.
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
    // beginPos is an absolute position, so it differs after an edit even
    // when future behavior is identical; deliberately not compared.
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

/** Lines between checkpoints: dense enough to resume near an edit, sparse enough to not store O(lines) snapshots. */
export const CHECKPOINT_INTERVAL = 32;

/** Minimum characters past the resume checkpoint for which scans are windowed. */
const WINDOWED_MIN_TAIL = 8192;

/**
 * Full parse with a checkpoint every `CHECKPOINT_INTERVAL` lines and at the
 * end. Loads the whole document and steps with `advance()`: `append()`-ing
 * line by line re-flattens and rescans each time, O(lines x length).
 * @param {Registry} registry
 * @param {string} language
 * @param {string} code
 * @returns {IncrementalParse}
 */
export function parseIncremental(registry, language, code) {
  const session = registry.createSession(language, { from: { code } });
  const checkpoints = [session.snapshot()];
  let linesSinceCheckpoint = 0;
  // Only newline-terminated lines are tokenized before finish(): a lexeme in
  // an unterminated tail may grow with the next keystroke.
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
  if (linesSinceCheckpoint > 0 || checkpoints.length === 1) {
    checkpoints.push(session.snapshot());
  }
  const { events } = session.finish();
  return { code, language, events, checkpoints };
}

/**
 * Index of the latest checkpoint at or before `maxPos`. A checkpoint's `pos`
 * can lag its line (multi-line lookahead), so index and line aren't 1:1.
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
 * Pushes `source[from..]` onto `target`; avoids spreading, which copies the
 * O(document) prefix twice.
 * @param {ScopeEvent[]} target
 * @param {ScopeEvent[]} source
 * @param {number} from
 */
function appendEvents(target, source, from) {
  for (let i = from; i < source.length; i++) {
    target.push(/** @type {ScopeEvent} */ (source[i]));
  }
}

/**
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

  // Events before the resume checkpoint are unchanged and reattached below.
  const prefixLength = resumeCheckpoint.eventCount;
  // The parse usually re-converges within a few lines, so window scans over a
  // long tail (else a rule with no nearby match scans to the end). Over a
  // short tail plain scans are cheaper than the windowing bookkeeping.
  const session = registry.createSession(language, {
    from: {
      code,
      snapshot: resumeCheckpoint,
      windowed: code.length - resumeCheckpoint.pos > WINDOWED_MIN_TAIL,
    },
  });
  const checkpoints = previous.checkpoints.slice(0, resumeIndex + 1);

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
    // An unterminated tail isn't tokenized, but still gets an iteration so
    // the final checkpoint is stored.
    const isTail = newline === -1;
    if (!isTail) {
      lineStart = newline + 1;
      session.advance(lineStart);
    }
    const isLast = isTail || lineStart === code.length;
    const snap = session.snapshot();
    linesSinceCheckpoint++;
    // Store every line just after the edit (follow-up typing resumes in
    // O(1)), then fall back to the sparse interval.
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
      // Position must match too: top-level state repeats between statements.
      if (
        oldCheckpoint &&
        oldCheckpoint.pos === targetOldPos &&
        stateConverges(snap, oldCheckpoint)
      ) {
        convergedAtOldIndex = oldIndex;
        shouldStore = true;
      }
    }
    if (isLast) shouldStore = true;
    if (shouldStore) {
      // snap.eventCount is session-local; shift to the combined array.
      checkpoints.push({
        ...snap,
        eventCount: snap.eventCount + prefixLength,
      });
      linesSinceCheckpoint = 0;
    }
    if (convergedAtOldIndex >= 0 || isLast) break;
  }

  if (convergedAtOldIndex >= 0) {
    const oldCheckpoint = /** @type {Snapshot} */ (
      previous.checkpoints[convergedAtOldIndex]
    );
    const events = previous.events.slice(0, prefixLength);
    appendEvents(events, session.events(), 0);
    appendEvents(events, previous.events, oldCheckpoint.eventCount);
    const eventOffset =
      prefixLength + session.events().length - oldCheckpoint.eventCount;
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
    const reuse = {
      from: previous.events,
      head: prefixLength,
      tail: previous.events.length - oldCheckpoint.eventCount,
    };
    return { code, language, events, checkpoints, reuse };
  }

  const tail = session.finish();
  const events = previous.events.slice(0, prefixLength);
  appendEvents(events, tail.events, 0);
  const reuse = { from: previous.events, head: prefixLength, tail: 0 };
  return { code, language, events, checkpoints, reuse };
}
