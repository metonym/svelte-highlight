import { createRegistry, registerAll } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import { createFinalHighlighter } from "../src/stream-final-highlight.js";

function countingRegistry() {
  const registry = createRegistry();
  registerAll(registry, javascript);
  let highlightCalls = 0;
  const counted = {
    highlight(code: string, options: { language: string }) {
      highlightCalls++;
      return registry.highlight(code, options);
    },
  };
  return { registry, counted, highlightCalls: () => highlightCalls };
}

describe("createFinalHighlighter", () => {
  it("matches a streamed session's canonical finish", () => {
    const code = "const a = 1;\n/* multi\nline */\nlet b = 2;\n";
    const { registry } = countingRegistry();
    const session = registry.createSession("javascript");
    session.append(code);
    expect(
      createFinalHighlighter().highlight(registry, code, "javascript"),
    ).toBe(session.finish({ canonicalize: true }).value);
  });

  it("re-parses only when the code or language changes", () => {
    const code = "let x = 1;\n";
    const { counted, highlightCalls } = countingRegistry();
    const final = createFinalHighlighter();
    const first = final.highlight(counted, code, "javascript");
    expect(final.highlight(counted, code, "javascript")).toBe(first);
    expect(highlightCalls()).toBe(1);

    final.highlight(counted, `${code}x++;\n`, "javascript");
    expect(highlightCalls()).toBe(2);

    final.highlight(counted, `${code}x++;\n`, "js");
    expect(highlightCalls()).toBe(3);
  });
});
