export type Json5PreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const json5PreviewSnippets: Json5PreviewSnippet[] = [
  {
    title: "Config with comments",
    description: "line/block comments, unquoted keys, trailing commas",
    code: `{
  // build configuration
  name: "svelte-highlight",
  version: "1.0.0",
  /* feature flags */
  features: {
    fastMode: true,
    legacy: false,
  },
}`,
  },
  {
    title: "Numbers and literals",
    description: "hex, floats, signs, Infinity and NaN",
    code: `{
  hex: 0xDECAF,
  float: -3.14,
  leading: .5,
  exponent: 6.022e23,
  positive: +42,
  infinity: Infinity,
  notANumber: NaN,
  nothing: null,
}`,
  },
  {
    title: "Strings and keys",
    description: "single- or double-quoted strings and bare keys",
    code: `{
  'single-quoted': 'hello',
  "double-quoted": "world",
  unquoted: "value",
  nested: { a: 1, b: 2 },
  list: ["GET", "POST", "PUT"],
}`,
  },
];
