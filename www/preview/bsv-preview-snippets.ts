export type BsvPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bsvPreviewSnippets: BsvPreviewSnippet[] = [
  {
    title: "Euclidean GCD",
    description: "atomic rules racing to swap or subtract each cycle",
    code: `interface ArithIO;
    method Action start(Bit#(32) n, Bit#(32) m);
    method Bit#(32) result;
endinterface

module mkGCD(ArithIO);
    Reg#(Bit#(32)) n <- mkRegU;
    Reg#(Bit#(32)) m <- mkRegU;

    rule swap (n > m && m != 0);
        n <= m;
        m <= n;
    endrule

    rule sub (n <= m && m != 0);
        m <= m - n;
    endrule

    method Action start(Bit#(32) in_n, Bit#(32) in_m) if (m == 0);
        n <= in_n;
        m <= in_m;
    endmethod

    method Bit#(32) result if (m == 0);
        return n;
    endmethod
endmodule`,
  },
  {
    title: "ActionValue counter",
    description: "a method that both mutates state and returns a value",
    code: `interface Counter;
    method Action increment;
    method ActionValue#(Bit#(32)) read;
endinterface

module mkCounter(Counter);
    Reg#(Bit#(32)) count <- mkReg(0);

    method Action increment;
        count <= count + 1;
    endmethod

    method ActionValue#(Bit#(32)) read;
        return count;
    endmethod
endmodule`,
  },
  {
    title: "Struct with deriving",
    description: "a packed instruction word decoded by a pure function",
    code: `typedef struct {
    Bit#(8) opcode;
    Bit#(24) payload;
} Instruction deriving (Bits, Eq);

function Bool isNop(Instruction instr);
    return instr.opcode == 0;
endfunction`,
  },
];
