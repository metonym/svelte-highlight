import { stripJsonComments } from "../scripts/strip-jsonc.ts";

describe("stripJsonComments", () => {
  it("removes a // line comment", () => {
    const input = '{\n  "a": 1 // comment\n}';
    expect(JSON.parse(stripJsonComments(input))).toEqual({ a: 1 });
  });

  it("removes a /* */ block comment", () => {
    const input = '{\n  /* comment */\n  "a": 1\n}';
    expect(JSON.parse(stripJsonComments(input))).toEqual({ a: 1 });
  });

  it("removes a trailing comma before } and before ]", () => {
    const input = '{\n  "a": [1, 2,],\n  "b": 2,\n}';
    expect(JSON.parse(stripJsonComments(input))).toEqual({ a: [1, 2], b: 2 });
  });

  it("leaves // and /* sequences inside a quoted string value untouched", () => {
    const input = '{ "a": "http://example.com /* not a comment */" }';
    expect(JSON.parse(stripJsonComments(input))).toEqual({
      a: "http://example.com /* not a comment */",
    });
  });
});
