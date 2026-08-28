export type PureScriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const purescriptPreviewSnippets: PureScriptPreviewSnippet[] = [
  {
    title: "Module and a typed function",
    description: "module header, a type signature, and a case expression",
    code: `module Main where

double :: Int -> Int
double n = n + n

main :: Effect Unit
main = do
  let greeting = "Hello, " <> "world"
  case double 21 of
    42 -> log greeting
    _  -> log "nope"`,
  },
  {
    title: "Records and type classes",
    description: "a record type, a type class, and an instance",
    code: `type Point = { x :: Number, y :: Number }

class Describable a where
  describe :: a -> String

instance describablePoint :: Describable Point where
  describe p = "(" <> show p.x <> ", " <> show p.y <> ")"`,
  },
  {
    title: "Nested comments",
    description: "a doc comment wrapping an example that has its own comment",
    code: `{- computes the double of a number
   {- example: double 21 == 42 -}
-}
double :: Int -> Int
double n = n + n`,
  },
];
