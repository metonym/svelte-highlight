export type BendPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bendPreviewSnippets: BendPreviewSnippet[] = [
  {
    title: "Binary tree sum",
    description: "a type definition with recursive fields, and bend/fold",
    code: `# a binary tree sum
type Tree:
  Node { ~lft, ~rgt }
  Leaf { val }

def sum(tree):
  match tree:
    case Tree/Node:
      return sum(tree.lft) + sum(tree.rgt)
    case Tree/Leaf:
      return tree.val

def main():
  bend x = 0:
    when x < 3:
      fold x = x + 1
    else:
      return #done
`,
  },
  {
    title: "Lambdas",
    description: "the lambda and λ syntax variants",
    code: `double = lambda x: x * 2
triple = λx (* x 3)`,
  },
  {
    title: "Dups and superpositions",
    description: "the ! duplication operator and {a b} superpositions",
    code: `! x = 5
{y z} = {x x}
result = y + z`,
  },
];
