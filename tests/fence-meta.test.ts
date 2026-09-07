import { parseMeta } from "../src/fence.js";

describe("parseMeta", () => {
  it("parses a bare {ranges} as mark state", () => {
    expect(parseMeta("{1,3-5}")).toEqual({
      lines: { 1: "mark", 3: "mark", 4: "mark", 5: "mark" },
    });
  });

  it("parses ins={ranges}", () => {
    expect(parseMeta("ins={2,4}")).toEqual({
      lines: { 2: "ins", 4: "ins" },
    });
  });

  it("parses del={ranges}", () => {
    expect(parseMeta("del={6-7}")).toEqual({
      lines: { 6: "del", 7: "del" },
    });
  });

  it("parses mark={ranges} (explicit alias of bare {ranges})", () => {
    expect(parseMeta("mark={1}")).toEqual({
      lines: { 1: "mark" },
    });
  });

  it("combines mark=, ins=, and del= directives", () => {
    expect(parseMeta("mark={1} ins={2} del={3}")).toEqual({
      lines: { 1: "mark", 2: "ins", 3: "del" },
    });
  });

  it("parses title=", () => {
    expect(parseMeta('title="app.ts"')).toEqual({
      lines: {},
      title: "app.ts",
    });
  });

  it("parses the bare showLineNumbers flag", () => {
    expect(parseMeta("showLineNumbers")).toEqual({
      lines: {},
      showLineNumbers: true,
    });
  });

  it("parses a realistic string combining every directive", () => {
    expect(parseMeta('title="app.ts" {1,3-5} ins={7} showLineNumbers')).toEqual(
      {
        lines: { 1: "mark", 3: "mark", 4: "mark", 5: "mark", 7: "ins" },
        title: "app.ts",
        showLineNumbers: true,
      },
    );
  });

  it("resolves a line named by multiple directives to whichever appears later", () => {
    expect(parseMeta("{1} del={1}")).toEqual({
      lines: { 1: "del" },
    });
    expect(parseMeta("del={1} {1}")).toEqual({
      lines: { 1: "mark" },
    });
  });

  it("returns an empty result for an empty string", () => {
    expect(parseMeta("")).toEqual({ lines: {} });
  });

  it("ignores unrelated/unknown tokens interspersed with recognized ones", () => {
    expect(parseMeta('foo={1} bar {2} baz="qux" ins={3}')).toEqual({
      lines: { 2: "mark", 3: "ins" },
    });
  });
});
