import * as languages from './languages';
import 'highlight.js/styles/github.css';
import Highlight from './Highlight.wrapper.svelte';

export default { title: 'Highlight' };

export const Default = () => ({
  Component: Highlight,
  props: { _code: 'plain text' }
});

Default.story = { name: 'Default (no styles)' };

export const TypeScript = () => ({
  Component: Highlight,
  props: {
    language: languages.typescript,
    _code: `function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`
  }
});

TypeScript.story = { name: 'TypeScript' };

export const HTML = () => ({
  Component: Highlight,
  props: {
    language: languages.xml,
    _code: `<body>
  <h1>Hello World</h1>
</body>`
  }
});

HTML.story = { name: 'HTML' };
