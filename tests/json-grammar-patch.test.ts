import hljsFactory from "highlight.js/lib/core";
import stockJson from "highlight.js/lib/languages/json";
import patchedJson from "../scripts/hljs-patches/json.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import json from "../src/languages/json.js";

// scripts/hljs-patches/json.js: the `jsonl` and `ndjson` aliases.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("json", patchedJson.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("json", stockJson);

const registry = createRegistry();
registry.register(json.register);

const CODE = `{"id": 1, "event": "signup", "ok": true}
{"id": 2, "event": "login", "ok": false, "tags": ["web", null]}
{"id": 3, "event": "logout", "ms": 42.5}`;

describe("json grammar patch", () => {
  it("resolves jsonl to json", () => {
    expect(resolveLanguageName("jsonl")).toBe("json");
    expect(resolveLanguageName("JSONL")).toBe("json");
  });

  it("resolves ndjson to json", () => {
    expect(resolveLanguageName("ndjson")).toBe("json");
    expect(resolveLanguageName("NDJSON")).toBe("json");
  });

  it("highlights the same through each alias", () => {
    const expected = stock.highlight(CODE, { language: "json" }).value;
    expect(registry.highlight(CODE, { language: "jsonl" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "ndjson" }).value).toEqual(
      expected,
    );
  });

  it("does not change JSON output", () => {
    const expected = stock.highlight(CODE, { language: "json" }).value;
    expect(hljs.highlight(CODE, { language: "json" }).value).toEqual(expected);
    expect(registry.highlight(CODE, { language: "json" }).value).toEqual(
      expected,
    );
  });
});
