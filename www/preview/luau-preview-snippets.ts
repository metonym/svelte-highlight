export type LuauPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const luauPreviewSnippets: LuauPreviewSnippet[] = [
  {
    title: "Exported types",
    description: "export type and typed tables",
    code: `export type Point = { x: number, y: number }

local origin: Point = { x = 0, y = 0 }`,
  },
  {
    title: "Typed function",
    description: "parameter annotations and :: type assertions",
    code: `local function add(a: number, b: number): number
  return (a + b) :: number
end`,
  },
  {
    title: "continue in a loop",
    description: "Luau's continue keyword, not in Lua 5.1",
    code: `-- skip zeros
for i, value in ipairs(items) do
  if value == 0 then
    continue
  end
  print(value)
end`,
  },
];
