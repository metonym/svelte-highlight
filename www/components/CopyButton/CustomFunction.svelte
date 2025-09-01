<script lang="ts">
  import { Highlight, CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = `class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
  
  multiply(a, b) {
    return a * b;
  }
  
  divide(a, b) {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3));`;

  function customCopy(text: string) {
    // Add custom logic here - could be analytics, logging, etc.
    console.log("Custom copy function called with:", text);

    // You could also modify the text before copying
    const modifiedText = "// Copied from svelte-highlight examples\n" + text;

    // Return true for success, false for failure
    return navigator.clipboard
      .writeText(modifiedText)
      .then(() => true)
      .catch(() => false);
  }
</script>

<div class="highlight-wrapper">
  <Highlight language={typescript} {code} class="github">
    <CopyButton
      {code}
      copyFn={customCopy}
      copyText="Custom Copy"
      copiedText="Done!"
      copyTimeout={3000}
    />
  </Highlight>
</div>

<style>
  .highlight-wrapper {
    position: relative;
  }

  :global(.github) {
    margin: 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
