/**
 * `scripts/build-detect-index.ts` invariants that the build log alone
 * doesn't gate: output determinism and the 40 KB size budget (see
 * `scripts/build-detect-index.ts`'s `SIZE_BUDGET_BYTES`).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildDetectIndex } from "../scripts/build-detect-index.ts";
import allLanguages from "../src/languages/all.js";

const DETECT_INDEX_PATH = join(
  import.meta.dir,
  "..",
  "src/languages/detect-index.js",
);
const SIZE_BUDGET_BYTES = 40 * 1024;

function buildIrByName() {
  const irByName = new Map();
  for (const language of allLanguages)
    irByName.set(language.name, language.register);
  return irByName;
}

describe("build-detect-index", () => {
  it("is deterministic: the same grammar IR produces a byte-identical file across runs", async () => {
    const irByName = buildIrByName();

    await buildDetectIndex(irByName);
    const first = readFileSync(DETECT_INDEX_PATH, "utf8");

    await buildDetectIndex(irByName);
    const second = readFileSync(DETECT_INDEX_PATH, "utf8");

    expect(second).toBe(first);
  });

  it("stays within the 40 KB size budget", () => {
    const bytes = Buffer.byteLength(
      readFileSync(DETECT_INDEX_PATH, "utf8"),
      "utf8",
    );
    expect(bytes).toBeLessThanOrEqual(SIZE_BUDGET_BYTES);
  });

  it("entries are sorted by language name", async () => {
    const { default: detectIndex } = await import(
      `../src/languages/detect-index.js?t=${Math.random()}`
    );
    const names = detectIndex.map(
      (entry: [string, unknown, unknown]) => entry[0],
    );
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("skips disableAutodetect grammars entirely", async () => {
    const disabledNames = allLanguages
      .filter((language) => language.register.disableAutodetect)
      .map((language) => language.name);
    expect(disabledNames.length).toBeGreaterThan(0);

    const { default: detectIndex } = await import(
      `../src/languages/detect-index.js?t=${Math.random()}`
    );
    const indexedNames = new Set(
      detectIndex.map((entry: [string, unknown, unknown]) => entry[0]),
    );
    for (const name of disabledNames)
      expect(indexedNames.has(name)).toBe(false);
  });
});
