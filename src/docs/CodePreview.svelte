<script>
  import Highlight from '../Highlight.svelte';
  import typescript from '../languages/typescript';
  export let code = '';
</script>

<style>
  .container {
    display: inline-block;
  }
</style>

<section>
  <h2>Preview</h2>
  <div class="container">
    <Highlight language={typescript}>{`${code}`}</Highlight>
  </div>
</section>
