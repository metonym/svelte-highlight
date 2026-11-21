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
  {
    title: "Decorators and comptime",
    description: "@fieldwise_init, @parameter loops, and the read convention",
    code: `comptime WIDTH = 4

@fieldwise_init
struct Vec(Copyable, Movable):
    var data: List[Float64]

    @always_inline
    fn sum(read self) -> Float64:
        var total = 0.0
        @parameter
        for i in range(WIDTH):
            total += self.data[i]
        return total`,
  },
];
