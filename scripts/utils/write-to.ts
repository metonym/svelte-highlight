import path from "node:path";
import prettier, { type BuiltInParserName } from "prettier";

const PARSER: Record<string, BuiltInParserName> = {
  ".md": "markdown",
  ".js": "babel",
  ".ts": "typescript",
  ".json": "json",
  ".css": "css",
};

export async function writeTo(file: string, source: string | object) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);
  const parser = PARSER[path.parse(file).ext];

  if (!parser) throw new Error(`No parser found for ${file}`);

  await Bun.write(file, await prettier.format(value, { parser }));
}
