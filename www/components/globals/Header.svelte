<script>
  /** @type {string} */
  export let title;

  /** @type {string} */
  export let pathname;

  import { PKG_REPO, PKG_VERSION } from "@www/constants";
  import "carbon-components-svelte/css/all.css";
  import "@www/app.css";
  import LogoGithub from "@components/LogoGithub.svelte";
  import {
    Column,
    Content,
    Grid,
    Header,
    HeaderActionLink,
    HeaderNav,
    HeaderNavItem,
    HeaderUtilities,
    Row,
    SkipToContent,
  } from "carbon-components-svelte";

  /** @type {Record<typeof pathname, string>} */
  const routes = {
    "/languages": "Languages",
    "/styles": "Styles",
  };

  $: path = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  $: title = routes[path] || "Svelte Highlight";
</script>

<Header aria-label="Navigation" platformName="Svelte Highlight" href="/">
  <span class="flex align-baseline" slot="platform">
    Svelte Highlight
    <span class:version={true} class="code-01" style="color: #c6c6c6">
      v{PKG_VERSION}
    </span>
  </span>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    {#each Object.entries(routes) as [href, text]}
      <HeaderNavItem {href} {text} isSelected={path === href} />
    {/each}
  </HeaderNav>
  <HeaderUtilities>
    <HeaderActionLink icon={LogoGithub} href={PKG_REPO} target="_blank" />
  </HeaderUtilities>
</Header>

<Content>
  <Grid padding>
    <Row>
      <Column>
        <h2>{title}</h2>
      </Column>
    </Row>
    <slot />
  </Grid>
</Content>

<style>
  :global(.bx--header__nav) {
    display: block !important;
  }

  :global(.bx--side-nav__overlay-active) {
    z-index: calc(10 + 1); /** supersede the z-index of code snippets */
  }

  :global(.bx--side-nav ~ .bx--content) {
    margin-left: 0;
  }

  @media (max-width: 1056px) {
    :global(.bx--content) {
      padding-left: 0;
      padding-right: 0;
    }
  }

  @media (max-width: 672px) {
    .version {
      display: none;
    }

    :global(a.bx--header__menu-item) {
      padding: 0 0.5rem;
    }

    :global(a.bx--header__name) {
      padding-right: 1rem;
    }
  }
</style>
