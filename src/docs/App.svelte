<script>
  import './style.css';
  import ThemePicker from './ThemePicker.svelte';
  import CodePreview from './CodePreview.svelte';
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
</style>

<ThemePicker
  {currentStyle}
  updateStyle={style => {
    currentStyle = style;
  }}>
  <header>
    <h1>
      <a href="https://github.com/metonym/svelte-highlight">svelte-highlight</a>
    </h1>
  </header>
</ThemePicker>

<main>
  <CodePreview {code} />
  <CodeUsage {code} {currentStyle} />
</main>
