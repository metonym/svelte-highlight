export type OdinPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const odinPreviewSnippets: OdinPreviewSnippet[] = [
  {
    title: "Procedures and structs",
    description: "proc declarations, types, and directives",
    code: `package main

import "core:fmt"

Vector2 :: struct {
	x, y: f32,
}

length :: proc(v: Vector2) -> f32 {
	return v.x * v.x + v.y * v.y
}

main :: proc() {
	v := Vector2{3, 4}
	fmt.println("length:", length(v))
}`,
  },
  {
    title: "Enums and switches",
    description: "enums, #partial switch, and literals",
    code: `Direction :: enum {
	North,
	East,
	South,
	West,
}

describe :: proc(d: Direction) -> string {
	#partial switch d {
	case .North: return "up"
	case .South: return "down"
	case: return "sideways"
	}
}`,
  },
];
