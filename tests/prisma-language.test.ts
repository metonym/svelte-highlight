import hljs from "highlight.js/lib/core";
import prisma from "../src/languages/prisma";

hljs.registerLanguage(prisma.name, prisma.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "prisma" }).value;

test("prisma highlights block keywords and names", () => {
  const result = highlight("model User {\n  id Int\n}");

  expect(result).toContain('<span class="hljs-keyword">model</span>');
  expect(result).toContain('<span class="hljs-title class_">User</span>');
});

test("prisma highlights scalar types", () => {
  const result = highlight("name String\ncount Int\nactive Boolean");

  expect(result).toContain('<span class="hljs-type">String</span>');
  expect(result).toContain('<span class="hljs-type">Int</span>');
  expect(result).toContain('<span class="hljs-type">Boolean</span>');
});

test("prisma highlights field and block attributes", () => {
  const result = highlight(
    `id Int @id @default(autoincrement())\n@@map("users")`,
  );

  expect(result).toContain('<span class="hljs-meta">@id</span>');
  expect(result).toContain('<span class="hljs-meta">@default</span>');
  expect(result).toContain('<span class="hljs-meta">@@map</span>');
});

test("prisma highlights functions in attribute args", () => {
  const result = highlight(`url = env("DATABASE_URL")`);

  expect(result).toContain('<span class="hljs-built_in">env</span>');
});

test("prisma highlights datasource and enum blocks", () => {
  const result = highlight("datasource db {}\nenum Role {\n  USER\n}");

  expect(result).toContain('<span class="hljs-keyword">datasource</span>');
  expect(result).toContain('<span class="hljs-keyword">enum</span>');
});
