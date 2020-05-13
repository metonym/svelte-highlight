<script>
  import pkg from "../../../package.json";
  import { Highlight, HighlightSvelte } from "svelte-highlight";
  import { bash } from "svelte-highlight/languages";
  import Copy from "../components/Copy.svelte";
  import { Navigation, Box, Button, Alert } from "svelte-primer";
  import { LinkExternal, MarkGithub, Paintcan } from "svelte-octicons";
  import * as styles from "svelte-highlight/styles";

  $: currentStyle = "anOldHope";
  $: supportedStyles = Object.keys(styles);
  $: style = styles[currentStyle];
  $: tabIndexUsage = 0;
  $: tabIndexInstall = 0;
  $: codeInstall =
    tabIndexInstall === 0
      ? "yarn add -D svelte-highlight"
      : "npm -i -D svelte-highlight";

  $: currentStyleCSS = (currentStyle || "")
    .split(/(?=[A-Z])/)
    .map(fragment => fragment.toLowerCase())
    .join("-");

  let code = "const add = (a: number, b: number) => a + b;";

  $: codeInjectedStyles = `<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import { ${currentStyle} } from "svelte-highlight/styles";

  $: code = \`${code}\`;
<\/script>

<svelte:head>
  {@html ${currentStyle}}
</svelte:head>

<Highlight language={typescript} {code} />`;

  $: codeCssStylesheet = `<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import "svelte-highlight/styles/${currentStyleCSS}.css";

  $: code = \`${code}\`;
<\/script>

<Highlight language={typescript} {code} />`;

  $: codeUsage = tabIndexUsage === 0 ? codeInjectedStyles : codeCssStylesheet;
</script>

<svelte:head>
  {@html style}
</svelte:head>

<main class="p-6">
  <div style="max-width: 40rem;">
    <div class="markdown-body">
      <h1>
        svelte-highlight
        <a
          class="d-inline-flex ml-2 mr-2"
          href="https://www.npmjs.com/package/svelte-highlight"
          target="_blank"
          rel="noopener noreferrer">
          <span class="version">
            v{pkg.version}
            <LinkExternal style="margin-left: .125rem;" />
          </span>
        </a>
        <a
          class="d-inline-flex"
          href="https://github.com/metonym/svelte-highlight">
          <span class="version">
            View on GitHub
            <MarkGithub style="margin-left: .125rem;" />
          </span>
        </a>
      </h1>
    </div>
    <div class="markdown-body mt-3 mt-3">
      <blockquote>
        <p>
          Syntax Highlighting for Svelte using
          <a href="https://github.com/highlightjs/highlight.js">highlight.js</a>
        </p>
      </blockquote>
    </div>
    <div class="markdown-body mt-4 mb-4">
      <h2>Install</h2>
    </div>
    <Navigation.TabNav>
      <Navigation.TabNavItem
        current={tabIndexInstall === 0}
        on:click={e => {
          e.preventDefault();
          tabIndexInstall = 0;
        }}>
        yarn
      </Navigation.TabNavItem>
      <Navigation.TabNavItem
        current={tabIndexInstall === 1}
        on:click={e => {
          e.preventDefault();
          tabIndexInstall = 1;
        }}>
        npm
      </Navigation.TabNavItem>
    </Navigation.TabNav>
    <Box.Box class="d-flex">
      <Highlight class="flex-1" language={bash} code={codeInstall} />
      <Copy text={codeInstall} />
    </Box.Box>
    <div class="markdown-body mt-4 mb-4">
      <h2>Usage</h2>
    </div>
    <p class="markdown-body mb-4">
      Use the
      <a
        href="https://svelte.dev/docs#svelte_head"
        target="_blank"
        rel="noopener noreferrer">
        svelte:head API
      </a>
      or a CSS StyleSheet loader to load styles.
    </p>
    <Navigation.TabNav>
      <Navigation.TabNavItem
        current={tabIndexUsage === 0}
        on:click={e => {
          e.preventDefault();
          tabIndexUsage = 0;
        }}>
        Injected Styles
      </Navigation.TabNavItem>
      <Navigation.TabNavItem
        current={tabIndexUsage === 1}
        on:click={e => {
          e.preventDefault();
          tabIndexUsage = 1;
        }}>
        CSS StyleSheet
      </Navigation.TabNavItem>
    </Navigation.TabNav>
    <Box.Box class="d-flex">
      <HighlightSvelte class="flex-1" code={codeUsage} />
      <Copy text={codeUsage} />
    </Box.Box>
    {#if tabIndexUsage === 1}
      <Alert class="mt-2">
        <p>
          A CSS loader is required to import a CSS StyleSheet in a Svelte
          component.
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/metonym/svelte-highlight/tree/master/examples/webpack">
            Example webpack set-up
            <LinkExternal style="fill: #0366d6; margin-left: .125rem;" />
          </a>
        </p>
      </Alert>
    {/if}
  </div>
</main>

<aside class="d-inline-flex bg-gray-light border-right">
  <Navigation.SideNav class="width-full p-3">
    <div class="d-flex width-full">
      <h5
        class="d-flex width-full flex-justify-between text-gray mb-2 pb-1
        border-bottom">
        Themes
        <a style="margin-top: auto; margin-left: auto" href="themes" class="f6">
          View on one page
        </a>
      </h5>
    </div>
    {#each supportedStyles as style, i (style)}
      <Navigation.SideNavSubItem
        href="#"
        current={currentStyle === style}
        on:click={e => {
          e.preventDefault();
          currentStyle = style;
        }}>
        {style}
      </Navigation.SideNavSubItem>
    {/each}
  </Navigation.SideNav>
</aside>
