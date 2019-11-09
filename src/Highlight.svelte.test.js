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
  const { container, component } = render(Highlight, { props });

  expect(component).toMatchSnapshot();
  expect(container.firstChild).toHaveTextContent(props._code);
});
