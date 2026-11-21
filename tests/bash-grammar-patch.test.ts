import hljsFactory from "highlight.js/lib/core";
import stockBash from "highlight.js/lib/languages/bash";
import patchedBash from "../scripts/hljs-patches/bash.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import bash from "../src/languages/bash.js";

// scripts/hljs-patches/bash.js: the `shellscript` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("bash", patchedBash.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("bash", stockBash);

const registry = createRegistry();
registry.register(bash.register);

const CODE = `#!/usr/bin/env bash
set -euo pipefail
for f in "$@"; do
  if [[ -f "$f" ]]; then
    echo "found: $f"
  fi
done`;

describe("bash grammar patch", () => {
  it("resolves shellscript to bash", () => {
    expect(resolveLanguageName("shellscript")).toBe("bash");
    expect(resolveLanguageName("SHELLSCRIPT")).toBe("bash");
  });

  it("highlights the same through the alias", () => {
    const expected = stock.highlight(CODE, { language: "bash" }).value;
    expect(registry.highlight(CODE, { language: "shellscript" }).value).toEqual(
      expected,
    );
  });

  it("does not change Bash output", () => {
    const expected = stock.highlight(CODE, { language: "bash" }).value;
    expect(hljs.highlight(CODE, { language: "bash" }).value).toEqual(expected);
    expect(registry.highlight(CODE, { language: "bash" }).value).toEqual(
      expected,
    );
  });
});
