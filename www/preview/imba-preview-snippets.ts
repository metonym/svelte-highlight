export type ImbaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const imbaPreviewSnippets: ImbaPreviewSnippet[] = [
  {
    title: "Card component",
    description: "a tag definition with inline css and a render method",
    code: `# a card component with inline css
tag Card
  css .card
    padding: 8px

  def render
    <self.card>
      <div.title> "Hello"
      <button @click=onClick> "Click"`,
  },
  {
    title: "Control flow",
    description: "if/elif/else, unless, and the yes/no literals",
    code: `def visible? state
  if state.open
    yes
  elif state.pending
    no
  else
    unless state.archived
      yes`,
  },
  {
    title: "Attributes and refs",
    description: "id, attribute, and $ref selectors on a tag literal",
    code: `def render
  <self>
    <input#email $emailRef [placeholder="Email"]>
    <button.primary @click=submit> "Submit"`,
  },
];
