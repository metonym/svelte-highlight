import hljs from "highlight.js/lib/core";
import type { LanguageType } from "svelte-highlight";
import * as languages from "../src/languages";

const STRIP_RELEVANCE_SCORE = /\|\d+$/;

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

function extractKeywords(compiledKeywords: unknown): string[] {
  if (!compiledKeywords) return [];

  if (typeof compiledKeywords === "string") {
    return compiledKeywords.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(compiledKeywords)) {
    return compiledKeywords.map(String);
  }

  const tokens: string[] = [];

  for (const [category, value] of Object.entries(
    compiledKeywords as Record<string, unknown>,
  )) {
    // `$pattern` configures the identifier regex, not a keyword list.
    if (category === "$pattern") continue;

    const list = typeof value === "string" ? value.split(/\s+/) : value;
    if (!Array.isArray(list)) continue;

    for (const token of list) {
      tokens.push(String(token).replace(STRIP_RELEVANCE_SCORE, ""));
    }
  }

  return tokens;
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

for (const language of sortedLanguages) {
  test(`golden snapshot: ${language.name}`, () => {
    hljs.registerLanguage(language.name, language.register);

    const compiled = hljs.getLanguage(language.name);
    const keywords = extractKeywords(compiled?.keywords);
    const sample = buildCanonicalSample(language.name, keywords);

    const result = hljs.highlight(sample, {
      language: language.name,
      ignoreIllegals: true,
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
