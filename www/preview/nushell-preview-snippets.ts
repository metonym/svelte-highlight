export type NushellPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const nushellPreviewSnippets: NushellPreviewSnippet[] = [
  {
    title: "Pipelines",
    description: "structured commands, flags, and filters",
    code: `ls
| where size > 1mb
| sort-by modified
| select name size
| first 5`,
  },
  {
    title: "Custom command",
    description: "def, let/mut, and string interpolation",
    code: `def greet [name: string] {
    let message = $"Hello, ($name)!"
    print $message
}

greet "world"`,
  },
  {
    title: "Values with units",
    description: "durations, file sizes, and literals",
    code: `let timeout = 30sec
let limit = 256mb
let enabled = true

if $enabled {
    print $"timeout is ($timeout)"
}`,
  },
];
