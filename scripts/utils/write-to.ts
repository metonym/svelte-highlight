import {
  LEADING_NEWLINES,
  MULTIPLE_NEWLINES,
  TRAILING_NEWLINES,
  TRAILING_WHITESPACE,
  WINDOWS_LINE_ENDING,
} from "./regexes";

function formatMarkdown(content: string): string {
  // Normalize line endings
  let formatted = content.replace(WINDOWS_LINE_ENDING, "\n");

  // Remove trailing whitespace from each line
  formatted = formatted.replace(TRAILING_WHITESPACE, "");

  // Remove leading blank lines
  formatted = formatted.replace(LEADING_NEWLINES, "");

  // Normalize blank lines: collapse 3+ consecutive newlines into exactly 2 newlines (one blank line)
  formatted = formatted.replace(MULTIPLE_NEWLINES, "\n\n");

  // Ensure file ends with single newline
  formatted = formatted.replace(TRAILING_NEWLINES, "\n");

  return formatted;
}

export async function writeTo(file: string, source: string | object) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);

  const content = file.endsWith(".md") ? formatMarkdown(value) : value;

  await Bun.write(file, content);
}
