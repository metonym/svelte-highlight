import * as styles from "svelte-highlight/styles";

const posts = Object.keys(styles).map((style) => {
  return {
    title: style,
    slug: style.startsWith("_") ? style.slice(1) : style,
  };
});

export default posts;
