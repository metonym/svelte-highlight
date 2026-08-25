export type MojoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const mojoPreviewSnippets: MojoPreviewSnippet[] = [
  {
    title: "Typed function",
    description: "fn, Int, and a return type",
    code: `fn add(x: Int, y: Int) -> Int:
    return x + y`,
  },
  {
    title: "Struct with inout init",
    description: "var fields and borrowed/owned params",
    code: `struct Point:
    var x: Float64
    fn __init__(inout self, x: Float64):
        self.x = x`,
  },
  {
    title: "Owned value",
    description: "comments and string fields",
    code: `# origin
struct Label:
    var name: String
    fn take(owned self):
        pass`,
  },
];
