/**
 * Regression test for a state leak that used to exist in
 * `Tokenizer.subContinuations` (`src/engine.js`): it's keyed by
 * sub-language *name* and scoped to the outer tokenizer's whole lifetime,
 * so a single embedded region can resume across separate `flush()` calls
 * (e.g. streaming edits via `HighlightStream`/`HighlightEditable`,
 * restored via `snapshot()`/`restore()`). Without a per-occurrence guard,
 * nothing distinguished "resuming this exact region" from "a brand-new,
 * unrelated region that happens to embed the same sub-language" within
 * one static, single-shot `tokenize()` call.
 *
 * Symptom (fixed): in markdown, raw inline HTML (`<tag ...>`) is embedded
 * as "xml" (see `src/languages/markdown.js`'s `begin: "<\\/?[A-Za-z_]",
 * end: ">"` rule). An *earlier* such tag whose content confuses the xml
 * sub-tokenizer into ending mid-state (e.g. a `>` appearing inside what
 * xml still considers an open attribute value) used to leak that leftover
 * frame stack into a *later*, textually unrelated tag elsewhere in the
 * document — the later tag would incorrectly resume from the earlier
 * one's leftover state instead of parsing fresh, diverging from hljs
 * (which has no such statefulness for a one-shot parse). Fixed by tagging
 * each embedding occurrence with the code position (`beginPos`) its frame
 * began at, and only reusing a carried continuation when that position
 * matches — preserved across `snapshot()`/`restore()` so real streaming
 * continuation still works.
 *
 * (Separately, an *unrelated* pre-existing divergence exists for inline
 * HTML nested inside a markdown heading whose emphasis never closes -
 * hljs suppresses the xml embedding there and this engine doesn't. That's
 * a markdown grammar-conversion fidelity gap, not a `subContinuations`
 * leak, and is out of scope here.)
 */
import { createRegistry, registerAll, renderHtml } from "../src/engine.js";
import * as languages from "../src/languages/index.js";

const registry = createRegistry();
for (const language of Object.values(languages)) {
  registerAll(registry, language);
}

// An earlier inline tag whose `>` lands inside an xml-unterminated
// attribute value, so its embedded xml sub-parse ends with an open frame -
// primes `subContinuations["xml"]` with that leftover state.
const PRIMING_LINE =
  'Some prose with <div data-x="unterminated> and more text.';

// A later, textually independent inline tag that should parse fresh
// regardless of what unrelated tags came before it.
const UNRELATED_LINE = "More prose with <span>hello</span> and more.";

describe("markdown embedded-sublanguage state leak (regression)", () => {
  it("an unrelated tag's HTML tokenizes the same with or without an earlier priming tag", () => {
    const isolated = renderHtml(
      registry.tokenize(UNRELATED_LINE, "markdown").events,
    );
    const primed = renderHtml(
      registry.tokenize(`${PRIMING_LINE}\n\n${UNRELATED_LINE}`, "markdown")
        .events,
    );

    // The unrelated line's own rendered slice should be identical
    // regardless of what unrelated content precedes it in the document.
    expect(primed.endsWith(isolated)).toBe(true);
  });

  it("parses the later tag's name/attr structure instead of treating it as a continued string", () => {
    const code = `${PRIMING_LINE}\n\n${UNRELATED_LINE}`;
    const html = renderHtml(registry.tokenize(code, "markdown").events);

    // Leaked continuation used to render "<span>" as one hljs-string
    // token (still "inside" the first tag's unterminated attribute)
    // instead of a fresh tag with its own name/punctuation scopes.
    expect(html).toContain('<span class="hljs-name">span</span>');
    expect(html).not.toContain('<span class="hljs-string">&lt;span&gt;</span>');
  });
});
