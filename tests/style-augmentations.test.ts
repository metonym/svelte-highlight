import augmentations from "../www/data/style-augmentations.json";

test("style augmentations", () => {
  // Every entry represents a theme where at least one of the two build
  // passes (dead-declaration removal, similarity gap-fill) actually changed
  // something — themes left untouched are omitted entirely, so this list is
  // the heuristic for "which stylesheets were augmented" during the build.
  expect(augmentations.length).toBeGreaterThan(0);

  for (const entry of augmentations) {
    expect(entry.deadDeclarationsRemoved).toBeGreaterThanOrEqual(0);
    expect(entry.gapsFilled).toBeGreaterThanOrEqual(0);
    expect(entry.deadDeclarationsRemoved > 0 || entry.gapsFilled > 0).toBe(
      true,
    );
  }

  const names = augmentations.map((entry) => entry.name);
  expect(names).toEqual([...names].sort());

  expect(augmentations).toMatchSnapshot();
});
