function formatMarkdown(content: string): string {
  // Normalize line endings
  let formatted = content.replace(/\r\n/g, "\n");

  // Remove trailing whitespace from each line
  formatted = formatted.replace(/[ \t]+$/gm, "");

  // Remove leading blank lines
  formatted = formatted.replace(/^\n+/, "");

  // Normalize blank lines: collapse 3+ consecutive newlines into exactly 2 newlines (one blank line)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Ensure file ends with single newline
  formatted = formatted.replace(/\n*$/, "\n");

  return formatted;
}

export async function writeTo(file: string, source: string | object) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);

  const content = file.endsWith(".md") ? formatMarkdown(value) : value;

  await Bun.write(file, content);
}
