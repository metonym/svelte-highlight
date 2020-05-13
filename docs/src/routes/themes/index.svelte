<script context="module">
  export function preload() {
    return this.fetch("themes.json")
      .then(r => r.json())
      .then(posts => {
        return { posts };
      });
  }
</script>

<script>
  export let posts;
</script>

<style>
  ul {
    list-style: none;
  }

  li {
    width: 50%;
    min-height: 330px;
  }

  iframe {
    width: 100%;
    height: 290px;
  }
</style>

<svelte:head>
  <title>Themes</title>
</svelte:head>

<h1 class="p-3">Themes</h1>

<ul class="d-flex flex-wrap">
  {#each posts as post}
    <li class="mb-2">
      <h3 class="ml-3 mb-2">
        <a href="themes/{post.slug}">{post.title}</a>
      </h3>
      <iframe
        class="border-0"
        loading="lazy"
        title={post.title}
        src="themes/{post.slug}" />
    </li>
  {/each}
</ul>
