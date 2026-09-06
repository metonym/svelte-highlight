export type KclPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kclPreviewSnippets: KclPreviewSnippet[] = [
  {
    title: "A schema with validation",
    description: "a schema definition and a check block",
    code: `# a schema with a check block
schema Person:
    name: str
    age: int

    check:
        age >= 0, "age must be non-negative"

people = [Person {name = "Alice", age = 30}]
`,
  },
  {
    title: "Decorators",
    description: "the @deprecated and @info decorators",
    code: `@deprecated(version = "1.0", reason = "use Widget instead")
schema OldWidget:
    name: str`,
  },
  {
    title: "String interpolation",
    description: "interpolating a variable into a string",
    code: `name = "world"
greeting = "Hello, \${name}!"`,
  },
];
