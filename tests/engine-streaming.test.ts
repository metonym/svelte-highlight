/**
 * Hard assertions on the properties the engine architecture is *for*:
 * serializable IR, streaming, and checkpoint/resume. Promotes the
 * equivalent checks in prototypes/engine/engine.test.ts onto the shipped
 * src/engine.js + generated src/languages/* modules.
 */
import { createRegistry } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import markdown from "../src/languages/markdown.js";
import ruby from "../src/languages/ruby.js";

const registry = createRegistry();
registry.register(javascript.register);
registry.register(markdown.register);
registry.register(ruby.register);

const JS_CODE = `import { x } from "y";
/* block
   comment */
export function add(a = 1, b = 2) {
  const s = \`sum \${a + b}\`;
  return s.length > 3 ? a : b;
}
`;

const RUBY_CODE = `def render
  <<~HTML
    <p>#{@title}</p>
  HTML
end
`;

describe("IR is plain data", () => {
  it("JSON round-trips with identical output", () => {
    const cloned = createRegistry();
    cloned.register(JSON.parse(JSON.stringify(ruby.register)));
    expect(cloned.highlight(RUBY_CODE, { language: "ruby" }).value).toBe(
      registry.highlight(RUBY_CODE, { language: "ruby" }).value,
    );
  });
});

describe("streaming sessions", () => {
  // Grammars without multi-line lookahead stream exactly.
  const exact: [string, string][] = [
    ["javascript", JS_CODE],
    [
      "markdown",
      "# Hi\n\nSome `code` and *emphasis*.\n\n```js\nlet a = 1;\n```\n",
    ],
  ];

  for (const [language, code] of exact) {
    it(`chunked ${language} === one-shot (arbitrary split points)`, () => {
      const oneShot = registry.highlight(code, { language }).value;
      for (const size of [1, 3, 7, 16]) {
        const session = registry.createSession(language);
        for (let i = 0; i < code.length; i += size) {
          session.append(code.slice(i, i + size));
        }
        expect(session.finish().value).toBe(oneShot);
      }
    });
  }

  it("ruby heredocs (multi-line lookahead) canonicalize on finish", () => {
    const oneShot = registry.highlight(RUBY_CODE, { language: "ruby" }).value;
    const session = registry.createSession("ruby");
    for (let i = 0; i < RUBY_CODE.length; i += 3) {
      session.append(RUBY_CODE.slice(i, i + 3));
    }
    // provisional parse can't see the heredoc terminator before it arrives;
    // one canonical O(n) pass at the end restores exactness
    expect(session.finish({ canonicalize: true }).value).toBe(oneShot);
  });
});

describe("checkpoint / resume", () => {
  it("resuming from a snapshot yields the same tail events", () => {
    const oneShot = registry.tokenize(JS_CODE, "javascript");

    const session = registry.createSession("javascript");
    const half = Math.floor(JS_CODE.length / 2);
    // feed up to a line boundary before the midpoint, then snapshot
    const cut = JS_CODE.lastIndexOf("\n", half) + 1;
    session.append(JS_CODE.slice(0, cut));
    const snap = session.snapshot();
    const prefixEvents = session.events().slice(0, snap.eventCount);

    // a brand-new tokenizer, restored from the serialized snapshot
    const resumed = registry.resume(
      JS_CODE,
      "javascript",
      JSON.parse(JSON.stringify(snap)),
    );

    expect([...prefixEvents, ...resumed.events]).toEqual(oneShot.events);
  });
});
