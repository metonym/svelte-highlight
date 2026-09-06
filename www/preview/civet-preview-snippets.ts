export type CivetPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const civetPreviewSnippets: CivetPreviewSnippet[] = [
  {
    title: "Declarations and comments",
    description: "the := declaration operator and block/line comments",
    code: `### block comment
describing this snippet ###
x := 1  # single-line comment
double := (n) -> n * 2
result := x |> double
unless result is 0
  console.log "not zero"
add := (a, b) => a + b
@name = "civet"`,
  },
  {
    title: "Word operators",
    description: "unless, until, loop, and isnt",
    code: `until count is 10
  count := count + 1

loop
  break unless active

if value isnt null and value is not 0
  process value`,
  },
  {
    title: "Pipe chains",
    description: "the |> operator chaining function calls",
    code: `result := [1, 2, 3]
  |> filter (n) -> n > 1
  |> map (n) -> n * 10
  |> reduce (a, b) -> a + b`,
  },
];
