import { $ } from "bun";

for await (const dir of $`find examples -maxdepth 1 -type d`.lines()) {
  await $`cd ${dir} && bun update`;
}
