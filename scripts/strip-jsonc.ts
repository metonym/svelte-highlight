const STRING_OR_COMMENT = /("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g;
const TRAILING_COMMA = /,(\s*[}\]])/g;

/** JSONC -> JSON: strips comments and trailing commas, leaving strings intact. */
export function stripJsonComments(text: string): string {
  const withoutComments = text.replace(
    STRING_OR_COMMENT,
    (_match, str) => str ?? "",
  );
  return withoutComments.replace(TRAILING_COMMA, "$1");
}
