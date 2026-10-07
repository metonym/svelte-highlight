import {
  LEADING_NEWLINES,
  MULTIPLE_NEWLINES,
  TRAILING_NEWLINES,
  TRAILING_WHITESPACE,
  WINDOWS_LINE_ENDING,
} from "./regexes.ts";

function formatMarkdown(content: string): string {
  return content
    .replace(WINDOWS_LINE_ENDING, "\n")
    .replace(TRAILING_WHITESPACE, "")
    .replace(LEADING_NEWLINES, "")
    .replace(MULTIPLE_NEWLINES, "\n\n")
    .replace(TRAILING_NEWLINES, "\n");
}

export async function writeTo(file: string, source: string | object) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);

  const content = file.endsWith(".md") ? formatMarkdown(value) : value;

  await Bun.write(file, content);
}
