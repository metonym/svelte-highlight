/** Shared bench fixtures, lazily loaded so suites that don't need them skip the cost. */
import { readdirSync } from "node:fs";
import type { createRegistry } from "../src/engine.js";

type Registry = ReturnType<typeof createRegistry>;

let cachedRegistry: Registry | undefined;

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

/** Real-world corpora from this repo. */
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

export function jsSource(minLength: number) {
  const unit = "function add(a, b) {\n  return a + b; // comment\n}\n";
  let out = "";
  while (out.length < minLength) out += unit;
  return out.slice(0, minLength);
}

/** Repeats `code` as needed to reach exactly `length`. */
export function sizedSlice(code: string, length: number) {
  if (code.length >= length) return code.slice(0, length);
  let out = code;
  while (out.length < length) out += code;
  return out.slice(0, length);
}

/** Chat-reply-shaped Markdown: `fenceCount` prose+fence pairs, padded with prose. */
export function markdownWithFences(minLength: number, fenceCount: number) {
  const codeUnit = "function add(a, b) {\n  return a + b;\n}\n";
  const proseUnit =
    "Here is some explanatory prose about the snippet that follows, sized " +
    "roughly like a chat response segment between fenced code blocks.\n\n";

  let out = "";
  for (let i = 0; i < fenceCount; i++) {
    out += proseUnit;
    out += `\`\`\`js\n${codeUnit.repeat(3)}\`\`\`\n\n`;
  }
  while (out.length < minLength) out += proseUnit;
  return out;
}

/**
 * `text` with a deterministic edit about every `every` lines: a changed
 * line, an inserted line, or a deleted line, in turn.
 */
export function scatterEdits(text: string, every: number) {
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const kind = i % every === every - 1 ? ((i / every) % 3) | 0 : -1;
    if (kind === 0) out.push(`${line} // edited`);
    else if (kind === 1) out.push(line, "  // inserted line");
    else if (kind !== 2) out.push(line);
  }
  return out.join("\n");
}
