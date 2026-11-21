export type MlirPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const mlirPreviewSnippets: MlirPreviewSnippet[] = [
  {
    title: "Functions and control flow",
    description: "func.func, SSA values, block labels, and branches",
    code: `// Returns the larger of two integers.
func.func @max(%a: i32, %b: i32) -> i32 {
  %cond = arith.cmpi sgt, %a, %b : i32
  cf.cond_br %cond, ^bb1(%a : i32), ^bb1(%b : i32)
^bb1(%result: i32):
  return %result : i32
}

func.func private @print_i32(i32)

func.func @main() {
  %c3 = arith.constant 3 : i32
  %c7 = arith.constant 7 : i32
  %m = func.call @max(%c3, %c7) : (i32, i32) -> i32
  func.call @print_i32(%m) : (i32) -> ()
  return
}`,
  },
  {
    title: "Tensors, memrefs, and loops",
    description: "shaped types, scf.for with iter_args, and affine maps",
    code: `#map = affine_map<(d0, d1) -> (d0 * 16 + d1)>
#tile = affine_map<(d0) -> (d0 floordiv 4)>

module attributes {gpu.container_module} {
  func.func @sum(%buf: memref<?xf32>, %n: index) -> f32 {
    %c0 = arith.constant 0 : index
    %c1 = arith.constant 1 : index
    %zero = arith.constant 0.0 : f32
    %total = scf.for %i = %c0 to %n step %c1
        iter_args(%acc = %zero) -> (f32) {
      %v = memref.load %buf[%i] : memref<?xf32>
      %next = arith.addf %acc, %v : f32
      scf.yield %next : f32
    }
    return %total : f32
  }

  func.func @add(%lhs: tensor<4x?xf32>, %rhs: tensor<4x?xf32>)
      -> tensor<4x?xf32> {
    %c1 = arith.constant 1 : index
    %dim = tensor.dim %lhs, %c1 : tensor<4x?xf32>
    %init = tensor.empty(%dim) : tensor<4x?xf32>
    %out = linalg.add ins(%lhs, %rhs : tensor<4x?xf32>, tensor<4x?xf32>)
                      outs(%init : tensor<4x?xf32>) -> tensor<4x?xf32>
    return %out : tensor<4x?xf32>
  }
}`,
  },
  {
    title: "Generic form and attributes",
    description:
      "quoted op names, attribute dictionaries, aliases, and locations",
    code: `!ptr = !llvm.ptr
#loc = loc("kernel.mlir":12:3)

"builtin.module"() ({
  "func.func"() <{function_type = (vector<4xi32>) -> vector<4xi32>,
                  sym_name = "double"}> ({
  ^bb0(%arg0: vector<4xi32>):
    %0 = "arith.constant"() <{value = dense<2> : vector<4xi32>}>
        : () -> vector<4xi32> loc(#loc)
    %1 = "arith.muli"(%arg0, %0) : (vector<4xi32>, vector<4xi32>)
        -> vector<4xi32>
    "func.return"(%1) : (vector<4xi32>) -> ()
  }) {llvm.emit_c_interface} : () -> ()

  llvm.func @load(%p: !ptr) -> i64 {
    %v = llvm.load %p {alignment = 8 : i64} : !ptr -> i64
    llvm.return %v : i64
  }
}) : () -> ()`,
  },
];
