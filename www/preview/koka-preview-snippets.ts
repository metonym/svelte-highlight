export type KokaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kokaPreviewSnippets: KokaPreviewSnippet[] = [
  {
    title: "Effects and handlers",
    description: "an effect declaration, an effect type, and a handler",
    code: `// prints a greeting with an effect
effect ctl ask() : int

fun greet() : <ask,console> ()
  val name = ask()
  println("Hello, " ++ name.show)

fun main()
  handle(greet)
    ctl ask() -> resume(42)
`,
  },
  {
    title: "Pattern matching",
    description: "match with the Just/Nothing literals",
    code: `fun describe(x : maybe<int>) : string
  match x
    Just(n) -> "got " ++ n.show
    Nothing -> "nothing"`,
  },
  {
    title: "Trailing lambdas",
    description: "a function passed as a trailing block",
    code: `fun main()
  [1, 2, 3].map fn(x)
    x * 2`,
  },
];
