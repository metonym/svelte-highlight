import prettier from "prettier";
import path from "path";
import { writeFile } from "./fs.js";

const { format } = prettier;

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

  await writeFile(
    file,
    format(value, { parser: PARSER[path.parse(file).ext] })
  );
}
