<script>
  import { highlight } from "svelte-highlight";

  let lastEvent = "";
</script>

<pre
><code class="language-typescript" use:highlight>const add = (a, b) => a + b;</code></pre>
<pre
><code use:highlight on:error={() => (lastEvent = "error")}>plain text, no class</code></pre>
<p data-testid="last-event">{lastEvent}</p>
