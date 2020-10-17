function toPascalCase(str) {
  return str
    .split(new RegExp(/-|\./g))
    .map((fragment, index) => {
      if (index === 0) {
        return fragment;
      }

      return [fragment.slice(0, 1).toUpperCase(), fragment.slice(1)].join("");
    })
    .join("");
}

module.exports = { toPascalCase };
