export type GleamPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gleamPreviewSnippets: GleamPreviewSnippet[] = [
  {
    title: "Main with imports",
    description: "import, pub fn, and types",
    code: `import gleam/io
import gleam/int

pub fn main() -> Nil {
  let total = add(2, 3)
  io.println("Sum: " <> int.to_string(total))
}

fn add(a: Int, b: Int) -> Int {
  a + b
}`,
  },
  {
    title: "Custom types and case",
    description: "type definitions, constructors, and pattern matching",
    code: `pub type Shape {
  Circle(radius: Float)
  Square(side: Float)
}

pub fn area(shape: Shape) -> Float {
  case shape {
    Circle(r) -> 3.14 *. r *. r
    Square(s) -> s *. s
  }
}`,
  },
  {
    title: "Literals and externals",
    description: "True/False/Nil, number bases, and @external",
    code: `const enabled = True
const mask = 0xFF
const flags = 0b1010

@external(erlang, "rand", "uniform")
pub fn random() -> Float`,
  },
];
