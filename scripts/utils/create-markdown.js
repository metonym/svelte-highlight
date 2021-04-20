const pkg = require("../../package.json");

/**
 * Creates header metadata for supported languages/styles
 * @param {"Languages" | "Styles"} type 
 * @param {number} len 
 * @returns {string}
 */
function createMarkdown(type, len) {
    return `# Supported ${type}

> ${len} ${type.toLowerCase()} exported from highlight.js@${pkg.dependencies["highlight.js"]}  
`
}

module.exports = { createMarkdown }