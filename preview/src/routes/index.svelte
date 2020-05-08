<script>
  import HighlightLegacy, {
    Highlight,
    HighlightSvelte
  } from "svelte-highlight";
  import CodeUsage from "../components/CodeUsage.svelte";
  import ThemePicker from "../components/ThemePicker.svelte";

  let currentStyle = undefined;
</script>

<style>
  header {
    display: flex;
    height: 3rem;
  }

  h1 {
    font-size: 1.125rem;
  }

  a {
    color: #0f62fe;
  }

  a span {
    font-size: 0.875rem;
    color: #161616;
  }
</style>

<ThemePicker bind:currentStyle>
  <header>
    <h1>
      <a href="https://github.com/metonym/svelte-highlight">
        svelte-highlight
        <span>v0.6.0</span>
      </a>
    </h1>
  </header>
</ThemePicker>
<CodeUsage {currentStyle} />
