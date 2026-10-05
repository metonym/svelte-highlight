import { createAnsiSession } from "../src/ansi.js";
import { classNames, inlineStyle } from "../src/ansi-color.js";
import { createAnsiOutput } from "../src/ansi-output.js";

const ESC = "\x1b";

/**
 * What AnsiOutput rendered before it went incremental: every segment of a
 * session fed `text`, mapped from scratch.
 */
function fullRender(text: string, autoContrast: boolean) {
  const session = createAnsiSession();
  session.append(text);
  return session.segments().map((segment) => ({
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment, autoContrast),
    link: segment.link,
  }));
}

const INPUT = [
  `${ESC}[31;47mred on white${ESC}[0m `,
  `${ESC}[38;5;208mindexed\n`,
  `${ESC}[1;4mbold underline${ESC}[0m `,
  `see ${ESC}]8;;https://example.com${ESC}\\docs${ESC}]8;;${ESC}\\ `,
  "building 50%\rbuilding 100%\rdone\n",
  `${ESC}[30;40mblack on black${ESC}[0m`,
].join("");

describe("createAnsiOutput", () => {
  it("matches a full render after every chunk, at every chunk size", () => {
    for (let size = 1; size <= 40; size += 1) {
      const output = createAnsiOutput();
      let text = "";
      for (let i = 0; i < INPUT.length; i += size) {
        text += INPUT.slice(i, i + size);
        expect(output.update(text, true)).toEqual(fullRender(text, true));
      }
    }
  });

  it("rebuilds every style when autoContrast changes", () => {
    const output = createAnsiOutput();
    output.update(INPUT, true);
    expect(output.update(INPUT, false)).toEqual(fullRender(INPUT, false));
    expect(output.update(INPUT, true)).toEqual(fullRender(INPUT, true));
  });

  it("starts over when text is replaced rather than appended to", () => {
    const output = createAnsiOutput();
    output.update(INPUT, true);
    const replaced = `${ESC}[32mnew${ESC}[0m text`;
    expect(output.update(replaced, true)).toEqual(fullRender(replaced, true));
  });

  it("keeps entry identity for settled segments across appends", () => {
    const output = createAnsiOutput();
    const first = output.update(`${ESC}[31ma${ESC}[32mb`, true).slice();
    const second = output.update(`${ESC}[31ma${ESC}[32mbc`, true);
    expect(second[0]).toBe(first[0]);
    expect(second[1]).toEqual({ ...first[1], text: "bc" });
  });
});
