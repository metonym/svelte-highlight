import type { LanguageType } from "svelte-highlight";
import * as languages from "../src/languages";

test("Languages", () => {
  const languageNames = Object.keys(languages);

  // @ts-expect-error
  expect(languages.default).toBeUndefined();
  expect(languageNames.length).toEqual(247);
  expect(languageNames).toMatchSnapshot();
});

test("LanguageType", () => {
  const language: LanguageType<"custom-language"> = {
    name: "custom-language",
    register: {
      name: "custom-language",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [{ relevance: 1, rules: [] }],
    },
  };

  expect(language).toBeTruthy();
});
