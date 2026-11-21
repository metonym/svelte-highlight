import hljsFactory from "highlight.js/lib/core";
import stockObjectivec from "highlight.js/lib/languages/objectivec";
import patchedObjectivec from "../scripts/hljs-patches/objectivec.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import objectivec from "../src/languages/objectivec.js";

// scripts/hljs-patches/objectivec.js: the `objective-c` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("objectivec", patchedObjectivec.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("objectivec", stockObjectivec);

const registry = createRegistry();
registry.register(objectivec.register);

const CODE = `#import <Foundation/Foundation.h>

@interface Greeter : NSObject
@property (nonatomic, copy) NSString *name;
- (void)greet;
@end

@implementation Greeter
- (void)greet {
  NSLog(@"Hello, %@", self.name);
}
@end`;

describe("objectivec grammar patch", () => {
  it("resolves objective-c to objectivec", () => {
    expect(resolveLanguageName("objective-c")).toBe("objectivec");
    expect(resolveLanguageName("OBJECTIVE-C")).toBe("objectivec");
  });

  it("highlights the same through the alias", () => {
    const expected = stock.highlight(CODE, { language: "objectivec" }).value;
    expect(registry.highlight(CODE, { language: "objective-c" }).value).toEqual(
      expected,
    );
  });

  it("does not change Objective-C output", () => {
    const expected = stock.highlight(CODE, { language: "objectivec" }).value;
    expect(hljs.highlight(CODE, { language: "objectivec" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "objectivec" }).value).toEqual(
      expected,
    );
  });
});
