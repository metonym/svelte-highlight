export type BamlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bamlPreviewSnippets: BamlPreviewSnippet[] = [
  {
    title: "Extract function",
    description: "a function signature, a prompt block, and a client config",
    code: `// extract a resume from raw text
function Extract(text: string) -> Resume {
  client GPT4
  prompt #"
    Extract the resume from this text: {{ text }}
    {{ ctx.output_format }}
  "#
}

client<llm> GPT4 {
  provider openai
  options {
    model "gpt-4o"
  }
}`,
  },
  {
    title: "Class with attributes",
    description: "@description and @@dynamic attributes",
    code: `class Resume {
  name string @description("full name")
  age int?

  @@dynamic
}`,
  },
  {
    title: "Test cases",
    description: "the test keyword",
    code: `test ExtractTest {
  functions [Extract]
  args {
    text #"
      Jane Doe, Software Engineer
    "#
  }
}`,
  },
];
