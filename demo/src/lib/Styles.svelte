<script>
  import { Row, Column } from "carbon-components-svelte";
  import styles from "./styles.json";
  import ScopedStyle from "./ScopedStyle.svelte";

  let loaded = {};

  /*   $: code = `<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import { ${style} } from "svelte-highlight/styles";

  const code = \`const add = (a: number, b: number) => a + b;\`;
<\/script>

<svelte:head>
  {@html ${style}}
</svelte:head>

<Highlight language={typescript} {code} />`;
  $: css = styles[style]
    .replace(/^\.hljs$/g, `.${style} .hljs`)
    .replace(/\.hljs-/g, `.${style} .hljs-`); */
</script>

{styles.length} styles
<!-- 
<svelte:head>
  {@html css}
</svelte:head> -->

{#each styles as style (style.name)}
  <Row>
    <Column xlg="{4}" lg="{4}">
      <div>
        {style.name}
        {style.moduleName}
      </div>
    </Column>
    <Column xlg="{10}" lg="{12}">
      <ScopedStyle style="{style.moduleName}" />
      <!-- 
<HighlightSvelte class="{style}" code="{code}" /> -->
      <!-- <iframe
        class:loaded="{loaded[style.name]}"
        on:load="{() => {
          loaded[style.name] = true;
          window.scrollTo(0, 0);
        }}"
        sveltekit:noscroll
        allowtransparency
        src="/styles/{style.moduleName}"
        title="{style.name}"></iframe> -->
    </Column>
  </Row>
{/each}

<style>
  .wrapper {
    display: flex;
    /* flex: 1; */
    /*  width: 50%; */
  }

  iframe:not(.loaded) {
    position: fixed;
  }

  iframe {
    width: 100%;
    min-height: 26rem;
  }
</style>
