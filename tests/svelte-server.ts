/**
 * Compiles every `.svelte` file a test imports for the server, so
 * `svelte/server`'s `render` can run it, components it imports included.
 * Import it before the components. Registered once: Bun shares plugins
 * across test files.
 */
import { plugin } from "bun";
import { svelte } from "svelte-bun";

plugin(
  svelte({
    side: "server",
    // Dev checks off, as in a production build.
    production: true,
    // The source's own warnings are linted elsewhere.
    onwarn: () => {},
  }),
);
