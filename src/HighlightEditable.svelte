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
   * Theme CSS or `ThemePalette` for `::highlight()` rules (`"css-highlights"`
   * only). Colors only.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  /**
   * Accessible name of the editor (`aria-label`).
   * @type {string}
   */
  export let label = "Code editor";

  import { createEventDispatcher, onMount } from "svelte";
  import { createEditor } from "./editable.js";
  import { resolveEngine } from "./editable-painter.js";
  import { instanceHighlightStyle } from "./highlight-theme.js";

  const dispatch = createEventDispatcher();
  const instanceId = nextInstanceId();

  /** @type {HTMLElement} */
  let element;

  /** @type {ReturnType<typeof createEditor> | undefined} */
  let editor;

  // Tracks `code` so parent updates vs local edits can be distinguished.
  let internalCode = code;

  $: editor?.update({ language, tabSize, historyLimit, readonly, engine });
  $: if (editor && code !== internalCode) {
    internalCode = code;
    editor.syncCode(code);
  }
  $: resolvedEngineValue = resolveEngine(engine);
  $: cssHighlightStyle =
    resolvedEngineValue === "css-highlights" && theme !== undefined
      ? instanceHighlightStyle(theme, instanceId)
      : "";

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

  /** The engine actually in use: `engine`, or `"dom"` if it was requested but unsupported. */
  export function resolvedEngine() {
    return resolvedEngineValue;
  }

  onMount(() => {
    editor = createEditor(element, {
      language,
      code,
      tabSize,
      historyLimit,
      readonly,
      engine,
      instanceId,
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

<svelte:head
  >{#if cssHighlightStyle}
    {@html cssHighlightStyle}
  {/if}</svelte:head
>

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
    aria-label={label}>{code}</code
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
