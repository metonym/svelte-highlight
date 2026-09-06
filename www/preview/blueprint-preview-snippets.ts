export type BlueprintPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const blueprintPreviewSnippets: BlueprintPreviewSnippet[] = [
  {
    title: "A simple window",
    description: "a template, a nested widget, and a signal handler",
    code: `using Gtk 4.0;

template $MyWidget : Adw.Window {
  title: _("My App");

  Gtk.Box box {
    orientation: vertical;
    styles ["card"]

    Gtk.Button button {
      label: "Click me";
      clicked => $on_clicked() swapped;
    }
  }
}`,
  },
  {
    title: "Bindings",
    description: "bind and bind-property between widgets",
    code: `Gtk.Label label {
  label: bind button.label;
  visible: bind-property button.visible inverted;
}`,
  },
  {
    title: "Menus",
    description: "the menu and section keywords",
    code: `menu my_menu {
  section {
    item {
      label: _("Preferences");
      action: "app.preferences";
    }
  }
}`,
  },
];
