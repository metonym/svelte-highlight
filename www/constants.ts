import pkg from "../package.json";

export const PKG_NAME = pkg.name;
export const PKG_VERSION = pkg.version;
export const PKG_HOMEPAGE = pkg.homepage;
export const PKG_HLJS_VERSION = pkg.dependencies["highlight.js"];
