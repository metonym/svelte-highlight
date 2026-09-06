export type KvPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kvPreviewSnippets: KvPreviewSnippet[] = [
  {
    title: "A simple rule",
    description: "a rule header, a canvas block, and a Python expression",
    code: `#:kivy 2.0
#:import utils app.utils

<MyWidget@BoxLayout>:
  orientation: "vertical"
  canvas.before:
    Color:
      rgba: 1, 1, 1, 1

  Label:
    text: "Hello, {}".format(self.name)
    on_press: root.handle_press(self)
`,
  },
  {
    title: "App references",
    description: "root, self, and app in property expressions",
    code: `<RootWidget>:
  size_hint: None, None
  on_touch_down: app.handle_touch(self, root)`,
  },
  {
    title: "Nested children",
    description: "widget instantiation without an explicit class name",
    code: `BoxLayout:
  orientation: "horizontal"

  Button:
    text: "OK"

  Button:
    text: "Cancel"`,
  },
];
