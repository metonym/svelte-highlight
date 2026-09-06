export type C3PreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const c3PreviewSnippets: C3PreviewSnippet[] = [
  {
    title: "A counter struct",
    description: "compile-time directives, optional types, and nextcase",
    code: `module counters;

fn int increment(int x) {
    $if $defined(x):
        return x + 1;
    $endif
    return x;
}

struct Counter {
    int value;
    String? name;
}

fn void main() {
    Counter c = { .value = 0 };
    switch (c.value) {
        case 0:
            nextcase default;
        default:
            io::printn("done");
    }
}
`,
  },
  {
    title: "Attributes",
    description: "@extern, @packed, and @test",
    code: `@extern fn void raw_syscall(int n);

@packed
struct Header {
    char magic;
    int length;
}

@test
fn void test_increment() {
    assert(increment(1) == 2);
}`,
  },
  {
    title: "Error handling",
    description: "the ! rethrow and ?? default operators",
    code: `fn void! risky() {
    return foo()!;
}

fn int safe() {
    return risky() ?? -1;
}`,
  },
];
