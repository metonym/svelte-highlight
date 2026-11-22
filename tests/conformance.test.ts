// @depends-on scripts/build-conformance.ts
// @reads spec/corpus.json
/**
 * The reference engine must reproduce `spec/corpus.json`, the conformance
 * corpus other hosts check against. When a change is meant to alter
 * output, regenerate it with `bun scripts/build-conformance.ts` and review
 * the diff.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildCorpus,
  type CompactEvent,
  compactEvents,
  corpusRegistry,
} from "../scripts/build-conformance.ts";

type Corpus = {
  tokenize: { language: string; code: string; events: CompactEvent[] }[];
  detect: { code: string; language: string | null; relevance: number }[];
};

const corpus: Corpus = JSON.parse(
  readFileSync(path.join(import.meta.dir, "../spec/corpus.json"), "utf8"),
);
const registry = corpusRegistry();

test("covers the current samples", () => {
  const fresh = buildCorpus();
  expect(
    corpus.tokenize.map(({ language, code }) => ({ language, code })),
  ).toEqual(fresh.tokenize.map(({ language, code }) => ({ language, code })));
  expect(corpus.detect.map(({ code }) => code)).toEqual(
    fresh.detect.map(({ code }) => code),
  );
});

describe("tokenize", () => {
  test.each(corpus.tokenize.map((c) => [c.language, c] as const))(
    "%s",
    (_language, { language, code, events }) => {
      expect(compactEvents(registry.tokenize(code, language).events)).toEqual(
        events,
      );
    },
  );
});

describe("detect", () => {
  test.each(corpus.detect.map((c, i) => [i, c] as const))(
    "sample %i",
    (_index, { code, language, relevance }) => {
      const result = registry.tokenizeAuto(code);
      expect({
        language: result.language ?? null,
        relevance: result.relevance,
      }).toEqual({ language, relevance });
    },
  );
});

test("compactEvents merges text and keeps scopes balanced", () => {
  expect(
    compactEvents([
      { t: 0, v: "a" },
      { t: 0, v: "b" },
      { t: 1, s: "keyword" },
      { t: 0, v: "fn" },
      { t: 2 },
    ]),
  ).toEqual(["ab", ["keyword"], "fn", 0]);
});
