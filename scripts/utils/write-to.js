import prettier from "prettier";
import { writeFile } from "./fs.js";
import path from "path";

const { format } = prettier;

const PARSER = {
  ".md": "markdown",
  ".js": "babel",
  ".ts": "typescript",
  ".json": "json",
  ".css": "css",
};

export async function writeTo(file, source) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);

  await writeFile(
    file,
    format(value, { parser: PARSER[path.parse(file).ext] })
  );
}
