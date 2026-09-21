// The full ChoiceScript command vocabulary. Gating the leading `*` on this
// exact word list -- rather than any `*word` -- keeps a Markdown bullet
// (`* just a list item`) or emphasis (`*text*`) from being mistaken for a
// command.
const CHOICESCRIPT_COMMANDS =
  "if|elseif|else|choice|fake_choice|create|temp|set|delete|goto|goto_scene|" +
  "goto_random_scene|gosub|gosub_scene|return|label|finish|ending|" +
  "scene_list|title|author|achievement|achieve|stat_chart|input_text|" +
  "input_number|rand|page_break|line_break|image|sound|link|" +
  "redirect_scene|selectable_if|params|hide_reuse|disable_reuse|" +
  "allow_reuse|check_achievements|save_checkpoint|restore_checkpoint|" +
  "check_registration|purchase|restore_purchases|save_game|delete_game|" +
  "show_password|abort|constant|ifid";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineChoicescript(hljs) {
  const INTERPOLATION = {
    className: "template-variable",
    begin: /\$(?:!!?)?\{[\w.]+\}/,
    relevance: 0,
  };

  // Longest first so a shorter operator (e.g. `+`) can't shadow one of its
  // longer siblings (e.g. `+=`).
  const OPERATOR = {
    className: "operator",
    begin: /%\+|%-|\+=|-=|\*=|\/=|<=|>=|!=|=|<|>|\+|-|\*|\/|%|&/,
    relevance: 0,
  };

  // `*comment ...` is a whole-line comment -- checked before the generic
  // command mode so it wins the match.
  const COMMENT_LINE = {
    className: "comment",
    begin: /^\s*\*comment\b.*$/,
  };

  // The structural anchor: `*` immediately followed by a known command word,
  // spanning to end of line. Expression words (`and`/`or`/`not`) and
  // literals are scoped to just this line, not the whole document, so
  // narrative prose paragraphs are never affected.
  const COMMAND_LINE = {
    begin: [/^\s*\*/, new RegExp(CHOICESCRIPT_COMMANDS), /\b/],
    beginScope: { 2: "keyword" },
    end: /$/,
    relevance: 5,
    keywords: {
      keyword: "and or not",
      literal: "true false",
    },
    contains: [
      OPERATOR,
      INTERPOLATION,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
    ],
  };

  // `#Option text` under `*choice`/`*fake_choice` (mirrors how Ink treats
  // its `*`/`+` choice markers as a low-relevance bullet).
  const OPTION = {
    className: "bullet",
    begin: /^\s*#/,
    relevance: 0,
  };

  return {
    name: "choicescript",
    contains: [COMMENT_LINE, COMMAND_LINE, OPTION, INTERPOLATION],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineChoicescript(hljs);
}

export const choicescript = { name: "choicescript", register };
export default choicescript;
