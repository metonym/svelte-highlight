/**
 * Converts a dash/period separated string into pascal case
 * @example
 * "one-two-three" --> "oneTwoThree"
 * "one.two.three" --> "oneTwoThree"
 */
export const toCamelCase = (str: string) =>
  str
    .split(new RegExp(/-|\./g))
    .map((fragment, index) => {
      if (index === 0) return fragment;
      return [fragment.slice(0, 1).toUpperCase(), fragment.slice(1)].join("");
    })
    .join("");
