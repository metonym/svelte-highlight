export type AsymptotePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const asymptotePreviewSnippets: AsymptotePreviewSnippet[] = [
  {
    title: "A smooth curve through control points",
    description: "Bézier path construction with the ..controls.. operator",
    code: `import graph;

size(200);

path g = (0,0)..controls (1,2) and (3,2)..(4,0);
draw(g, blue+linewidth(1.2));
dot((0,0));
dot((4,0));
label("start", (0,0), S);
label("end", (4,0), S);
`,
  },
  {
    title: "A struct for reusable geometry",
    description: "declaring a struct and drawing labeled points from it",
    code: `struct Point {
  real x, y;
  string name;
}

Point[] points = {
  Point(0, 0, "A"),
  Point(2, 1, "B"),
  Point(4, 0, "C"),
};

for (int i = 0; i < points.length; ++i) {
  pair p = (points[i].x, points[i].y);
  dot(p);
  label(points[i].name, p, N);
}
`,
  },
  {
    title: "A filled shape with a pen mix",
    description: "combining pens with + and clipping a filled region",
    code: `size(150);

path square = (0,0)--(2,0)--(2,2)--(0,2)--cycle;
fill(square, red+opacity(0.3));
draw(square, black+linewidth(1));
clip(unitcircle scaled 2 shifted (1,1));
`,
  },
];
