import { expect, test } from "bun:test";
import * as styles from "../src/styles";

test("Styles", () => {
  const styleNames = Object.keys(styles);

  // @ts-expect-error
  expect(styles.default).toBeUndefined();
  expect(styleNames.length).toEqual(249);
  expect(styleNames).toMatchSnapshot();
});
