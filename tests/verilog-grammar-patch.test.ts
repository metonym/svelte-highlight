import hljsFactory from "highlight.js/lib/core";
import stockVerilog from "highlight.js/lib/languages/verilog";
import patchedVerilog from "../scripts/hljs-patches/verilog.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import verilog from "../src/languages/verilog.js";

// scripts/hljs-patches/verilog.js: the `systemverilog` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("verilog", patchedVerilog.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("verilog", stockVerilog);

const registry = createRegistry();
registry.register(verilog.register);

const CODE = `module counter #(parameter WIDTH = 8) (
  input  logic clk, rst,
  output logic [WIDTH-1:0] count
);
  always_ff @(posedge clk) begin
    if (rst) count <= '0;
    else     count <= count + 1;
  end
endmodule`;

describe("verilog grammar patch", () => {
  it("resolves systemverilog to verilog", () => {
    expect(resolveLanguageName("systemverilog")).toBe("verilog");
    expect(resolveLanguageName("SYSTEMVERILOG")).toBe("verilog");
  });

  it("highlights the same through the alias", () => {
    const expected = stock.highlight(CODE, { language: "verilog" }).value;
    expect(
      registry.highlight(CODE, { language: "systemverilog" }).value,
    ).toEqual(expected);
  });

  it("does not change Verilog output", () => {
    const expected = stock.highlight(CODE, { language: "verilog" }).value;
    expect(hljs.highlight(CODE, { language: "verilog" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "verilog" }).value).toEqual(
      expected,
    );
  });
});
