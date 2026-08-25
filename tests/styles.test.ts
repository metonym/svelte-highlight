import * as styles from "../src/styles";

test("Styles", () => {
  const styleNames = Object.keys(styles);

  // @ts-expect-error
  expect(styles.default).toBeUndefined();
  expect(styleNames.length).toEqual(348);
  expect(styleNames).toMatchSnapshot();
});
