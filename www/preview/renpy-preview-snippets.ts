export type RenpyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const renpyPreviewSnippets: RenpyPreviewSnippet[] = [
  {
    title: "A basic scene with dialogue",
    description: "labels, scene/show statements, and character dialogue",
    code: `label start:
    scene bg room
    show eileen happy at left
    with dissolve

    e "Hello, {b}world{/b}!"
    e "You have [gold] gold pieces."

    $ gold = gold + 10

    menu:
        "Ask about the weather":
            jump weather
        "Say goodbye":
            return
`,
  },
  {
    title: "Variables and screens",
    description: "define/default statements and a screen block",
    code: `define e = Character("Eileen")
default gold = 0
default has_key = False

screen main_menu():
    vbox:
        textbutton "Start" action Start()
        textbutton "Quit" action Quit()
`,
  },
  {
    title: "Text tags and transforms",
    description: "text formatting tags and a transform definition",
    code: `transform bounce:
    ease 0.5 yoffset -20
    ease 0.5 yoffset 0
    repeat

label show_effects:
    show eileen at bounce
    "{i}This text is italic{/i} and {color=#ff0000}this is red{/color}."
`,
  },
];
