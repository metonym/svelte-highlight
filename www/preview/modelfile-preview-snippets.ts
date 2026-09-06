export type ModelfilePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const modelfilePreviewSnippets: ModelfilePreviewSnippet[] = [
  {
    title: "A custom model",
    description: "FROM, PARAMETER, SYSTEM, and TEMPLATE instructions",
    code: `# a custom llama model
FROM llama3.2
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
SYSTEM """You are a helpful assistant."""
TEMPLATE """{{ .Prompt }}"""
MESSAGE system You are concise.
MESSAGE user Hello!`,
  },
  {
    title: "Sampling parameters",
    description: "top_k, top_p, and repeat_penalty",
    code: `FROM mistral
PARAMETER top_k 40
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER stop "<|end|>"`,
  },
  {
    title: "Conversation history",
    description: "seeding a chat with prior messages",
    code: `FROM llama3.2
MESSAGE system You are a pirate.
MESSAGE user Tell me a joke.
MESSAGE assistant Why did the pirate go to school? To improve his "arrr"ticulation!`,
  },
];
