/**
 * stream-preview.js on a stream with no newline for a long stretch (streamed
 * single-line JSON, minified code, a long log line). `computeStagedTailPreview`
 * resumes from the last completed newline on every call, so re-feeding a
 * ~200 KB single-line document in small chunks re-tokenizes the whole open
 * line each time: O(line length) per call, O(n^2) over the stream. The
 * one-shot `registry.highlight` case is the reference point a fixed-cost
 * preview should approach.
 */
import { group, task } from "ostia";
import { computeStagedTailPreview } from "../src/stream-preview.js";
import { buildRegistry } from "./_shared.ts";

const registry = await buildRegistry();
const LANGUAGE = "json";
const CHUNK_SIZE = 1_000;

/** A single-line ~200 KB JSON array; no newline until the very last byte. */
function longLineJson(targetLength: number) {
  const items: string[] = [];
  let length = 2; // "[]"
  let i = 0;
  while (length < targetLength) {
    const item = JSON.stringify({
      id: i,
      name: `item-${i}`,
      active: i % 2 === 0,
      tags: ["a", "b", "c"],
      nested: { value: i * 2, ratio: i / 3 },
    });
    items.push(item);
    length += item.length + 1; // + comma
    i++;
  }
  return `[${items.join(",")}]`;
}

const code = longLineJson(200_000);

/** Feeds `code` through the streaming preview helper in fixed-size chunks,
 * exactly as HighlightStream's repaint() drives stream-preview.js on every
 * animation frame while a chunk is streaming in. */
function streamPreview() {
  const session = registry.createSession(LANGUAGE);
  let fedCode = "";
  const openScopes: string[] = [];
  const pendingHtml = "";
  let cache: Parameters<typeof computeStagedTailPreview>[0]["cache"];

  for (let i = 0; i < code.length; i += CHUNK_SIZE) {
    const chunk = code.slice(i, i + CHUNK_SIZE);
    session.append(chunk);
    fedCode += chunk;

    // No newline completes until the final byte, so `session.events()`
    // never grows and openScopes/pendingHtml never advance from their
    // initial state - the worst case for a from-newline preview.
    ({ cache } = computeStagedTailPreview({
      registry,
      language: LANGUAGE,
      session,
      fedCode,
      openScopes,
      pendingHtml,
      cache,
    }));
  }
}

group("stream-preview.js: 200 KB single-line JSON, 1 KB chunks", () => {
  task("computeStagedTailPreview() per chunk", () => streamPreview());
  task("reference: one-shot registry.highlight()", () =>
    registry.highlight(code, { language: LANGUAGE }),
  );
});

// Run this suite with `ostia bench --isolate bench/stream-long-line.bench.ts`
// for a fast feedback loop; `bun run bench` runs every *.bench.ts suite for a
// full-baseline run.
