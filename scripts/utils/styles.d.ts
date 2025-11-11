import type * as styles from "../../src/styles.ts";

type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Lowercase<C>}${KebabCase<T>}`
    : `${Lowercase<C>}-${KebabCase<T>}`
  : S;

export type ThemeModuleName = keyof typeof styles;

export type ThemeName = KebabCase<Theme>;
