import bashRegister from "highlight.js/lib/languages/bash";
import dockerfileRegister from "highlight.js/lib/languages/dockerfile";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineEarthfile(hljs) {
  // Multi-word Earthly commands first so `SAVE` is not left as leftover text.
  const EARTHLY_COMMAND = {
    className: "keyword",
    begin:
      /\b(?:SAVE ARTIFACT|SAVE IMAGE|GIT CLONE|WITH DOCKER|ELSE IF|VERSION|LOCALLY|BUILD|WAIT|FUNCTION|COMMAND|IMPORT|CACHE|HOST|PROJECT|ARG|LET|SET|FOR|IF|ELSE|END|TRY|CATCH|FINALLY|DO)\b/,
    relevance: 10,
  };

  const TARGET = {
    className: "title.function",
    begin: /^[A-Za-z_][\w.-]*(?=:)/m,
    relevance: 5,
  };

  return {
    name: "Earthfile",
    aliases: ["earthfile", "earthly"],
    subLanguage: "dockerfile",
    contains: [hljs.HASH_COMMENT_MODE, EARTHLY_COMMAND, TARGET],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("bash", bashRegister);
  hljs.registerLanguage("dockerfile", dockerfileRegister);
  return defineEarthfile(hljs);
}

export const earthfile = { name: "earthfile", register };
export default earthfile;
