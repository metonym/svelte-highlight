import yamlRegister from "highlight.js/lib/languages/yaml";
import gotmpl from "./gotmpl.js";

const HELM_BUILT_INS =
  "include required toYaml toYamlPretty mustToYaml fromYaml fromYamlArray toJson mustToJson fromJson fromJsonArray toToml fromToml mustToToml nindent indent quote default tpl lookup trunc trimSuffix upper lower b64enc sha256sum fail dict";

const HELM_ROOTS =
  /\.(?:Values|Release|Chart|Capabilities|Files|Template)\b(?:\.[A-Za-z_][\w.]*)?/;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHelm(hljs) {
  const base = /** @type {any} */ (gotmpl.register(hljs));
  const [comment, action] = base.contains;

  const HELM_ROOT_FIELD = {
    className: "built_in",
    begin: HELM_ROOTS,
    relevance: 10,
  };

  const helmAction = {
    ...action,
    keywords: {
      ...action.keywords,
      built_in: `${action.keywords.built_in} ${HELM_BUILT_INS}`,
    },
    contains: [HELM_ROOT_FIELD, ...action.contains],
  };

  return {
    name: "Helm",
    aliases: ["helm-template"],
    subLanguage: "yaml",
    contains: [comment, helmAction],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("yaml", yamlRegister);
  return defineHelm(hljs);
}

export const helm = { name: "helm", register };
export default helm;
