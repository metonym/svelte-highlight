/**
 * Shared fixtures for the mitata suites in this directory: a fully
 * registered engine registry plus real/synthetic code corpora. Kept
 * self-contained (not exported from src) since these are dev-only
 * benchmark inputs.
 *
 * The registry and corpus are both behind lazy, memoized async getters
 * (dynamic `import()` for the registry's ~250 language modules, `Bun.file`
 * reads for the corpus) so a suite that doesn't need them - e.g.
 * text-diff.bench.ts - can run standalone without paying for either.
 */
import { readdirSync } from "node:fs";
import type { createRegistry } from "../src/engine.js";

type Registry = ReturnType<typeof createRegistry>;

let cachedRegistry: Registry | undefined;

/** Registering all ~250 languages costs ~100ms; memoized across a single process. */
export async function buildRegistry(): Promise<Registry> {
  if (!cachedRegistry) {
    const engine = await import("../src/engine.js");
    const languagesModule = await import("../src/languages/index.js");
    const languages = languagesModule as unknown as Record<
      string,
      Parameters<typeof engine.registerAll>[1]
    >;
    const registry = engine.createRegistry();
    for (const language of Object.values(languages))
      engine.registerAll(registry, language);
    cachedRegistry = registry;
  }
  return cachedRegistry;
}

export async function concat(dir: string, filter: (name: string) => boolean) {
  const names = readdirSync(dir).filter(filter);
  const contents = await Promise.all(
    names.map((name) => Bun.file(`${dir}/${name}`).text()),
  );
  return contents.join("\n");
}

type Corpus = { javascript: string; css: string; markdown: string };

let cachedCorpus: Corpus | undefined;

/** Real-world corpora pulled from this repo, so results track this codebase's actual shape. */
export async function getCorpus(): Promise<Corpus> {
  if (!cachedCorpus) {
    cachedCorpus = {
      javascript: [
        await concat("src", (name) => name.endsWith(".js")),
        await concat("src", (name) => name.endsWith(".svelte")),
      ].join("\n"),
      css: await concat("src/styles", (name) => name.endsWith(".css")),
      markdown: [
        await Bun.file("README.md").text(),
        await Bun.file("SUPPORTED_LANGUAGES.md").text(),
      ].join("\n"),
    };
  }
  return cachedCorpus;
}

/** An n-line synthetic JS document with deterministic content, for scaling tests. */
export function jsLines(n: number) {
  const unit = [
    "function add(a, b) {",
    "  // sum two numbers",
    "  return a + b;",
    "}",
  ];
  const lines: string[] = [];
  for (let i = 0; i < n; i++) lines.push(`${unit[i % unit.length]} // ${i}`);
  return `${lines.join("\n")}\n`;
}

/** A synthetic JS document at least `minLength` characters long, for typing-simulation tests. */
export function jsSource(minLength: number) {
  const unit = "function add(a, b) {\n  return a + b; // comment\n}\n";
  let out = "";
  while (out.length < minLength) out += unit;
  return out.slice(0, minLength);
}

/** Slices `code` to a fixed length, wrapping around if it's shorter than `length`. */
export function sizedSlice(code: string, length: number) {
  if (code.length >= length) return code.slice(0, length);
  let out = code;
  while (out.length < length) out += code;
  return out.slice(0, length);
}
