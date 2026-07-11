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
 * Splits `code` into chunks ending right after each "\n". Matches how
 * `Registry#createSession#append` consumes input.
 * @param {string} code
 * @returns {string[]}
 */
function splitKeepEnds(code) {
  /** @type {string[]} */
  const lines = [];
  let start = 0;
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === 10) {
      lines.push(code.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < code.length) lines.push(code.slice(start));
  return lines;
}

/**
 * Whether two checkpoints will emit the same events from here on.
 * `relevance`/`kwHits` are excluded; they only affect detection scoring.
 * @param {Snapshot} a
 * @param {Snapshot} b
 */
function stateConverges(a, b) {
  if (a.buffer !== b.buffer || a.openScopes !== b.openScopes) return false;
  if (a.frames.length !== b.frames.length) return false;
  for (let i = 0; i < a.frames.length; i++) {
    const af = /** @type {{ idx: number, beginMatch: string | undefined }} */ (
      a.frames[i]
    );
    const bf = /** @type {{ idx: number, beginMatch: string | undefined }} */ (
      b.frames[i]
    );
    if (af.idx !== bf.idx || af.beginMatch !== bf.beginMatch) return false;
  }
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
    const aFrames = aRecord.frames;
    const bFrames = bRecord.frames;
    if (aFrames.length !== bFrames.length) return false;
    for (let i = 0; i < aFrames.length; i++) {
      const af =
        /** @type {{ idx: number, beginMatch: string | undefined }} */ (
          aFrames[i]
        );
      const bf =
        /** @type {{ idx: number, beginMatch: string | undefined }} */ (
          bFrames[i]
        );
      if (af.idx !== bf.idx || af.beginMatch !== bf.beginMatch) return false;
    }
  }
  return true;
}

/**
 * Full parse with a line checkpoint after every line. First paint or language
 * change.
 * @param {Registry} registry
 * @param {string} language
 * @param {string} code
 * @returns {IncrementalParse}
 */
export function parseIncremental(registry, language, code) {
  const session = registry.createSession(language);
  const checkpoints = [session.snapshot()];
  for (const line of splitKeepEnds(code)) {
    session.append(line);
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
  const prefixCode = code.slice(0, resumeCheckpoint.pos);
  const prefixEvents = previous.events.slice(0, resumeCheckpoint.eventCount);
  const session = registry.createSession(language, {
    from: { code: prefixCode, snapshot: resumeCheckpoint },
  });
  const checkpoints = previous.checkpoints.slice(0, resumeIndex + 1);

  // Earliest position where old and new code match from here on.
  const newSuffixStart = diff.start + diff.inserted.length;
  const posOffset = code.length - previous.code.length;

  const newLines = splitKeepEnds(code.slice(resumeCheckpoint.pos));
  let convergedAtOldIndex = -1;
  let oldIndex = resumeIndex;

  for (const line of newLines) {
    session.append(line);
    const snap = session.snapshot();
    // snap.eventCount is session-local; shift to index the combined array.
    checkpoints.push({
      ...snap,
      eventCount: snap.eventCount + prefixEvents.length,
    });

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
        break;
      }
    }
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
