import * as languages from "../src/languages";

test("Languages", () => {
  const languageNames = Object.keys(languages);

  // @ts-expect-error
  expect(languages.default).toBeUndefined();
  expect(languageNames.length).toEqual(192);
  expect(languageNames).toMatchSnapshot();
});
