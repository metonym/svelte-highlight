const STRING_OR_COMMENT = /("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g;
const TRAILING_COMMA = /,(\s*[}\]])/g;

/**
 * Strip `//` line comments, `/* *\/` block comments, and trailing commas
 * from JSONC text so it can be `JSON.parse`d. String literals are left
 * untouched even when they contain `//` or `/*`.
 */
export function stripJsonComments(text: string): string {
  const withoutComments = text.replace(
    STRING_OR_COMMENT,
    (_match, str) => str ?? "",
  );
  return withoutComments.replace(TRAILING_COMMA, "$1");
}
