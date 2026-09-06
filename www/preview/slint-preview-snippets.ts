export type SlintPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const slintPreviewSnippets: SlintPreviewSnippet[] = [
  {
    title: "Slider component",
    description: "a two-way binding between a handle and a property",
    code: `// a slider component
export component Slider {
    in-out property <int> value: 0;
    callback changed(int);

    Rectangle {
        background: #3a3a3a;
        width: 200px;
        height: 24px;

        handle := Rectangle {
            width: 12px;
            x <=> root.value;
        }
    }
}
`,
  },
  {
    title: "States and transitions",
    description: "the states and transitions blocks",
    code: `component Toggle {
    in-out property <bool> checked: false;

    states [
        active when checked: {
            background: #4caf50;
        }
        inactive when !checked: {
            background: #cccccc;
        }
    ]

    transitions [
        in active: {
            animate background { duration: 150ms; }
        }
    ]
}`,
  },
  {
    title: "Imports and images",
    description: "importing components and referencing image assets",
    code: `import { Button, VerticalBox } from "std-widgets.slint";

export component App inherits Window {
    VerticalBox {
        Image {
            source: @image-url("logo.png");
        }
        Button {
            text: @tr("Click me");
        }
    }
}`,
  },
];
