export type FluentPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const fluentPreviewSnippets: FluentPreviewSnippet[] = [
  {
    title: "Browser menu strings",
    description: "messages, a brand term, and access-key attributes",
    code: `### Localization for the main menu.

## Brand

-brand-short-name = Firefox
    .gender = masculine

## File menu

menu-file = File
    .accesskey = F
menu-new-window = New Window
    .accesskey = N
menu-quit = Quit { -brand-short-name }
    .accesskey = Q

# Variables:
#   $url (String) - the address of the open page
page-info-title = Page Info — { $url }`,
  },
  {
    title: "Plurals and gender",
    description: "select expressions with default variants",
    code: `# Variables:
#   $userName (String) - the user who shared the photos
#   $photoCount (Number) - how many photos they added
#   $userGender (String) - "male", "female", or "other"
shared-photos =
    { $userName } { $photoCount ->
        [one] added a new photo
       *[other] added { $photoCount } new photos
    } to { $userGender ->
        [male] his stream
        [female] her stream
       *[other] their stream
    }.

unread-emails =
    { $unreadEmails ->
        [0] You have no unread emails.
        [one] You have one unread email.
       *[other] You have { $unreadEmails } unread emails.
    }`,
  },
  {
    title: "Formatting functions",
    description: "NUMBER and DATETIME with named arguments",
    code: `# Variables:
#   $amount (Number) - the order total
#   $orderDate (Date) - when the customer placed the order
order-total = Total: { NUMBER($amount, style: "currency", currency: "EUR") }
order-placed = Placed on { DATETIME($orderDate, month: "long", day: "numeric") }

download-progress =
    { NUMBER($percent, maximumFractionDigits: 0) ->
        [100] Download complete
       *[other] Downloading… { NUMBER($percent, maximumFractionDigits: 0) }%
    }`,
  },
  {
    title: "Terms with variants",
    description: "a term that changes form by grammatical case",
    code: `-brand-name =
    { $case ->
       *[nominative] Firefox
        [genitive] Firefoxa
        [locative] Firefoksie
    }

about-brand = O programie { -brand-name(case: "locative") }
update-brand = Aktualizacja { -brand-name(case: "genitive") }
settings-title = { preferences-window.title }
nbsp-units = 10{"\\u00A0"}MB`,
  },
];
