export type WitPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const witPreviewSnippets: WitPreviewSnippet[] = [
  {
    title: "World with import and export",
    description: "package version, kebab-case paths, and func signatures",
    code: `package example:host@0.1.0;

world hello {
  import wasi:io/poll;
  export greet: func(name: string) -> string;
}`,
  },
  {
    title: "Records and variants",
    description: "interface types with list and kebab-case cases",
    code: `interface types {
  record person { name: string, age: u32 }
  variant error { not-found, other(string) }
  type names = list<string>;
}`,
  },
  {
    title: "Resource methods",
    description: "comments and resource constructors",
    code: `// file handle
interface files {
  resource descriptor {
    constructor(path: string);
    read: func() -> list<u8>;
  }
}`,
  },
];
