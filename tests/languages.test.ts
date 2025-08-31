import * as languages from "../src/languages";
import type { LanguageType } from "svelte-highlight";

test("Languages", () => {
  const languageNames = Object.keys(languages);

  // @ts-expect-error
  expect(languages.default).toBeUndefined();
  expect(languageNames.length).toEqual(192);
  expect(languageNames).toMatchSnapshot();
});

test("LanguageType", () => {
  const language: LanguageType<"custom-language"> = {
    name: "custom-language",
    register: () => {
      return {
        contains: [],
        tokenize: () => {
          return {
            tokens: [],
          };
        },
      };
    },
  };

  expect(language).toBeTruthy();
});
