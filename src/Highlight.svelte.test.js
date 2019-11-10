/* eslint-disable no-underscore-dangle */
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/svelte';
import Highlight from './Highlight.wrapper.svelte';
import { typescript } from './languages';

it('matches the snapshot', () => {
  const props = {
    className: 'svelte-highlight',
    language: typescript,
    _code: 'const a: number = 4;'
  };
  const { container, rerender } = render(Highlight, { props });

  expect(container.firstChild).toHaveTextContent(props._code);

  rerender({ props: { _code: 'const b: string = "4";' } });
  expect(container.firstChild).toHaveTextContent('const b: string = "4";');
});
