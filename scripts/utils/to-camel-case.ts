import { DASH_OR_PERIOD } from "./regexes.ts";

/** "one-two.three" -> "oneTwoThree" */
export const toCamelCase = (str: string) =>
  str
    .split(DASH_OR_PERIOD)
    .map((fragment, index) => {
      if (index === 0) return fragment;
      return [fragment.slice(0, 1).toUpperCase(), fragment.slice(1)].join("");
    })
    .join("");
