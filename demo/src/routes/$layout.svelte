<script>
  import "carbon-components-svelte/css/all.css";
  import "../app.css";
  import {
    Header,
    HeaderUtilities,
    HeaderActionLink,
    SideNav,
    SideNavItems,
    SideNavLink,
    SkipToContent,
    Grid,
    Row,
    Column,
    Content,
  } from "carbon-components-svelte";
  import { LogoGithub20 } from "carbon-icons-svelte";
  import { prefetchRoutes } from "$app/navigation";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { onMount, tick } from "svelte";

  onMount(prefetchRoutes);

  const routes = {
    "/": "Getting started",
    "/languages": "Languages",
    "/styles": "Styles",
  };

  let isSideNavOpen = false;

  $: title = $page.path === "/" ? "Svelte Highlight" : routes[$page.path];
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Header
  aria-label="Navigation"
  platformName="Svelte Highlight"
  href="{base}/"
  bind:isSideNavOpen
>
  <div slot="skip-to-content">
    <SkipToContent />
  </div>

  <HeaderUtilities>
    <HeaderActionLink
      icon="{LogoGithub20}"
      href="https://github.com/metonym/svelte-highlight"
      target="_blank"
    />
  </HeaderUtilities>
</Header>

<SideNav bind:isOpen="{isSideNavOpen}">
  <SideNavItems>
    {#each Object.entries(routes) as [href, text]}
      <SideNavLink
        sveltekit:prefetch
        href="{base}{href}"
        text="{text}"
        isSelected="{$page.path === href}"
        on:click="{async () => {
          await tick();
          // TODO: only close if mobile (1056)
          // if (isSideNavOpen) isSideNavOpen = false;
        }}"
      />
    {/each}
  </SideNavItems>
</SideNav>

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
  @media (max-width: 1056px) {
    :global(.bx--content) {
      padding-left: 0;
      padding-right: 0;
    }
  }

  :global(.bx--side-nav ~ .bx--content) {
    margin-left: 0;
  }

  :global(.bx--side-nav__overlay-active) {
    z-index: 1;
  }
</style>
