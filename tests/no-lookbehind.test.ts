import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Lookbehind assertions ((?<=...) / (?<!...)) throw a SyntaxError at RegExp
// *compile* time on Safari < 16.4 and other older engines, meaning
// hljs.registerLanguage for the offending grammar crashes the page at
// registration rather than merely mis-highlighting. highlight.js core
// avoids lookbehind for exactly this reason, so custom grammars must too.
const GRAMMARS_DIR = path.join(__dirname, "../scripts/custom-languages");

const grammarFiles = readdirSync(GRAMMARS_DIR).filter((file) =>
  file.endsWith(".js"),
);

test("custom grammars have at least one file to check", () => {
  expect(grammarFiles.length).toBeGreaterThan(0);
});

for (const file of grammarFiles) {
  test(`${file} does not use regex lookbehind`, () => {
    const source = readFileSync(path.join(GRAMMARS_DIR, file), "utf8");

    expect(source).not.toContain("(?<=");
    expect(source).not.toContain("(?<!");
  });
}
