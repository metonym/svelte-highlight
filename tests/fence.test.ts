import { highlightFence } from "../src/fence.js";

describe("highlightFence", () => {
  it("wraps every line in <span class=\"line\"> when no meta is given", async () => {
    const html = await highlightFence({
      code: "const a = 1;\nconst b = 2;",
      lang: "javascript",
    });

    expect(html.match(/<span class="line">/g)).toHaveLength(2);
    expect(html).not.toContain("data-line-state");
    expect(html).toContain('<pre class="hljs" data-language="javascript">');
    expect(html).toContain('<code class="hljs">');
  });

  it("marks only the targeted line for a bare {n} range", async () => {
    const html = await highlightFence({
      code: "const a = 1;\nconst b = 2;\nconst c = 3;",
      lang: "javascript",
      meta: "{2}",
    });

    const lines = html.match(/<span class="line"[^>]*>/g) ?? [];
    expect(lines).toEqual([
      '<span class="line">',
      '<span class="line" data-line-state="mark">',
      '<span class="line">',
    ]);
  });

  it("supports ins= and del= together", async () => {
    const html = await highlightFence({
      code: "const a = 1;\nconst b = 2;",
      lang: "javascript",
      meta: "ins={1} del={2}",
    });

    const lines = html.match(/<span class="line"[^>]*>/g) ?? [];
    expect(lines).toEqual([
      '<span class="line" data-line-state="ins">',
      '<span class="line" data-line-state="del">',
    ]);
  });

  it("adds data-title from title=", async () => {
    const html = await highlightFence({
      code: "const a = 1;",
      lang: "javascript",
      meta: 'title="x.ts"',
    });

    expect(html).toContain('data-title="x.ts"');
  });

  it("adds the data-show-line-numbers attribute for showLineNumbers", async () => {
    const html = await highlightFence({
      code: "const a = 1;",
      lang: "javascript",
      meta: "showLineNumbers",
    });

    expect(html).toContain('data-show-line-numbers="true"');
  });

  it("rejects with Unknown language for an unresolvable lang", async () => {
    await expect(
      highlightFence({ code: "x", lang: "not-a-real-language" }),
    ).rejects.toThrow('Unknown language: "not-a-real-language"');
  });

  it("preserves a multi-token, multi-scope line's text when tags are stripped", async () => {
    const line = "const x: number = 1 + 2; // a comment";
    const html = await highlightFence({
      code: line,
      lang: "typescript",
    });

    const stripped = html.replace(/<[^>]+>/g, "");
    expect(stripped).toBe(line);
  });
});
