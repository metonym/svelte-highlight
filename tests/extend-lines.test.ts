import { createRegistry, extendLines, renderHtml } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import markdown from "../src/languages/markdown.js";
import { splitLines } from "../src/split-lines.js";

const registry = createRegistry();
registry.register(javascript.register);
registry.register(markdown.register);

const JS_CODE = `import { readFile } from "node:fs/promises";

/** Load config. TODO: cache this result */
export default async function load(path = "./config.json") {
  const raw = await readFile(path, "utf8");
  return raw.length;
}
`;

const MD_CODE = `# Title

Some *emphasis* and \`inline code\`.

\`\`\`js
const x = 1;
const y = 2;
\`\`\`

Done.
`;

/** Ground truth: one full render + split, exactly what today's HighlightStream did before this. */
function fullSplit(events: ReturnType<typeof registry.tokenize>["events"]) {
  return splitLines(renderHtml(events));
}

/** Feeds `events` to extendLines in chunks of `chunkSize`, collecting the same lines incrementally. */
function incrementalSplit(
  events: ReturnType<typeof registry.tokenize>["events"],
  chunkSize: number,
) {
  let openScopes: string[] = [];
  let pendingHtml = "";
  const lines: string[] = [];
  for (let i = 0; i < events.length; i += chunkSize) {
    const result = extendLines(
      events.slice(i, i + chunkSize),
      openScopes,
      pendingHtml,
    );
    lines.push(...result.completedLines);
    openScopes = result.openScopes;
    pendingHtml = result.pendingHtml;
  }
  lines.push(pendingHtml);
  return lines;
}

describe("extendLines matches renderHtml + splitLines at arbitrary chunk boundaries", () => {
  const cases: [string, string, string][] = [
    ["javascript", "javascript", JS_CODE],
    [
      "markdown (embeds javascript via a fenced code block)",
      "markdown",
      MD_CODE,
    ],
  ];

  for (const [label, language, code] of cases) {
    it(label, () => {
      const events = registry.tokenize(code, language).events;
      const expected = fullSplit(events);

      for (const chunkSize of [1, 2, 3, 7, 16, events.length]) {
        expect(incrementalSplit(events, chunkSize)).toEqual(expected);
      }
    });
  }

  it("event-per-call (the worst case for a streaming repaint loop)", () => {
    const events = registry.tokenize(JS_CODE, "javascript").events;
    expect(incrementalSplit(events, 1)).toEqual(fullSplit(events));
  });

  it("an empty event list is a no-op", () => {
    const result = extendLines([], [], "");
    expect(result).toEqual({
      completedLines: [],
      pendingHtml: "",
      openScopes: [],
    });
  });

  it("a scope open across the chunk boundary is carried and reopened correctly", () => {
    const events = registry.tokenize(
      "/* a\nmulti\nline\ncomment */\ncode();\n",
      "javascript",
    ).events;
    const expected = fullSplit(events);
    // Split mid-comment, one event at a time, so the "comment" scope has to
    // survive being carried across several extendLines calls.
    expect(incrementalSplit(events, 1)).toEqual(expected);
  });
});
