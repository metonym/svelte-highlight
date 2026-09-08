export type HtmlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const htmlPreviewSnippets: HtmlPreviewSnippet[] = [
  {
    title: "Markup with attributes and a comment",
    description: "tags, attributes, and an HTML comment",
    code: `<!DOCTYPE html>
<!-- page shell -->
<div id="main" class="page">
  <a href="https://example.com" target="_blank">Learn more</a>
</div>`,
  },
  {
    title: "Embedded style and script",
    description: "a <style> block and a <script> block inside the document",
    code: `<style>
  .content {
    display: flex;
  }
</style>
<script>
  const x = 1;
  console.log(x);
</script>`,
  },
  {
    title: "Form with entities",
    description: "form controls plus an HTML entity in the body text",
    code: `<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />
  <button type="submit">Sign up &amp; confirm</button>
</form>`,
  },
];
