// @ts-check
import path from "path";
import prettier from "prettier";
import { writeFile } from "./fs.js";

const { format } = prettier;

/** @type {Record<string, import ("prettier").BuiltInParserName>} */
const PARSER = {
  ".md": "markdown",
  ".js": "babel",
  ".ts": "typescript",
  ".json": "json",
  ".css": "css",
};

/** @type {(file: string, source: object | string) => Promise<void>} */
export async function writeTo(file, source) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);
  const parser = PARSER[path.parse(file).ext];

  await writeFile(file, await format(value, { parser }));
}
