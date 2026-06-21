export type FishPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const fishPreviewSnippets: FishPreviewSnippet[] = [
  {
    title: "Function with arguments",
    description: "function/end, set, and variable interpolation",
    code: `function greet
    set -l name $argv[1]
    echo "Hello, $name!"
end

greet world`,
  },
  {
    title: "Conditionals and loops",
    description: "if/else/end, for/in, and builtins",
    code: `for file in *.txt
    if test -s $file
        echo "$file is not empty"
    else
        echo "$file is empty"
    end
end`,
  },
  {
    title: "Command substitution",
    description: "$(...) substitution and string builtin",
    code: `set -l branch $(git rev-parse --abbrev-ref HEAD)
set -l count (count *.md)

string upper "$branch has $count docs"`,
  },
];
