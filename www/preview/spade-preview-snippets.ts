export type SpadePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const spadePreviewSnippets: SpadePreviewSnippet[] = [
  {
    title: "Blinky",
    description: "an expression-based counter that toggles an LED",
    code: `entity blinky(clk: clock, rst: bool) -> bool {
    let duration = 100_000_000;
    reg(clk) count: uint<28> reset(rst: 0) = if count == duration {
        0
    } else {
        trunc(count + 1)
    };
    count > duration / 2
}`,
  },
  {
    title: "Pipelined multiplier",
    description: "a one-stage pipeline with an explicit reg boundary",
    code: `pipeline(1) mul(clk: clock, x: int<18>, y: int<18>) -> int<36> {
    let result = x * y;
  reg;
    result
}`,
  },
  {
    title: "Enum with pattern matching",
    description: "variants carrying payloads, destructured with match",
    code: `enum Color {
    Red,
    Green,
    Blue,
    Gray{brightness: uint<8>},
    Custom{r: uint<8>, g: uint<8>, b: uint<8>}
}

fn to_rgb(color: Color) -> (uint<8>, uint<8>, uint<8>) {
    match color {
        Color::Red => (255, 0, 0),
        Color::Green => (0, 255, 0),
        Color::Blue => (0, 0, 255),
        Color::Gray(br) => (br, br, br),
        Color::Custom(r, g, b) => (r, g, b)
    }
}`,
  },
];
