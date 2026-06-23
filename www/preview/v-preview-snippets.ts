export type VlangPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const vPreviewSnippets: VlangPreviewSnippet[] = [
  {
    title: "Structs and methods",
    description: "structs, functions, and string interpolation",
    code: `module main

struct Point {
mut:
	x f64
	y f64
}

fn (p Point) distance() f64 {
	return p.x * p.x + p.y * p.y
}

fn main() {
	p := Point{x: 3.0, y: 4.0}
	println("distance = \${p.distance()}")
}`,
  },
  {
    title: "Options and matching",
    description: "option types, match, and enums",
    code: `enum Color {
	red
	green
	blue
}

fn parse(s string) ?Color {
	return match s {
		"red" { Color.red }
		"green" { Color.green }
		else { none }
	}
}`,
  },
];
