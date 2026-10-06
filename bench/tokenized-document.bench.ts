/**
 * TokenizedDocument's cold random access: jumping straight to the end of a
 * large document, the way HighlightVirtual's scrollToLine does. Everything
 * before the window has to be tokenized once, in checkpointInterval-line
 * batches, so this tracks how batch feeding scales with document length.
 */
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
