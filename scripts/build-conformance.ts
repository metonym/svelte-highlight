// Writes `spec/corpus.json`: code samples with the events the reference
// engine produces for them, for other hosts to check against. Run it when
// a grammar or engine change is meant to change output, and review the
// diff. See `spec/ENGINE.md`.

import { createRegistry, registerAll } from "../src/engine.js";
import type { ScopeEvent } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import { SAMPLES } from "../tests/detection-corpus.ts";
import { CUSTOM_SNIPPETS } from "../tests/differential-corpus.ts";

export type CompactEvent = string | [string] | 0;

/** `TEXT` as its string, `OPEN` as `[scope]`, `CLOSE` as `0`, text merged. */
export function compactEvents(events: ScopeEvent[]): CompactEvent[] {
  const out: CompactEvent[] = [];
  for (const event of events) {
    if (event.t === 0) {
      const last = out.length - 1;
      if (typeof out[last] === "string") out[last] += event.v;
      else out.push(event.v);
    } else {
      out.push(event.t === 1 ? [event.s] : 0);
    }
  }
  return out;
}

/** A registry with every bundled language, as the corpus assumes. */
export function corpusRegistry() {
  const registry = createRegistry();
  for (const language of allLanguages) registerAll(registry, language);
  return registry;
}

/** The samples, sorted, each language at most once per source. */
export function corpusSamples() {
  const byKey = new Map<string, { language: string; code: string }>();
  for (const [source, samples] of [
    ["detect", SAMPLES],
    ["custom", CUSTOM_SNIPPETS],
  ] as const) {
    for (const [language, code] of Object.entries(samples)) {
      byKey.set(`${language}\u0000${source}`, { language, code });
    }
  }
  return [...byKey.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, sample]) => sample);
}

export function buildCorpus() {
  const registry = corpusRegistry();
  const tokenize = corpusSamples().map(({ language, code }) => ({
    language,
    code,
    events: compactEvents(registry.tokenize(code, language).events),
  }));
  const detect = Object.values(SAMPLES).map((code) => {
    const { language, relevance } = registry.tokenizeAuto(code);
    return { code, language: language ?? null, relevance };
  });
  return {
    events: "TEXT is a string, OPEN is [scope], CLOSE is 0",
    tokenize,
    detect,
  };
}

if (import.meta.main) {
  const corpus = buildCorpus();
  await Bun.write("spec/corpus.json", `${JSON.stringify(corpus, null, 1)}\n`);
  console.log(
    `spec/corpus.json: ${corpus.tokenize.length} tokenize cases, ${corpus.detect.length} detect cases`,
  );
}
