<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html) {
    line-height: 1.42;
  }

  @media (max-width: 720px) {
    :global(html) {
      font-size: 14px;
    }
  }

  :global(body) {
    font-family: "Public Sans";
    font-weight: 400;
  }

  main {
    position: absolute;
    top: 0;
    left: 16rem;
    width: calc(100% - 16rem);
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 4rem 2rem 1rem;
    overflow: auto;
  }

  @media (max-width: 720px) {
    main {
      left: 14.5rem;
      width: calc(100% - 14.5rem);
    }
  }
</style>

<main>
  <slot />
</main>
