import { toCamelCase } from "../scripts/utils/to-camel-case";

describe("toCamelCase", () => {
  it("should convert dash-separated strings to camelCase", () => {
    expect(toCamelCase("one-two-three")).toBe("oneTwoThree");
    expect(toCamelCase("hello-world")).toBe("helloWorld");
    expect(toCamelCase("first-name")).toBe("firstName");
  });

  it("should convert period-separated strings to camelCase", () => {
    expect(toCamelCase("one.two.three")).toBe("oneTwoThree");
    expect(toCamelCase("hello.world")).toBe("helloWorld");
    expect(toCamelCase("first.name")).toBe("firstName");
  });

  it("should handle mixed dash and period separators", () => {
    expect(toCamelCase("one.two-three")).toBe("oneTwoThree");
    expect(toCamelCase("hello-world.example")).toBe("helloWorldExample");
  });

  it("should handle single word inputs", () => {
    expect(toCamelCase("word")).toBe("word");
    expect(toCamelCase("hello")).toBe("hello");
  });

  it("should preserve existing casing", () => {
    expect(toCamelCase("already-Capitalized-Word")).toBe(
      "alreadyCapitalizedWord",
    );
    expect(toCamelCase("UPPER.case.words")).toBe("UPPERCaseWords");
  });
});
