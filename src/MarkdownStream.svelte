<script>
  /**
   * Growing Markdown buffer; appended when it extends the previous value, else replaced.
   * @type {string}
   */
  export let text = "";

  /**
   * Stream finished; also closes a trailing open fence.
   * @type {boolean}
   */
  export let done = false;

  /**
   * Resolves a fence's language, cached per name.
   * @type {(lang: string | undefined, segment: import("./fence.d.ts").FenceSegment) => import("./languages").LanguageType<string> | Promise<import("./languages").LanguageType<string>> | undefined}
   */
  export let resolveLanguage = defaultResolveLanguage;

  /** @type {boolean} */
  export let caret = true;

  /** @type {boolean} */
  export let autoScroll = true;

  /**
   * Announced once by the last fence when `done` becomes `true`.
   * @type {string}
   */
  export let doneText = "Code finished streaming";

  import { createEventDispatcher } from "svelte";
  import { createFenceSplitter } from "./fence.js";
  import HighlightStream from "./HighlightStream.svelte";
  import plaintext from "./languages/plaintext.js";
  import { loadLanguage } from "./load-language.js";

  /**
   * @param {string | undefined} lang
   * @returns {Promise<import("./languages").LanguageType<string> | undefined>}
   */
  async function defaultResolveLanguage(lang) {
    if (!lang) return undefined;
    try {
      return await loadLanguage(
        /** @type {import("./languages").LanguageName} */ (lang),
      );
    } catch {
      return undefined;
    }
  }

  const dispatch = createEventDispatcher();
  const splitter = createFenceSplitter();

  let previousText = "";
  /** @type {readonly import("./fence.d.ts").MarkdownSegment[]} */
  let segments = splitter.segments();

  // Fence ids already reported via the `fence` event.
  /** @type {Set<number>} */
  const seenFenceIds = new Set();

  /** @type {Record<string, import("./languages").LanguageType<string>>} */
  let resolvedLanguages = {};
  /** @type {Set<string>} */
  const pendingLanguages = new Set();

  /** @param {string | undefined} lang */
  function cacheKey(lang) {
    return lang === undefined ? "\0" : lang;
  }

  /** @param {import("./fence.d.ts").FenceSegment} segment */
  function ensureLanguage(segment) {
    const key = cacheKey(segment.lang);
    if (pendingLanguages.has(key)) return;
    pendingLanguages.add(key);
    Promise.resolve(resolveLanguage(segment.lang, segment))
      .then((language) => {
        resolvedLanguages = {
          ...resolvedLanguages,
          [key]: language ?? plaintext,
        };
      })
      .catch(() => {
        resolvedLanguages = { ...resolvedLanguages, [key]: plaintext };
      });
  }

  /**
   * `languages` is a parameter so the template re-runs when the cache changes.
   * Takes a string key, not the segment: Svelte 5 legacy mode treats every
   * keyed item as changed per chunk, which would re-render every closed fence.
   * @param {Record<string, import("./languages").LanguageType<string>>} languages
   * @param {string} key
   */
  function languageFor(languages, key) {
    return languages[key] ?? plaintext;
  }

  $: {
    if (text !== previousText) {
      if (text.startsWith(previousText)) {
        splitter.append(text.slice(previousText.length));
      } else {
        splitter.set(text);
      }
      previousText = text;
      segments = splitter.segments();
    }
  }

  $: for (const segment of segments) {
    if (segment.kind !== "fence") continue;
    if (!seenFenceIds.has(segment.id)) {
      seenFenceIds.add(segment.id);
      dispatch("fence", { id: segment.id, lang: segment.lang });
    }
    ensureLanguage(segment);
  }

  let doneDispatched = false;
  $: if (done) {
    if (!doneDispatched) {
      doneDispatched = true;
      dispatch("done");
    }
  } else {
    doneDispatched = false;
  }

  // Only the trailing segment can be an open fence.
  $: lastSegment = segments[segments.length - 1];
  $: lastOpenFenceId =
    lastSegment !== undefined &&
    lastSegment.kind === "fence" &&
    lastSegment.open
      ? lastSegment.id
      : undefined;

  $: lastFenceId = findLastFenceId(segments);

  /** @param {readonly import("./fence.d.ts").MarkdownSegment[]} list */
  function findLastFenceId(list) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const segment = /** @type {import("./fence.d.ts").MarkdownSegment} */ (
        list[i]
      );
      if (segment.kind === "fence") return segment.id;
    }
    return undefined;
  }
</script>

<div class="shl-md" aria-busy={!done} {...$$restProps}>
  {#each segments as segment (segment.id)}
    {@const languageKey =
      segment.kind === "fence" ? cacheKey(segment.lang) : ""}
    {@const language = languageFor(resolvedLanguages, languageKey)}
    {#if segment.kind === "text"}
      <slot name="text" {segment}>
        <div class="shl-md-text">{segment.text}</div>
      </slot>
    {:else}
      <slot name="fence" {segment} {language}>
        <HighlightStream
          code={segment.code}
          {language}
          done={done || !segment.open}
          caret={caret && segment.id === lastOpenFenceId}
          {autoScroll}
          doneText={segment.id === lastFenceId ? doneText : ""}
        />
      </slot>
    {/if}
  {/each}
</div>

<style>
  .shl-md {
    display: flex;
    flex-direction: column;
    gap: var(--md-gap, 1em);
  }

  .shl-md-text {
    white-space: var(--md-text-white-space, pre-wrap);
  }
</style>
