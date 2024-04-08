import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

export default {
  plugins: [sveltekit()],
} satisfies UserConfig;
