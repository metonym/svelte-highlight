/**
 * `detectLanguage` unions tier-0's candidates with `registry.listLanguages()`
 * before running the final relevance competition (see auto-detect.js), so a
 * user-registered custom grammar - absent from the generated fingerprint
 * table entirely - can still win. This is what preserves the spirit of the
 * old default behavior (every grammar statically registered, so customs
 * competed for free) without shipping every grammar to every browser.
 */

import { detectLanguage } from "../src/auto-detect.js";
import type { LanguageType } from "../src/languages/index.d.ts";
import { ensureRegistered, registry } from "../src/registry.js";

describe("detectLanguage: custom-grammar participation", () => {
  it("a custom language registered at runtime can win, despite no detect-index entry", async () => {
    const custom: LanguageType<"zorpscript"> = {
      name: "zorpscript",
      register: {
        name: "zorpscript",
        caseInsensitive: false,
        unicode: false,
        disableAutodetect: false,
        states: [
          {
            rules: [],
            keywords: {
              zorpfunction: ["keyword", 10],
              zorpreturn: ["keyword", 10],
            },
          },
        ],
      },
    };
    ensureRegistered(custom);

    const code = "zorpfunction main() {\n  zorpreturn 0\n}\n";
    const result = await detectLanguage(code);

    expect(result.language).toBe("zorpscript");
  });

  it("an explicit languageNames list still lets an already-registered custom win via the listLanguages() union", async () => {
    const code = "zorpfunction main() {\n  zorpreturn 0\n}\n";
    const result = await detectLanguage(code, { languageNames: ["python"] });

    expect(result.language).toBe("zorpscript");
    expect(registry.listLanguages()).toContain("zorpscript");
  });
});
