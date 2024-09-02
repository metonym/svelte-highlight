import { $ } from "bun";

for await (const dir of $`find examples -maxdepth 1 -mindepth 1 -type d`.lines()) {
  if (dir) await $`cd ${dir} && bun update`;
}
