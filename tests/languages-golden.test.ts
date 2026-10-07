import type { LanguageType } from "svelte-highlight";
import { createRegistry } from "../src/engine.js";
import * as languages from "../src/languages";

// A grammar with no keyword table (diff, json, markdown, ...) relies entirely
// on its `contains` rules, so it's probed with generic literal syntax instead.
const FALLBACK_SAMPLE = [
  "// comment",
  "\"string\" 'string' 123 3.14",
  "true false null",
  "/regex/ #hashtag @annotation",
].join("\n");

// A handful of grammars gate their keyword-bearing modes behind a structural
// anchor (e.g. a REPL prompt), so the raw keyword sample never reaches them
// without a prefix that satisfies that anchor first.
const SAMPLE_PREFIXES: Record<string, string> = {
  "erlang-repl": "1> ",
};

// Only the root state's keyword table is a representative sample; deeper
// states carry contextual tables (e.g. html's tag names inside a tag).
function extractKeywords({ register }: LanguageType<string>): string[] {
  const keywords = register.states[0]?.keywords;
  if (keywords === undefined) return [];
  if (typeof keywords === "object") return Object.keys(keywords);
  return (register.keywordTables?.[keywords] ?? []).flatMap(([, , words]) =>
    words.split(" "),
  );
}

// The grammar's own compiled keyword table doubles as a canonical sample:
// self-referential, requires no hand-authored fixtures, and is exactly the
// data that goes missing when a grammar silently regresses to plaintext.
function buildCanonicalSample(name: string, keywords: string[]) {
  const prefix = SAMPLE_PREFIXES[name] ?? "";
  const body =
    keywords.length > 0 ? keywords.slice(0, 40).join(" ") : FALLBACK_SAMPLE;
  return prefix + body;
}

const sortedLanguages = (
  Object.values(languages) as LanguageType<string>[]
).sort((a, b) => a.name.localeCompare(b.name));

const registry = createRegistry();
for (const language of sortedLanguages) registry.register(language.register);

for (const language of sortedLanguages) {
  test(`golden snapshot: ${language.name}`, () => {
    const keywords = extractKeywords(language);
    const sample = buildCanonicalSample(language.name, keywords);

    // The engine's render path always ignores `illegal` (matches hljs's
    // ignoreIllegals: true default; see src/engine.js).
    const result = registry.highlight(sample, {
      language: language.name,
    }).value;

    // Hard gate: if the grammar declares keywords, highlighting a sample
    // built from those very keywords must produce at least one hljs- span.
    // A silent regression to plaintext (e.g. an emptied keyword table)
    // fails this immediately instead of surfacing as a user bug report.
    if (keywords.length > 0) {
      expect(result).toContain('class="hljs-');
    }

    // Soft gate: track token-class drift for every grammar (including
    // keyword-less ones) so intentional upstream changes show as a
    // reviewable snapshot diff rather than going unnoticed.
    expect(result).toMatchSnapshot();
  });
}
