<script>
  // One mounted file of a DiffFileList. Internal.

  /** @type {import("./DiffFileList.svelte").DiffFile} */
  export let file;

  /** @type {(path: string) => import("./languages").LanguageType<string> | Promise<import("./languages").LanguageType<string> | undefined> | undefined} */
  export let languageFor;

  /** @type {Partial<import("./diff-controller.js").DiffOptions>} */
  export let options = {};

  /** @type {import("./DiffView.svelte").DiffViewProps} */
  export let viewProps = {};

  /** @type {(stats: { additions: number, deletions: number, changes: number }) => void} */
  export let onStats = () => {};

  import { onMount } from "svelte";
  import DiffView from "./DiffView.svelte";
  import { createDiffController } from "./diff-controller.js";

  const diff = createDiffController(options);

  $: diff.setOptions(options);
  $: if (file.patch) diff.setPatch(file.patch);
  else diff.update(file.before ?? "", file.after ?? "");
  $: onStats($diff.stats());

  // A language given directly applies now, so a server-rendered diff is
  // highlighted; a promise resolves after mount.
  const pick = file.language ?? languageFor(file.path);
  if (
    pick &&
    typeof (/** @type {{ then?: unknown }} */ (pick).then) !== "function"
  ) {
    diff.setOptions({
      language: /** @type {import("./languages").LanguageType<string>} */ (
        pick
      ),
    });
  }

  onMount(() => {
    let alive = true;
    Promise.resolve(pick)
      .then((language) => {
        if (alive && language) diff.setOptions({ language });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  });
</script>

<DiffView {diff} keyboard {...viewProps} />
