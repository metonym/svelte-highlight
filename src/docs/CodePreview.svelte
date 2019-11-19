<script>
  export let code = '';

  import Highlight from '../Highlight.svelte';
  import language from '../languages/typescript';
</script>

<style>
  .container {
    display: inline-block;
  }
</style>

<section>
  <h2>Preview</h2>
  <div class="container">
    <Highlight {language} {code} />
  </div>
</section>
