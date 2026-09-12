<script>
  /**
   * Growing Markdown buffer. On change, `splitter.append` is used when the
   * new value starts with the previous one; otherwise the whole buffer is
   * replaced via `splitter.set`.
   * @type {string}
   */
  export let text = "";

  /**
   * Stream finished: forwarded to every fence's `HighlightStream` as
   * `done || !segment.open`.
   * @type {boolean}
   */
  export let done = false;

  /**
   * Resolves a fence's language. Cached per canonical name for the
   * component's lifetime.
   * @type {(lang: string | undefined, segment: import("./fence.d.ts").FenceSegment) => import("./languages").LanguageType<string> | Promise<import("./languages").LanguageType<string>> | undefined}
   */
  export let resolveLanguage = defaultResolveLanguage;

  /** @type {boolean} */
  export let caret = true;

  /** @type {boolean} */
  export let autoScroll = true;

  /**
   * Announced once, by the last fence only, when `done` becomes `true`.
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

  // Fence ids already reported via the `fence` event -- an id is only ever
  // seen once, even if the splitter later rebuilds the segment object (a
  // regenerated buffer keeps the id per the splitter's contract).
  /** @type {Set<number>} */
  const seenFenceIds = new Set();

  // Resolved languages by canonical name, plus in-flight names so a second
  // fence sharing a language doesn't re-invoke `resolveLanguage`.
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
   * `languages` is passed in so the template tracks the cache. A helper
   * that only closed over `resolvedLanguages` would not re-run when a
   * grammar finished loading (Svelte 3/4, and Svelte 5's `untrack` of
   * helper bodies).
   * @param {Record<string, import("./languages").LanguageType<string>>} languages
   * @param {import("./fence.d.ts").FenceSegment} segment
   */
  function languageFor(languages, segment) {
    return languages[cacheKey(segment.lang)] ?? plaintext;
  }

  // Feed the splitter, then re-read its (identity-stable) segment list.
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

  // Only the trailing segment can be an open fence (the parser is still
  // inside it), so caret placement never needs to scan the whole document.
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
    {#if segment.kind === "text"}
      <slot name="text" {segment}>
        <div class="shl-md-text">{segment.text}</div>
      </slot>
    {:else}
      <slot
        name="fence"
        {segment}
        language={languageFor(resolvedLanguages, segment)}
      >
        <HighlightStream
          code={segment.code}
          language={languageFor(resolvedLanguages, segment)}
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
