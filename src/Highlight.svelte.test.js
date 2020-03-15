/* eslint-disable no-underscore-dangle */
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent } from '@testing-library/svelte';
import Highlight from './Highlight.wrapper.svelte';
import { typescript } from './languages';

test('slot', () => {
  const props = {
    className: 'svelte-highlight',
    style: '',
    language: typescript,
    _code: 'const a: number = 4;',
    renderCodeProp: false,
    contenteditable: 'false',
    spellcheck: 'false'
  };
  const { container, rerender } = render(Highlight, { props });
  expect(container.firstChild).toHaveTextContent(props._code);
  rerender({ props: { _code: 'const b: string = "4";' } });
  expect(container.firstChild).toHaveTextContent('const b: string = "4";');
});

test('code prop', () => {
  const props = {
    className: 'svelte-highlight',
    style: '',
    language: typescript,
    _code: 'const a: number = 4;',
    renderCodeProp: true,
    contenteditable: 'false',
    spellcheck: 'false'
  };
  const { container, rerender } = render(Highlight, { props });
  expect(container.firstChild).toHaveTextContent(props._code);
  rerender({ props: { _code: 'const b: string = "4";' } });
  expect(container.firstChild).toHaveTextContent('const b: string = "4";');
});

test('contenteditable', async () => {
  const props = {
    className: 'svelte-highlight',
    style: '',
    language: typescript,
    _code: 'const a: number = 4;',
    contenteditable: 'true',
    spellcheck: true
  };
  const { container } = render(Highlight, { props });
  expect(container.querySelector('pre').getAttribute('contenteditable')).toEqual('true');
  expect(container.querySelector('pre').getAttribute('spellcheck')).toEqual('true');

  await fireEvent.focus(container.querySelector('pre'));
  await fireEvent.blur(container.querySelector('pre'));
  await fireEvent.focus(container.querySelector('pre'));
  container.querySelector('pre').innerHTML = '';
  await fireEvent.blur(container.querySelector('pre'));
  expect(container.querySelector('pre').innerHTML).toEqual('<code></code>');
});
