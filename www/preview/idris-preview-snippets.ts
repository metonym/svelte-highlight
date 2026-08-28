export type IdrisPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const idrisPreviewSnippets: IdrisPreviewSnippet[] = [
  {
    title: "Module and a total function",
    description: "module header, a type signature, and a case expression",
    code: `module Main

total
double : Int -> Int
double n = n + n

main : IO ()
main = do
  let greeting = "Hello, " ++ "world"
  case double 21 of
       42 => putStrLn greeting
       _  => putStrLn "nope"`,
  },
  {
    title: "Records and interfaces",
    description: "a record type, an interface, and an implementation",
    code: `record Point where
  constructor MkPoint
  x, y : Int

interface Describable a where
  describe : a -> String

implementation Describable Point where
  describe (MkPoint x y) = "(" ++ show x ++ ", " ++ show y ++ ")"`,
  },
  {
    title: "Nested comments",
    description: "a doc comment wrapping an example that has its own comment",
    code: `{- computes the double of a number
   {- example: double 21 == 42 -}
-}
total
double : Int -> Int
double n = n + n`,
  },
];
