export type StarlarkPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const starlarkPreviewSnippets: StarlarkPreviewSnippet[] = [
  {
    title: "BUILD target",
    description: "rules, globs, and select",
    code: `# Build the server binary
go_binary(
    name = "server",
    srcs = glob(["*.go"]),
    deps = [
        "//internal/api",
        "//internal/db",
    ],
    visibility = ["//visibility:public"],
)`,
  },
  {
    title: "Custom rule",
    description: "function definitions and providers",
    code: `def _impl(ctx):
    out = ctx.actions.declare_file(ctx.label.name + ".txt")
    ctx.actions.write(output = out, content = "generated")
    return [DefaultInfo(files = depset([out]))]

my_rule = rule(
    implementation = _impl,
    attrs = {"value": attr.string(default = "hello")},
)`,
  },
];
