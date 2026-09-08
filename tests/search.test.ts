import { createSearch } from "../src/search.js";

describe("createSearch", () => {
  it("matches case-insensitively by default", () => {
    const search = createSearch("Foo\nfoo\nFOO");
    search.query("foo");
    expect(search.count()).toBe(3);
  });

  it("narrows to exact case with caseSensitive", () => {
    const search = createSearch("Foo\nfoo\nFOO");
    search.query("foo", { caseSensitive: true });
    expect(search.count()).toBe(1);
    expect(search.matches()[0]).toEqual({ line: 1, start: 0, end: 3 });
  });

  it("narrows to whole words with wholeWord", () => {
    const search = createSearch("foo foobar foo");
    search.query("foo", { wholeWord: true });
    expect(search.count()).toBe(2);
  });

  it("compiles a regex pattern", () => {
    const search = createSearch("a1 b22 c333");
    search.query("\\d+", { regex: true });
    expect(search.matches().map((m) => [m.start, m.end])).toEqual([
      [1, 2],
      [4, 6],
      [8, 11],
    ]);
  });

  it("reports an error and zero matches for an invalid regex", () => {
    const search = createSearch("abc");
    search.query("(", { regex: true });
    expect(search.count()).toBe(0);
    expect(search.error()).toBeDefined();
  });

  it("reports an error and zero matches for a regex over 256 characters", () => {
    const search = createSearch("abc");
    search.query("a".repeat(300), { regex: true });
    expect(search.count()).toBe(0);
    expect(search.error()).toBeDefined();
  });

  it("wraps next()/prev() around a 3-match result", () => {
    const search = createSearch("foo foo foo");
    search.query("foo");
    expect(search.count()).toBe(3);

    expect(search.current()?.index).toBe(0);
    expect(search.next()?.index).toBe(1);
    expect(search.next()?.index).toBe(2);
    expect(search.next()?.index).toBe(0);
    expect(search.prev()?.index).toBe(2);
  });

  it("no-ops next()/prev() at zero matches", () => {
    const search = createSearch("abc");
    search.query("xyz");
    expect(search.next()).toBeUndefined();
    expect(search.prev()).toBeUndefined();
  });

  it("matches a string[] source's entries directly", () => {
    const search = createSearch(["const a = 1;", "const b = 2;"]);
    search.query("const");
    expect(search.count()).toBe(2);
    expect(search.matches().map((m) => m.line)).toEqual([0, 1]);
  });

  it("matches a TokenizedDocument source against its decoded plain text", () => {
    const doc = {
      lineCount: () => 1,
      lineRange: () => ['<span class="hljs-keyword">const</span> x = 1'],
    };
    const search = createSearch(doc);
    search.query("x = 1");
    expect(search.count()).toBe(1);
    expect(search.matches()[0]).toEqual({ line: 0, start: 6, end: 11 });
  });

  it("rescans only newly appended lines for a repeated query against a grown TokenizedDocument", () => {
    let lineCount = 100;
    const calls: Array<[number, number]> = [];
    const doc = {
      lineCount: () => lineCount,
      lineRange: (start: number, end: number) => {
        calls.push([start, end]);
        const lines: string[] = [];
        for (let i = start; i < end; i += 1) lines.push(`line ${i}`);
        return lines;
      },
    };

    const search = createSearch(doc);
    search.query("line");
    expect(search.count()).toBe(100);

    lineCount = 110;
    calls.length = 0;
    search.query("line");
    expect(search.count()).toBe(110);
    expect(calls[0]?.[0]).toBe(100);
  });

  it("setSource swaps results without re-touching the old source", () => {
    let touched = false;
    const oldSource = {
      lineCount: () => 1,
      lineRange: () => {
        touched = true;
        return ["foo"];
      },
    };

    const search = createSearch(oldSource);
    search.query("foo");
    expect(search.count()).toBe(1);

    touched = false;
    search.setSource("bar\nfoo");
    expect(touched).toBe(false);
    expect(search.count()).toBe(1);
    expect(search.matches()[0]?.line).toBe(1);
  });

  it("fires onChange and stops after unsubscribe", () => {
    const search = createSearch("foo");
    let calls = 0;
    const unsubscribe = search.onChange(() => {
      calls += 1;
    });

    search.query("foo");
    expect(calls).toBe(1);

    unsubscribe();
    search.query("bar");
    expect(calls).toBe(1);
  });
});
