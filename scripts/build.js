const { buildHljsLanguages } = require('./buildHljsLanguages');
const { buildHljsStyles } = require('./buildHljsStyles');

async function build() {
  await buildHljsLanguages();
  await buildHljsStyles();
}

build();

module.exports = { build };
