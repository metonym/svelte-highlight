/**
 * Known bug report (not yet fixed): `Tokenizer.subContinuations` in
 * `src/engine.js` is keyed only by sub-language *name*, scoped to the
 * outer tokenizer's whole lifetime. It's meant to let a single embedded
 * region resume across separate `flush()` calls (e.g. streaming edits via
 * `HighlightStream`/`HighlightEditable`, restored via `snapshot()`/
 * `restore()`), but nothing distinguishes "resuming this exact region"
 * from "this is a brand-new, unrelated region that happens to embed the
 * same sub-language" within one static, single-shot `tokenize()` call.
 *
 * Symptom: in one markdown document, an *earlier* embedded region whose
 * sub-tokenizer parse ends mid-state (e.g. inside what its grammar
 * considers an open tag) can leak that leftover frame stack into a
 * *later*, textually unrelated region that happens to embed the same
 * sub-language — the later region incorrectly resumes from the earlier
 * one's leftover state instead of starting fresh, diverging from hljs
 * (which has no such statefulness for a one-shot parse).
 *
 * This reproduction needs no theming-PR content: an ATX heading with a
 * backtick code span containing `*` reaches markdown's embedded-tag
 * `subLanguage: "xml"` rule in a way that leaves `subContinuations["xml"]`
 * populated; a later, textually independent fenced block that also
 * resolves to the "xml" embedding (any block whose language tag isn't a
 * registered alias falls back to markdown's default inline-HTML
 * embedding) then incorrectly inherits that leftover state.
 *
 * Root-cause fix belongs in `src/engine.js`'s sub-language continuation
 * scoping (e.g. tagging each embedding occurrence so only a genuine
 * same-occurrence resume reuses `subContinuations`, while preserving it
 * across snapshot()/restore() for real streaming) — out of scope for this
 * report. Remove `.failing` once that fix lands; if this test starts
 * passing on its own, `it.failing` will fail and say so.
 */
import coreFactory from "highlight.js/lib/core";
import markdown from "highlight.js/lib/languages/markdown";
import { createRegistry, registerAll, renderHtml } from "../src/engine.js";
import * as languages from "../src/languages/index.js";

const hljs = coreFactory.newInstance();
hljs.registerLanguage("markdown", markdown);

const registry = createRegistry();
for (const language of Object.values(languages)) {
  registerAll(registry, language);
}

// An unrelated heading elsewhere in the document primes
// `subContinuations["xml"]` with a leftover open-tag frame.
const PRIMING_HEADING = "### The `--shl-*` variable contract";

// A textually independent fenced block (language tag not registered, so
// it falls back to markdown's default inline-HTML "xml" embedding) that
// should tokenize identically whether or not it's preceded by unrelated
// content elsewhere in the document.
const UNRELATED_FENCED_BLOCK = [
  "## Svelte Syntax Highlighting",
  "",
  "```svelte",
  "<script>",
  "  const code = `<button on:click={() => {}}>Increment</button>`;",
  "</script>",
  "```",
].join("\n");

describe("markdown embedded-sublanguage state leak (known bug)", () => {
  it.failing("an unrelated block's fenced content tokenizes the same with or without an earlier priming heading", () => {
    const withoutPriming = UNRELATED_FENCED_BLOCK;
    const withPriming = `${PRIMING_HEADING}\n\n${UNRELATED_FENCED_BLOCK}`;

    const isolated = renderHtml(
      registry.tokenize(withoutPriming, "markdown").events,
    );
    const primed = renderHtml(
      registry.tokenize(withPriming, "markdown").events,
    );

    // The unrelated block's own rendered slice should be identical
    // regardless of what unrelated content precedes it in the document.
    expect(primed.endsWith(isolated)).toBe(true);
  });

  it.failing("matches real hljs on the combined document (the actual user-facing symptom)", () => {
    const code = `${PRIMING_HEADING}\n\n${UNRELATED_FENCED_BLOCK}`;
    const expected = hljs.highlight(code, {
      language: "markdown",
      ignoreIllegals: true,
    }).value;
    const actual = renderHtml(registry.tokenize(code, "markdown").events);
    expect(actual).toBe(expected);
  });
});
