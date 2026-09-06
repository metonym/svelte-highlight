export type RocPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const rocPreviewSnippets: RocPreviewSnippet[] = [
  {
    title: "Hello, world",
    description: "an app header, backpassing, and string interpolation",
    code: `app [main] { pf: platform "https://github.com/roc-lang/basic-cli" }

## Doubles a number
double = \\n -> n * 2

main =
    result <- Task.await (Stdout.line "Hello, $(name)!")
    when result is
        Ok _ -> Stdout.line "done"
        Err _ -> crash "failed"`,
  },
  {
    title: "Pattern matching",
    description: "when/is with Ok and Err tags",
    code: `describe = \\num ->
    when num is
        0 -> "zero"
        n if n < 0 -> "negative"
        _ -> "positive"`,
  },
  {
    title: "Pipelines",
    description: "the |> operator chaining function calls",
    code: `total =
    [1, 2, 3]
    |> List.map (\\n -> n * 2)
    |> List.sum`,
  },
];
