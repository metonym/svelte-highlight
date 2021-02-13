<script context="module">
  export function preload() {
    return this.fetch("themes.json")
      .then((r) => r.json())
      .then((posts) => {
        return { posts };
      });
  }
</script>

<script>
  export let posts;
</script>

<svelte:head>
  <title>Themes</title>
</svelte:head>

<h1 class="p-3">Themes</h1>

<ul class="d-flex flex-wrap">
  {#each posts as post}
    <li class="mb-2">
      <h4 class="ml-3 mb-2"><a href="themes/{post.slug}">{post.title}</a></h4>
      <iframe
        class="border-0"
        loading="lazy"
        title="{post.title}"
        src="themes/{post.slug}"></iframe>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
  }

  li {
    width: 50%;
    min-height: 380px;
  }

  iframe {
    width: 100%;
    height: 300px;
  }
</style>
