export type RonPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const ronPreviewSnippets: RonPreviewSnippet[] = [
  {
    title: "A basic config struct",
    description: "an attribute, a named struct, and typed fields",
    code: `#![enable(implicit_some)]
GameConfig(
    window_title: "My Game",
    resolution: (1920, 1080),
    fullscreen: false,
    volume: 0.8,
    difficulty: Hard,
    save_slot: None,
    tags: ["action", "rpg"],
)
`,
  },
  {
    title: "Maps and nested structs",
    description: "map literals and nested struct values",
    code: `Scene(
    name: "Level1",
    entities: {
        "player": Entity(position: (0.0, 0.0), health: 100),
        "enemy1": Entity(position: (10.0, 5.0), health: 50),
    },
)
`,
  },
  {
    title: "Numbers and strings",
    description: "hex/binary numbers, raw strings, and byte strings",
    code: `Settings(
    flags: 0xFF,
    mask: 0b1010_0101,
    label: r#"raw "quoted" text"#,
    magic: b"\\x00\\x01",
)
`,
  },
];
