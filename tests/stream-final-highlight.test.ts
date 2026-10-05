import { createRegistry, registerAll } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import { createFinalHighlighter } from "../src/stream-final-highlight.js";

function streamedSession(code: string) {
  const registry = createRegistry();
  registerAll(registry, javascript);
  const session = registry.createSession("javascript");
  session.append(code);
  let finishCalls = 0;
  const finish = session.finish.bind(session);
  session.finish = (options) => {
    finishCalls++;
    return finish(options);
  };
  return { registry, session, finishCalls: () => finishCalls };
}

describe("createFinalHighlighter", () => {
  it("matches a one-shot highlight", () => {
    const code = "const a = 1;\n/* multi\nline */\nlet b = 2;\n";
    const { registry, session } = streamedSession(code);
    expect(
      createFinalHighlighter().highlight(session, code, "javascript"),
    ).toBe(registry.highlight(code, { language: "javascript" }).value);
  });

  it("re-parses only when the fed code or language changes", () => {
    const code = "let x = 1;\n";
    const { session, finishCalls } = streamedSession(code);
    const final = createFinalHighlighter();
    const first = final.highlight(session, code, "javascript");
    expect(final.highlight(session, code, "javascript")).toBe(first);
    expect(finishCalls()).toBe(1);

    session.append("x++;\n");
    final.highlight(session, `${code}x++;\n`, "javascript");
    expect(finishCalls()).toBe(2);

    final.highlight(session, `${code}x++;\n`, "js");
    expect(finishCalls()).toBe(3);
  });
});
