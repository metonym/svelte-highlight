export type VerylPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const verylPreviewSnippets: VerylPreviewSnippet[] = [
  {
    title: "Parameterized data selector",
    description: "colon-typed ports and an always_ff/if_reset block",
    code: `pub module DataSelector #(
    param Width: u32 = 8,
) (
    i_clk : input  clock           ,
    i_rst : input  reset           ,
    i_sel : input  logic           ,
    i_data: input  logic<Width> [2],
    o_data: output logic<Width>    ,
) {
    var r_data: logic<Width>;

    always_ff {
        if_reset {
            r_data = 0;
        } else if i_sel {
            r_data = i_data[0];
        } else {
            r_data = i_data[1];
        }
    }

    assign o_data = r_data;
}`,
  },
  {
    title: "Interface with a modport",
    description: "a shared bus interface restricted to a driving role",
    code: `interface DataBus #(param Width: u32 = 8) {
    var data: logic<Width>;
    var valid: logic;

    modport master {
        data: output,
        valid: output,
    }
}`,
  },
  {
    title: "Generic function in a package",
    description: "a width-parameterized adder using the ::<> generic call",
    code: `package Utilities {
    function add::<W: u32>(
        a: input logic<W>,
        b: input logic<W>,
    ) -> logic<W> {
        return a + b;
    }
}`,
  },
];
