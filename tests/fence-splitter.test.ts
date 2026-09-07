import type { FenceSegment, MarkdownSegment } from "../src/fence.js";
import { createFenceSplitter } from "../src/fence.js";

function isFence(segment: MarkdownSegment): segment is FenceSegment {
  return segment.kind === "fence";
}

function stripIds(segments: readonly MarkdownSegment[]) {
  return segments.map(({ id, ...rest }) => rest);
}

/** All split points for short fixtures, every 7th offset for long ones. */
function splitPoints(text: string): number[] {
  const step = text.length < 200 ? 1 : 7;
  const points: number[] = [];
  for (let i = 1; i < text.length; i += step) points.push(i);
  return points;
}

const FIXTURES: Record<string, string> = {
  "prose only":
    "Hello there,\nthis is just some prose.\nNo fences here at all.\n",
  "one closed fence":
    "Before.\n\n```js\nconst x = 1;\nconsole.log(x);\n```\n\nAfter.\n",
  "two fences with prose between":
    "A\n\n```js\nconst a = 1;\n```\n\nB\n\n```py\nprint('hi')\n```\n\nC\n",
  "~~~ fence": "Text\n\n~~~python\nprint(1)\n~~~\n\nMore.\n",
  "four-backtick fence containing a three-backtick line":
    "````js\nconst s = `template`;\n```\nstill inside\n````\n\nDone.\n",
  "indented fence with indented content":
    "  ```js\n  const x = 1;\n    const y = 2;\n  ```\n",
  'info string with meta ts title="app.ts" {1,3}':
    '```ts title="app.ts" {1,3}\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```\n',
  "unterminated final fence": "Before.\n\n```js\nconst x = 1;\nstill going",
  "text ending inside an opening fence line": "Some prose.\n\n```ts",
};

describe("createFenceSplitter - fixture-driven exactness", () => {
  for (const [name, fixture] of Object.entries(FIXTURES)) {
    it(`"${name}" is chunking-invariant`, () => {
      const whole = createFenceSplitter();
      whole.set(fixture);
      const expected = stripIds(whole.segments());

      for (const point of splitPoints(fixture)) {
        const streamed = createFenceSplitter();
        streamed.append(fixture.slice(0, point));
        streamed.append(fixture.slice(point));

        expect(streamed.text()).toBe(fixture);
        expect(stripIds(streamed.segments())).toEqual(expected);
      }
    });
  }
});

describe("createFenceSplitter - id stability", () => {
  it("keeps earlier ids and object identity across a fence open/close via append", () => {
    const splitter = createFenceSplitter();
    splitter.append("Intro.\n\n```js\n");

    const introSegment = splitter.segments()[0];
    const openFence = splitter.segments()[1];
    expect(introSegment?.kind).toBe("text");
    expect(openFence?.kind).toBe("fence");
    expect((openFence as FenceSegment).open).toBe(true);

    splitter.append("const x = 1;\n```\n\nOutro.\n");
    const after = splitter.segments();

    expect(after[0]).toBe(introSegment); // same object, untouched
    expect(after[1]?.id).toBe(openFence?.id); // fence keeps growing under the same id
    expect((after[1] as FenceSegment).open).toBe(false);
    expect((after[1] as FenceSegment).code).toBe("const x = 1;");
    expect(after[2]?.kind).toBe("text");
    expect(after[2]?.id).not.toBe(introSegment?.id);
  });

  it("keeps all ids when set() only appends a tail", () => {
    const splitter = createFenceSplitter();
    splitter.set("```js\nconst x = 1;\n```\n");
    const beforeIds = splitter.segments().map((s) => s.id);

    splitter.set("```js\nconst x = 1;\n```\n\nMore text.\n");
    const afterIds = splitter.segments().map((s) => s.id);

    expect(afterIds.slice(0, beforeIds.length)).toEqual(beforeIds);
  });

  it("keeps the last fence's id when set() rewrites its code", () => {
    const splitter = createFenceSplitter();
    splitter.set("Intro.\n\n```js\nconst x = 1;\n```\n");
    const fenceId = splitter.segments().find(isFence)?.id;
    expect(fenceId).toBeDefined();

    splitter.set("Intro.\n\n```js\nconst x = 999;\n```\n");
    const fence = splitter.segments().find(isFence);

    expect(fence?.id).toBe(fenceId);
    expect(fence?.code).toBe("const x = 999;");
  });

  it("gives an earlier fence a new id when its info string changes, without touching ids before it", () => {
    const splitter = createFenceSplitter();
    splitter.set("A\n\n```js\ncode1\n```\n\nB\n\n```py\ncode2\n```\n");
    const before = splitter.segments();
    const textA = before[0];
    const fenceJs = before[1];

    splitter.set("A\n\n```ts\ncode1\n```\n\nB\n\n```py\ncode2\n```\n");
    const after = splitter.segments();

    expect(after[0]?.id).toBe(textA?.id);
    expect(after[1]?.id).not.toBe(fenceJs?.id);
    expect((after[1] as FenceSegment).lang).toBe("typescript");
  });
});

describe("createFenceSplitter - half-received opening line", () => {
  it("stays prose until the opening fence line's newline arrives", () => {
    const splitter = createFenceSplitter();
    splitter.append("```t");

    let segments = splitter.segments();
    expect(segments).toHaveLength(1);
    expect(segments[0]?.kind).toBe("text");
    expect((segments[0] as { text: string }).text).toBe("```t");
    const id = segments[0]?.id;

    splitter.append("s\n");
    segments = splitter.segments();
    expect(segments).toHaveLength(1);
    expect(segments[0]?.kind).toBe("fence");
    expect((segments[0] as FenceSegment).lang).toBe("typescript");
    // Same id across the prose -> fence transition: no remount ("flicker").
    expect(segments[0]?.id).toBe(id);
  });
});

describe("createFenceSplitter - resolveLanguageName integration", () => {
  it('resolves ```TS to "typescript"', () => {
    const splitter = createFenceSplitter();
    splitter.set("```TS\ncode\n```\n");
    const fence = splitter.segments()[0] as FenceSegment;
    expect(fence.lang).toBe("typescript");
  });

  it("leaves lang undefined for an unrecognized language, keeping info as-is", () => {
    const splitter = createFenceSplitter();
    splitter.set("```nope\ncode\n```\n");
    const fence = splitter.segments()[0] as FenceSegment;
    expect(fence.lang).toBeUndefined();
    expect(fence.info).toBe("nope");
  });
});

describe("createFenceSplitter - reset", () => {
  it("clears the buffer and restarts ids at 1", () => {
    const splitter = createFenceSplitter();
    splitter.set("```js\ncode\n```\n");
    splitter.reset();

    expect(splitter.text()).toBe("");
    expect(splitter.segments()).toEqual([]);

    splitter.set("prose");
    expect(splitter.segments()[0]?.id).toBe(1);
  });
});
