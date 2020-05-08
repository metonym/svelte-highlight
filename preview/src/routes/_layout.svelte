<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :global(html) {
    line-height: 1.42;
  }

  :global(body) {
    font-family: "Public Sans";
    font-weight: 400;
  }

  main {
    position: absolute;
    top: 0;
    right: 0;
    width: calc(100% - 16rem);
    height: 100vh;
    display: flex;
    flex-direction: column;
    margin-left: 16rem;
    padding: 4rem 2rem 1rem;
    overflow: auto;
  }
</style>

<main>
  <slot />
</main>
