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
  import { LogoGithub } from "carbon-icons-svelte";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import Footer from "../lib/Footer.svelte";

  const routes = {
    "/": "Svelte Highlight",
    "/languages": "Languages",
    "/styles": "Styles",
  };

  const HOMEPAGE = process.env.HOMEPAGE;
  const VERSION_PACKAGE = process.env.VERSION_PACKAGE;

  let isSideNavOpen = false;

  $: pathname = $page.url.pathname;
  $: title = routes[pathname];
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
  <span class="flex align-baseline" slot="platform">
    Svelte Highlight
    <span class="code-01" style="color: #c6c6c6">
      v{VERSION_PACKAGE}
    </span>
  </span>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>

  <HeaderUtilities>
    <HeaderActionLink icon={LogoGithub} href={HOMEPAGE} target="_blank" />
  </HeaderUtilities>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    {#each Object.entries(routes) as [href, text]}
      <SideNavLink
        sveltekit:reload
        sveltekit:prefetch
        href="{base}{href}"
        text={href === "/" ? "Getting Started" : text}
        isSelected={pathname === href}
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
    <Footer />
  </Grid>
</Content>

<style>
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
</style>
