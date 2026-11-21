export type PoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const poPreviewSnippets: PoPreviewSnippet[] = [
  {
    title: "POT template header",
    description: "the header entry that xgettext writes to a new template",
    code: `# SOME DESCRIPTIVE TITLE.
# Copyright (C) YEAR THE PACKAGE'S COPYRIGHT HOLDER
# This file is distributed under the same license as the PACKAGE package.
# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR.
#
#, fuzzy
msgid ""
msgstr ""
"Project-Id-Version: hello 2.12\\n"
"Report-Msgid-Bugs-To: bug-hello@gnu.org\\n"
"POT-Creation-Date: 2024-03-02 14:21+0100\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"Language: \\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=INTEGER; plural=EXPRESSION;\\n"
`,
  },
  {
    title: "C program catalog",
    description: "French entries with c-format strings and a fuzzy match",
    code: `#. TRANSLATORS: --help output 1 (synopsis)
#. no-wrap
#: src/hello.c:142
#, c-format
msgid "Usage: %s [OPTION]...\\n"
msgstr "Utilisation : %s [OPTION]...\\n"

#: src/hello.c:153
msgid ""
"Print a friendly, customizable greeting.\\n"
"\\n"
msgstr ""
"Afficher un message de bienvenue personnalisable.\\n"
"\\n"

#: src/hello.c:225
#, fuzzy, c-format
#| msgid "%s: extra operand: %s\\n"
msgid "%s: extra operand: %s"
msgstr "%s : opérande superflu : %s\\n"

#~ msgid "hello, world"
#~ msgstr "bonjour, le monde"
`,
  },
  {
    title: "Django plural forms",
    description: "Polish plurals with python-format and a message context",
    code: `#: shop/models.py:48
msgctxt "order status"
msgid "Shipped"
msgstr "Wysłane"

#: shop/views.py:112
#, python-format
msgid "%(count)d item in your cart"
msgid_plural "%(count)d items in your cart"
msgstr[0] "%(count)d produkt w koszyku"
msgstr[1] "%(count)d produkty w koszyku"
msgstr[2] "%(count)d produktów w koszyku"

#: shop/templates/shop/checkout.html:31
#, python-format
msgid "Total: %(total).2f %(currency)s"
msgstr "Razem: %(total).2f %(currency)s"
`,
  },
  {
    title: "Brace-format strings",
    description: "a Babel catalog for a Python app that uses str.format",
    code: `#: app/notifications.py:27
#, python-brace-format
msgid "Welcome back, {name}!"
msgstr "Willkommen zurück, {name}!"

#: app/notifications.py:41
#, python-brace-format
msgid "Your trial ends in {days} day."
msgid_plural "Your trial ends in {days} days."
msgstr[0] "Deine Testphase endet in {days} Tag."
msgstr[1] "Deine Testphase endet in {days} Tagen."

#: app/billing.py:88
#, python-brace-format
msgid "Paid {amount:.2f} with card ending in {last4}"
msgstr "{amount:.2f} mit Karte endend auf {last4} bezahlt"
`,
  },
];
