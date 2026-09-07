/**
 * computeStagedTailPreview() must produce byte-identical HTML to a
 * from-scratch highlight of the same prefix, at every chunk boundary - the
 * mid-line checkpoint resume path (see src/stream-preview.js) is only a
 * perf optimization and must never change output.
 */
import { createRegistry, extendLines } from "../src/engine.js";
import bash from "../src/languages/bash.js";
import javascript from "../src/languages/javascript.js";
import json from "../src/languages/json.js";
import { computeStagedTailPreview } from "../src/stream-preview.js";

const registry = createRegistry();
registry.register(bash.register);
registry.register(javascript.register);
registry.register(json.register);

/**
 * Feeds `code` into a fresh session in chunks of `chunkSize`, asserting
 * after every chunk that the helper's committed-plus-preview HTML equals a
 * one-shot highlight of the exact prefix fed so far.
 */
function assertMatchesOneShotAtEveryChunk(
  language: string,
  code: string,
  chunkSize: number,
) {
  const session = registry.createSession(language);
  let fedCode = "";
  let finalizedOpenScopes: string[] = [];
  let finalizedPendingHtml = "";
  let renderedCommittedCount = 0;
  const committedLines: string[] = [];
  let cache: Parameters<typeof computeStagedTailPreview>[0]["cache"];

  for (let i = 0; i < code.length; i += chunkSize) {
    session.append(code.slice(i, i + chunkSize));
    fedCode += code.slice(i, i + chunkSize);

    const committed = session.events();
    if (committed.length > renderedCommittedCount) {
      const result = extendLines(
        committed.slice(renderedCommittedCount),
        finalizedOpenScopes,
        finalizedPendingHtml,
      );
      committedLines.push(...result.completedLines);
      finalizedPendingHtml = result.pendingHtml;
      finalizedOpenScopes = result.openScopes;
      renderedCommittedCount = committed.length;
    }

    const preview = computeStagedTailPreview({
      registry,
      language,
      session,
      fedCode,
      openScopes: finalizedOpenScopes,
      pendingHtml: finalizedPendingHtml,
      cache,
    });
    cache = preview.cache;

    const actual =
      committedLines.length === 0
        ? preview.previewLines.join("\n")
        : `${committedLines.join("\n")}\n${preview.previewLines.join("\n")}`;
    const expected = registry.highlight(fedCode, { language }).value;

    expect(actual).toBe(expected);
  }
}

describe("computeStagedTailPreview", () => {
  it("matches a one-shot highlight at every chunk (json)", () => {
    // Long enough to cross LOOKAHEAD_MARGIN (256 chars) several times over,
    // short enough that comparing against a fresh one-shot highlight at
    // every single chunk boundary - O(n^2) by construction of this test,
    // not of the code under test - doesn't risk the runner's per-test
    // timeout on a loaded machine.
    const items = Array.from({ length: 120 }, (_, i) => `"item-${i}":${i}`);
    const code = `{${items.join(",")}}`;
    for (const chunkSize of [1, 5, 37]) {
      assertMatchesOneShotAtEveryChunk("json", code, chunkSize);
    }
  }, 30000);

  it("matches a one-shot highlight at every chunk (javascript, open template literal)", () => {
    const code =
      // biome-ignore lint/suspicious/noTemplateCurlyInString: this is JS source text being tokenized, not an interpolation
      "const s = `hello ${a + b} world, streaming keeps going without a closing backtick just yet, then it closes here`;\n" +
      "const done = true;\n";
    for (const chunkSize of [1, 5, 37]) {
      assertMatchesOneShotAtEveryChunk("javascript", code, chunkSize);
    }
  });

  it("matches a one-shot highlight at every chunk (bash, heredoc)", () => {
    const code =
      "cat <<'EOF' > output.txt\n" +
      "some heredoc body text that spans a couple of lines\n" +
      "and continues here\n" +
      "EOF\n" +
      "echo done\n";
    for (const chunkSize of [1, 5, 13]) {
      assertMatchesOneShotAtEveryChunk("bash", code, chunkSize);
    }
  });
});
