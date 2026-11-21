import hljsFactory from "highlight.js/lib/core";
import stockHandlebars from "highlight.js/lib/languages/handlebars";
import patchedHandlebars from "../scripts/hljs-patches/handlebars.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import handlebars from "../src/languages/handlebars.js";

// scripts/hljs-patches/handlebars.js: the `mustache` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("handlebars", patchedHandlebars.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("handlebars", stockHandlebars);

const registry = createRegistry();
registry.register(handlebars.register);

const CODE = `<h1>{{title}}</h1>
{{#items}}
  <li>{{name}}: {{{description}}}</li>
{{/items}}
{{^items}}<p>No items.</p>{{/items}}
{{! a comment }}`;

describe("handlebars grammar patch", () => {
  it("resolves mustache to handlebars", () => {
    expect(resolveLanguageName("mustache")).toBe("handlebars");
    expect(resolveLanguageName("MUSTACHE")).toBe("handlebars");
  });

  it("highlights the same through the alias", () => {
    const expected = stock.highlight(CODE, { language: "handlebars" }).value;
    expect(registry.highlight(CODE, { language: "mustache" }).value).toEqual(
      expected,
    );
  });

  it("does not change Handlebars output", () => {
    const expected = stock.highlight(CODE, { language: "handlebars" }).value;
    expect(hljs.highlight(CODE, { language: "handlebars" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "handlebars" }).value).toEqual(
      expected,
    );
  });
});
