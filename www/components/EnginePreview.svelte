<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Select,
    SelectItem,
    TextArea,
  } from "carbon-components-svelte";
  import {
    CLOSE,
    createRegistry,
    OPEN,
    registerAll,
    renderHtml,
    TEXT,
    tokenLines,
  } from "svelte-highlight/engine";
  import bash from "svelte-highlight/languages/bash";
  import javascript from "svelte-highlight/languages/javascript";
  import json from "svelte-highlight/languages/json";
  import python from "svelte-highlight/languages/python";
  import typescript from "svelte-highlight/languages/typescript";

  const LANGUAGES = [typescript, javascript, python, json, bash];
  const EVENT_TYPE_NAME = { [TEXT]: "TEXT", [OPEN]: "OPEN", [CLOSE]: "CLOSE" };
  const STREAM_CHUNK_SIZE = 20;

  const registry = createRegistry();
  for (const language of LANGUAGES) {
    registerAll(registry, language);
  }

  let code = `function add(a: number, b: number): number {
  return a + b;
}

console.log(add(1, 2));`;
  let language = typescript.name;

  let events = [];
  let value = "";

  function run() {
    ({ events, value } = registry.highlight(code, { language }));
  }

  run();

  $: lines = tokenLines(events);

  let session;
  let streamedLength = 0;
  let streamValue = "";

  function resetStream() {
    session = undefined;
    streamedLength = 0;
    streamValue = "";
  }

  function step() {
    if (!session) session = registry.createSession(language);
    const chunk = code.slice(
      streamedLength,
      streamedLength + STREAM_CHUNK_SIZE,
    );
    if (!chunk) return;
    session.append(chunk);
    streamedLength += chunk.length;
    streamValue = renderHtml(session.events());
  }

  $: {
    code;
    language;
    resetStream();
  }
</script>

<p class="label-01 mb-5">
  <code class="code">svelte-highlight/engine</code>, headless -- an isolated
  <code class="code">Registry</code>
  built with <code class="code">createRegistry</code>
  and <code class="code">registerAll</code>, with zero Svelte dependency.
</p>

<div
  class="mb-5"
  style="display: flex; flex-direction: column; gap: 1rem; max-width: 40rem"
>
  <TextArea labelText="code" bind:value={code} rows={8} />
  <Select labelText="language" bind:selected={language}>
    {#each LANGUAGES as lang}
      <SelectItem value={lang.name} />
    {/each}
  </Select>
  <Button size="small" kind="tertiary" on:click={run}>Highlight</Button>
</div>

<h3>renderHtml(events)</h3>
<pre class={THEME_MODULE_NAME}><code class="hljs">{@html value}</code></pre>

<h3>events (first 30)</h3>
<ul class="label-01 mb-5">
  {#each events.slice(0, 30) as ev, i}
    <li>
      <code class="code">{i}: {EVENT_TYPE_NAME[ev.t]}</code>
      {#if ev.t === TEXT}
        <code class="code">v={JSON.stringify(ev.v)}</code>
      {:else if ev.t === OPEN}
        <code class="code">s={ev.s}</code>
      {/if}
    </li>
  {/each}
</ul>

<h3>tokenLines(events)</h3>
<table class="mb-5">
  <tbody>
    {#each lines as line, i}
      <tr>
        <td class="label-01" style="vertical-align: top; padding-right: 1rem">
          {i}
        </td>
        <td>
          {#each line as token}
            <span
              title={token.scopes.join(" ")}
              style="margin-right: 0.5rem; white-space: pre"
              >{token.text}</span
            >
          {/each}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<h3>Streaming: registry.createSession(language)</h3>
<div
  class="mb-3"
  style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap"
>
  <Button size="small" kind="tertiary" on:click={step}
    >Append next {STREAM_CHUNK_SIZE} chars</Button
  >
  <Button size="small" kind="tertiary" on:click={resetStream}>Reset</Button>
  <p class="label-01">{streamedLength} / {code.length} chars streamed</p>
</div>
<pre class={THEME_MODULE_NAME}><code class="hljs">{@html streamValue}</code
  ></pre>
