<script context="module">
  export async function preload({ params }) {
    const res = await this.fetch(`themes/${params.slug}.json`);
    const data = await res.json();

    if (res.status === 200) {
      return { post: data };
    } else {
      this.error(res.status, data.message);
    }
  }
</script>

<script>
  export let post;

  import { Highlight, HighlightSvelte } from "svelte-highlight";
  import * as styles from "svelte-highlight/styles";

  $: currentStyle = post.title;
  $: code = `<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import { ${currentStyle} } from "svelte-highlight/styles";

  $: code = \`const add = (a: number, b: number) => a + b;\`;
<\/script>

<svelte:head>
  {@html ${currentStyle}}
</svelte:head>

<Highlight language={typescript} {code} />`;
</script>

<style>
  :global(.hljs.hljs) {
    padding: 0.75rem 1rem;
    cursor: text;
  }
</style>

<svelte:head>
  <title>{post.title}</title>
  {@html styles[currentStyle]}
</svelte:head>
<HighlightSvelte {code} />
