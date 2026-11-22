<script context="module">
  let instanceCount = 0;
  function nextInstanceId() {
    return ++instanceCount;
  }
</script>

<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {string} */
  export let code = "";

  /** @type {number} Number of spaces inserted by the Tab key. */
  export let tabSize = 2;

  /** @type {number} Maximum number of undo snapshots retained. */
  export let historyLimit = 200;

  /**
   * Keeps highlighting, caret placement, and selection active while
   * blocking edits (typing, paste, drag-and-drop, Tab/Shift+Tab indent).
   * @type {boolean}
   */
  export let readonly = false;

  /**
   * Rendering engine. `"css-highlights"` (experimental) paints tokens via the
   * CSS Custom Highlight API, falling back to `"dom"` where unsupported.
   * @type {"dom" | "css-highlights"}
   */
  export let engine = "dom";

  /**
   * Theme CSS or `ThemePalette` that `"css-highlights"` resolves token colors
   * from, as `Highlight` does. Colors only.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  /**
   * Accessible name of the editor (`aria-label`).
   * @type {string}
   */
  export let label = "Code editor";

  import { createEventDispatcher, onMount } from "svelte";
  import { createEditor, prerenderEditor } from "./editable.js";

  const dispatch = createEventDispatcher();
  const instanceId = nextInstanceId();

  /** @type {HTMLElement} */
  let element;

  /** @type {ReturnType<typeof createEditor> | undefined} */
  let editor;

  // Tracks `code` so parent updates vs local edits can be distinguished.
  let internalCode = code;

  // The first paint's markup, rendered on the server too, so the code has its
  // colors before hydration. The editor keeps it rather than repainting.
  // Never reassigned: the editor owns the element's content after mount.
  const prerendered = prerenderEditor(language, code ?? "");

  $: editor?.update({
    language,
    tabSize,
    historyLimit,
    readonly,
    engine,
    theme,
  });
  $: if (editor && code !== internalCode) {
    internalCode = code;
    editor.syncCode(code);
  }

  export function undo() {
    editor?.undo();
  }

  export function redo() {
    editor?.redo();
  }

  export function focus() {
    editor?.focus();
  }

  export function selectAll() {
    editor?.selectAll();
  }

  export function insert(text) {
    editor?.insert(text);
  }

  export function indent() {
    editor?.indent();
  }

  export function outdent() {
    editor?.outdent();
  }

  export function setCode(value) {
    editor?.setCode(value);
  }

  export function clear() {
    editor?.clear();
  }

  export function getCode() {
    return code;
  }

  export function canUndo() {
    return editor?.canUndo() ?? false;
  }

  export function canRedo() {
    return editor?.canRedo() ?? false;
  }

  /**
   * The engine on screen. `"css-highlights"` once it paints. `"dom"`
   * before mount, where `CSS.highlights` is missing, while the color
   * resolver loads, and while that load has failed.
   */
  export function resolvedEngine() {
    return editor?.resolvedEngine() ?? "dom";
  }

  onMount(() => {
    editor = createEditor(element, {
      language,
      code,
      tabSize,
      historyLimit,
      readonly,
      engine,
      theme,
      instanceId,
      prerendered,
      onChange: (value) => {
        code = value;
        internalCode = value;
        dispatch("change", { code });
      },
      onHistory: (snapshot) => dispatch("history", snapshot),
      onBlur: (value) => dispatch("blur", { code: value }),
    });
    return () => editor?.destroy();
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<pre
  style:overflow-x="var(--overflow-x, auto)"
  style:border-radius="var(--border-radius, 0)"
  {...$$restProps}><code
    bind:this={element}
    class:hljs={true}
    contenteditable={readonly ? "false" : "true"}
    spellcheck="false"
    tabindex="0"
    role="textbox"
    aria-multiline="true"
    aria-readonly={readonly ? "true" : undefined}
    aria-label={label}>{@html prerendered.html}</code
  ></pre>

<style>
  code {
    outline: none;
  }

  code:focus {
    outline: var(--outline-width, 2px) solid var(--outline-color, #4589ff);
    outline-offset: var(--outline-offset, -2px);
  }
</style>
