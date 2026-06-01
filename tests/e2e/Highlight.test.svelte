<script>
  import Highlight from "svelte-highlight";
  import astro from "svelte-highlight/languages/astro";
  import html from "svelte-highlight/languages/html";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let toggle = true;
  let showHtml = false;
  let showAstro = false;

  const code = "const add = (a: number, b: number) => a + b;";
  const code2 =
    "function hello(name: string){\n\treturn `Hello " +
    "$" +
    "{name}!" +
    "`;\n}";
  const astroCode = `---
export const title = "Page";
---
<h1>{title}</h1>
<Counter client:load />`;
  const htmlCode = `<div id="content">
    <p>Paragraph one</p>
  </div>
  <style>
    #content { display: flex; }
  </style>
  <script>
    const content = document.getElementById("content");
  <\/script>`;
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<button type="button" on:click={() => (toggle = !toggle)}>Toggle</button>
<button type="button" on:click={() => (showHtml = !showHtml)}>
  Toggle HTML
</button>
<button type="button" on:click={() => (showAstro = !showAstro)}>
  Toggle Astro
</button>

{#if showAstro}
  <Highlight langtag language={astro} code={astroCode} />
{:else if showHtml}
  <Highlight langtag language={html} code={htmlCode} />
{:else}
  <Highlight langtag language={typescript} code={toggle ? code : code2} />
{/if}
