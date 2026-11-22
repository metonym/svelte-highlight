<script>
  import Code from "./Code.svelte";

  let { code, language, themes, file, keys } = $props();
  let index = $state(0);
  const [name, theme] = $derived(themes[index]);

  // `t` cycles the theme. `keys` is opentui's key input.
  $effect(() => {
    const onKey = (key) => {
      if (key.name === "t") index = (index + 1) % themes.length;
    };
    keys?.on("keypress", onKey);
    return () => keys?.off("keypress", onKey);
  });
</script>

<box flexDirection="column" padding={1}>
  <Code {code} {language} {theme} title={` ${file} · ${name} `} />
  <text>
    <span fg="#8b949e">t theme · q quit</span>
  </text>
</box>
