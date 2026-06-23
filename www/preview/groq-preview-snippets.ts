export type GroqPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const groqPreviewSnippets: GroqPreviewSnippet[] = [
  {
    title: "Filtering and projections",
    description: "the everything operator, filters, and projections",
    code: `*[_type == "movie" && releaseYear >= 2018]{
  _id,
  title,
  releaseYear,
  "genres": genres[]->name
} | order(releaseYear desc)`,
  },
  {
    title: "Dereferencing and parameters",
    description: "references, parameters, and joins",
    code: `*[_type == "author" && _id == $authorId][0]{
  name,
  "posts": *[_type == "post" && references(^._id)]{
    title,
    publishedAt
  }
}`,
  },
  {
    title: "Functions and matching",
    description: "built-in functions, text matching, and counting",
    code: `{
  "featured": *[_type == "post" && featured == true]{ title },
  "search": *[_type == "post" && title match "svelte*"]{ title },
  "total": count(*[_type == "post"]),
  "plain": *[_type == "post"][0]{ "text": pt::text(body) }
}`,
  },
];
