export type WgslPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const wgslPreviewSnippets: WgslPreviewSnippet[] = [
  {
    title: "Vertex shader",
    description: "entry points, attributes, and builtin types",
    code: `struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(@location(0) pos: vec2<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.position = vec4<f32>(pos, 0.0, 1.0);
  out.color = vec3<f32>(1.0, 0.5, 0.25);
  return out;
}`,
  },
  {
    title: "Compute shader",
    description: "bindings and workgroups",
    code: `@group(0) @binding(0) var<storage, read_write> data: array<f32>;

const stride: u32 = 1u;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x * stride;
  data[i] = data[i] * 2.0;
}`,
  },
  {
    title: "Fragment shader",
    description: "short vector aliases and texture builtins",
    code: `@group(0) @binding(0) var t: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let color = textureSample(t, samp, uv);
  return color * vec4f(1.0, 1.0, 1.0, 1.0);
}`,
  },
];
