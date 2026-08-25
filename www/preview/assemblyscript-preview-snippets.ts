export type AssemblyscriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const assemblyscriptPreviewSnippets: AssemblyscriptPreviewSnippet[] = [
  {
    title: "Inline add",
    description: "@inline decorator and i32 params",
    code: `@inline
export function add(a: i32, b: i32): i32 {
  return a + b;
}`,
  },
  {
    title: "changetype load",
    description: "usize pointers with unchecked load",
    code: `export function loadX(ptr: usize): i32 {
  return changetype<i32>(unchecked(load<i32>(ptr)));
}`,
  },
  {
    title: "Memory grow",
    description: "comments and memory.size / memory.grow",
    code: `// bump the heap
export function grow(): i32 {
  const pages = memory.size();
  return memory.grow(1);
}`,
  },
];
