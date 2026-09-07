import { fromTextMate } from "../src/textmate-theme.js";
import { stripJsonComments } from "./strip-jsonc.ts";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error(
    "usage: bun scripts/import-textmate-theme.ts <theme.jsonc> [out.json]",
  );
  process.exit(1);
}

const raw = await Bun.file(inputPath).text();
const parsed = JSON.parse(stripJsonComments(raw));
const palette = fromTextMate(parsed, { onWarn: console.warn });
const output = JSON.stringify(palette, null, 2);

if (outputPath) {
  await Bun.write(outputPath, output);
} else {
  console.log(output);
}
