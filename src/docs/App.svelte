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
    padding: 1rem 2rem;
    overflow: auto;
  }
</style>

<ThemePicker
  {currentStyle}
  updateStyle={style => {
    currentStyle = style;
  }} />

<main>
  <CodePreview {code} />
  <CodeUsage {code} {currentStyle} />
</main>
