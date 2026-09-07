import { createRegistry } from "../src/engine.js";
import { CHECKPOINT_INTERVAL } from "../src/incremental-tokenize.js";
import javascript from "../src/languages/javascript.js";
import ruby from "../src/languages/ruby.js";

const registry = createRegistry();
registry.register(javascript.register);
registry.register(ruby.register);

/** Asserts a session's current state matches a one-shot parse of `finalCode`. */
function expectMatchesOneShot(
  session: ReturnType<typeof registry.createSession>,
  finalCode: string,
  language: string,
) {
  const oneShot = registry.highlight(finalCode, { language });
  expect(session.events()).toEqual(oneShot.events);
  expect(session.finish({ canonicalize: true }).value).toBe(oneShot.value);
}

describe("StreamSession#replace", () => {
  it("mid-document replace with no open construct", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;\n";
    const session = registry.createSession("javascript");
    session.append(code);

    const from = code.indexOf("const b = 2;");
    const to = from + "const b = 2;".length;
    const finalCode = `${code.slice(0, from)}const b = 22;${code.slice(to)}`;
    session.replace(from, to, "const b = 22;");

    expectMatchesOneShot(session, finalCode, "javascript");
  });

  it("replace as the session's very first edit (code loaded via `from`, not append)", () => {
    const code = "const a = 1;\nconst b = 2;\n";
    const session = registry.createSession("javascript", { from: { code } });

    const finalCode = code.replace("const a = 1;", "const a = 100;");
    session.replace(0, "const a = 1;".length, "const a = 100;");

    expectMatchesOneShot(session, finalCode, "javascript");
  });

  it("replace spanning into a still-open multi-line template literal (reconverges)", () => {
    const code = `const msg = \`line one
line two
line three\`;
const after = 1;
`;
    const session = registry.createSession("javascript");
    session.append(code);

    const from = code.indexOf("line one");
    const to = from + "line one".length;
    const finalCode = `${code.slice(0, from)}line ONE${code.slice(to)}`;
    session.replace(from, to, "line ONE");

    expectMatchesOneShot(session, finalCode, "javascript");
  });

  it("replace spanning into a still-open ruby heredoc (full-reparse fallback)", () => {
    const code = `def render
  <<~HTML
    <p>#{@title}</p>
  HTML
end
`;
    const session = registry.createSession("ruby");
    session.append(code);

    const from = code.indexOf("<<~HTML");
    const to = from + "<<~HTML".length;
    const finalCode = `${code.slice(0, from)}<<~HTML_EDITED${code.slice(to)}`;
    session.replace(from, to, "<<~HTML_EDITED");

    // A heredoc's terminator needs lookahead past what's tokenized so far,
    // same pre-existing limitation the plain append()-based session has
    // (see "ruby heredocs ... canonicalize on finish" in
    // engine-streaming.test.ts): session.events() mid-stream doesn't yet
    // reflect text past the still-open heredoc, only the canonical
    // finish() pass does.
    const oneShot = registry.highlight(finalCode, { language: "ruby" });
    expect(session.finish({ canonicalize: true }).value).toBe(oneShot.value);
  });

  it("two replace() calls in a row", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;\n";
    const session = registry.createSession("javascript");
    session.append(code);

    session.replace(
      code.indexOf("const a = 1;"),
      code.indexOf("const a = 1;") + "const a = 1;".length,
      "const a = 100;",
    );
    let finalCode = code.replace("const a = 1;", "const a = 100;");

    session.replace(
      finalCode.indexOf("const c = 3;"),
      finalCode.indexOf("const c = 3;") + "const c = 3;".length,
      "const c = 300;",
    );
    finalCode = finalCode.replace("const c = 3;", "const c = 300;");

    expectMatchesOneShot(session, finalCode, "javascript");
  });

  it("replace() followed by further append()", () => {
    const code = "const a = 1;\nconst b = 2;\n";
    const session = registry.createSession("javascript");
    session.append(code);

    session.replace(
      code.indexOf("const a = 1;"),
      code.indexOf("const a = 1;") + "const a = 1;".length,
      "const a = 100;",
    );
    const afterReplace = code.replace("const a = 1;", "const a = 100;");

    const more = "const d = 4;\n";
    session.append(more);
    const finalCode = afterReplace + more;

    expectMatchesOneShot(session, finalCode, "javascript");
  });

  it("replace() landing exactly on a CHECKPOINT_INTERVAL boundary", () => {
    let code = "";
    for (let i = 0; i < CHECKPOINT_INTERVAL * 2; i++) {
      code += `const v${i} = ${i};\n`;
    }
    const session = registry.createSession("javascript");
    session.append(code);

    const target = `const v${CHECKPOINT_INTERVAL} = ${CHECKPOINT_INTERVAL};`;
    const from = code.indexOf(target);
    const to = from + target.length;
    const replacement = `const v${CHECKPOINT_INTERVAL} = 999;`;
    const finalCode = `${code.slice(0, from)}${replacement}${code.slice(to)}`;
    session.replace(from, to, replacement);

    expectMatchesOneShot(session, finalCode, "javascript");
  });
});
