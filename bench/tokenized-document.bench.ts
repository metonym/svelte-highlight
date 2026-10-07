/** TokenizedDocument cold jump to the end (scrollToLine), tokenizing everything before it. */
import { group, task } from "ostia";
import typescript from "../src/languages/typescript.js";
import { createTokenizedDocument } from "../src/tokenized-document.js";
import { generateTypeScript } from "../www/components/HighlightVirtual/generate-large-code.js";

group("TokenizedDocument: jump to the end", () => {
  for (const lineCount of [20_000, 80_000]) {
    const code = generateTypeScript(lineCount);
    task(`${lineCount.toLocaleString()} lines`, () => {
      const doc = createTokenizedDocument({ language: typescript });
      doc.setCode(code);
      return doc.lineRange(lineCount - 30, lineCount);
    });
  }
});
