import { $, Glob } from "bun";

const dirs = new Glob("*").scanSync({
  cwd: "examples",
  onlyFiles: false,
  absolute: true,
});

for await (const dir of dirs) {
  await $`cd ${dir} && bun update`;
}
