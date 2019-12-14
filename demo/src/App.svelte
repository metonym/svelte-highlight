<script>
  import ThemePicker from './ThemePicker.svelte';
  import CodeUsage from './CodeUsage.svelte';

  let currentStyle = 'a11yLight';

  const code = [
    'function add(a: number, b: number) {',
    '  return a + b;',
    '}\n',
    'const sum = add(1, 2);'
  ].join('\n');
</script>

<style>
  main {
    position: absolute;
    top: 0;
    right: 0;
    width: calc(100% - 16rem);
    height: 100vh;
    display: flex;
    flex-direction: column;
    margin-left: 16rem;
    padding: 4rem 2rem 1rem;
    overflow: auto;
  }

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

<ThemePicker
  {currentStyle}
  on:style={({ detail: style }) => {
    currentStyle = style;
  }}>
  <header>
    <h1>
      <a href="https://github.com/metonym/svelte-highlight">
        svelte-highlight
        <span>v{window.version}</span>
      </a>
    </h1>
  </header>
</ThemePicker>

<main>
  <CodeUsage {code} {currentStyle} />
</main>
