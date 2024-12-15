import { minifyCss } from "../scripts/utils/minify-css";

describe("minifyCss", () => {
  it("should minify basic CSS", () => {
    const input = `
      .test {
        color: red;
        background: blue;
      }
    `;
    const output = minifyCss(input);
    expect(output).toBe(".test{color:red;background:blue}");
  });

  it("should remove duplicate rules", () => {
    const input = `
      .test {
        color: red;
      }
      .test {
        color: red;
      }
    `;
    const output = minifyCss(input);
    expect(output).toBe(".test{color:red}");
  });

  it("should merge rules with same selectors", () => {
    const input = `
      .test {
        color: red;
      }
      .test {
        background: blue;
      }
    `;
    const output = minifyCss(input);
    expect(output).toBe(".test{color:red;background:blue}");
  });

  describe("comments handling", () => {
    const cssWithComments = `
      /* Regular comment */
      .test {
        color: red;
      }
      /* @license
         My License text
      */
      .other {
        color: blue;
      }
      /* @Author: John Doe */
      .another {
        color: green;
      }
    `;

    it("should preserve license comments when option is set", () => {
      const output = minifyCss(cssWithComments, {
        discardComments: "preserve-license",
      });
      expect(output).toContain("@license");
      expect(output).toContain("@Author");
      expect(output).not.toContain("Regular comment");
    });

    it("should remove all comments when remove-all option is set", () => {
      const output = minifyCss(cssWithComments, {
        discardComments: "remove-all",
      });
      expect(output).not.toContain("@license");
      expect(output).not.toContain("@Author");
      expect(output).not.toContain("Regular comment");
    });
  });
});
