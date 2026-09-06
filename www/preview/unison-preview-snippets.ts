export type UnisonPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const unisonPreviewSnippets: UnisonPreviewSnippet[] = [
  {
    title: "Doubling a list",
    description: "an ability declaration, a function, and a test",
    code: `-- doubles every element of a list
structural ability Stream where
  emit : Nat -> ()

use List map

double : [Nat] -> [Nat]
double xs = map (n -> n * 2) xs

test> double.tests.ex1 =
  match double [1, 2, 3] with
    [2, 4, 6] -> ok "matched"
    _ -> fail "no match"`,
  },
  {
    title: "Ability sets",
    description: "an ability set in a function signature",
    code: `main : '{IO, Exception} ()
main = do
  printLine "hello"`,
  },
  {
    title: "Doc literals",
    description: "the {{ }} doc literal syntax",
    code: `## double
{{ Doubles the given number. }}
double : Nat -> Nat
double n = n * 2`,
  },
];
