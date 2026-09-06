export type RakuPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const rakuPreviewSnippets: RakuPreviewSnippet[] = [
  {
    title: "A class with accessors",
    description: "twigils, the is rw trait, and a declarator doc",
    code: `#| doubles a number
sub double(Int $x) {
    return $x * 2;
}

my $name = "world";
say "Hello, $name!";

class Point {
    has $.x is rw;
    has $.y is rw;
}

my $p = Point.new(x => 1, y => 2);
say $p.x ~~ $p.y;
`,
  },
  {
    title: "Grammar and tokens",
    description: "the grammar, token, and rule keywords",
    code: `grammar Calculator {
    token TOP { <expr> }
    rule expr { <num> '+' <num> }
    token num { \\d+ }
}`,
  },
  {
    title: "Multi dispatch",
    description: "multi and proto subs",
    code: `proto sub area(|) {*}
multi sub area(Num $r) { pi * $r ** 2 }
multi sub area(Num $w, Num $h) { $w * $h }`,
  },
];
