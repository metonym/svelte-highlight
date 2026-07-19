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

  /** @type {Record<string, string>} */
  const navRoutes = {
    "/languages": "Languages",
    "/styles": "Styles",
  };

  /** @type {Record<string, string>} */
  const hiddenRoutes = {
    "/preview-svelte": "Svelte language preview",
    "/preview-vue": "Vue language preview",
    "/preview-mdx": "MDX language preview",
    "/preview-marko": "Marko language preview",
    "/preview-hcl": "HCL language preview",
    "/preview-prisma": "Prisma language preview",
    "/preview-solidity": "Solidity language preview",
    "/preview-zig": "Zig language preview",
    "/preview-toml": "TOML language preview",
    "/preview-fish": "fish language preview",
    "/preview-nushell": "Nushell language preview",
    "/preview-gleam": "Gleam language preview",
    "/preview-json5": "JSON5 language preview",
    "/preview-jsonc": "JSONC language preview",
    "/preview-dotenv": "dotenv language preview",
    "/preview-groq": "GROQ language preview",
    "/preview-wgsl": "WGSL language preview",
    "/preview-cypher": "Cypher language preview",
    "/preview-promql": "PromQL language preview",
    "/preview-bicep": "Bicep language preview",
    "/preview-rescript": "ReScript language preview",
    "/preview-starlark": "Starlark language preview",
    "/preview-move": "Move language preview",
    "/preview-cairo": "Cairo language preview",
    "/preview-vyper": "Vyper language preview",
    "/preview-clarity": "Clarity language preview",
    "/preview-cue": "CUE language preview",
    "/preview-jsonnet": "Jsonnet language preview",
    "/preview-dhall": "Dhall language preview",
    "/preview-pkl": "Pkl language preview",
    "/preview-nickel": "Nickel language preview",
    "/preview-pug": "Pug language preview",
    "/preview-razor": "Razor language preview",
    "/preview-v": "V language preview",
    "/preview-odin": "Odin language preview",
    "/preview-caddy": "Caddyfile language preview",
    "/preview-d2": "D2 language preview",
    "/preview-bibtex": "BibTeX language preview",
    "/preview-ansi": "AnsiOutput preview",
    "/preview-dual-theme": "Dual light/dark HighlightStyle preview",
    "/preview-editable": "Editable highlight preview",
    "/preview-highlight-stream": "HighlightStream preview",
    "/preview-virtual": "HighlightVirtual preview",
    "/preview-jq": "jq language preview",
    "/preview-kql": "KQL language preview",
    "/preview-logql": "LogQL language preview",
    "/preview-rego": "Rego language preview",
    "/preview-dax": "DAX language preview",
    "/preview-typst": "Typst language preview",
    "/preview-rst": "reStructuredText language preview",
    "/preview-templ": "templ language preview",
    "/preview-hlsl": "HLSL language preview",
    "/preview-just": "just language preview",
    "/preview-gdscript": "GDScript language preview",
    "/preview-heex": "HEEx language preview",
    "/preview-sparql": "SPARQL language preview",
    "/preview-define-theme": "defineTheme preview",
  };

  $: path = pathname === "/" ? pathname : pathname.replace(/\/$/, "");
  $: title = navRoutes[path] ?? hiddenRoutes[path] ?? "Svelte Highlight";
</script>

<Header aria-label="Navigation" platformName="Svelte Highlight" href="/">
  <span class="flex align-baseline" slot="platform">
    Svelte Highlight
    <span class:version={true} class="code-01" style="color: #c6c6c6">
      v{PKG_VERSION}
    </span>
  </span>
  <svelte:fragment slot="skipToContent"> <SkipToContent /> </svelte:fragment>
  <HeaderNav>
    {#each Object.entries(navRoutes) as [ href, text ]}
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
      <Column> <h2>{title}</h2> </Column>
    </Row>
    <slot />
  </Grid>
</Content>

<style>
  :global(.bx--header__nav) {
    display: block;
  }

  :global(.bx--side-nav__overlay-active) {
    z-index: calc(10 + 1); /* above code snippet overlays */
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
