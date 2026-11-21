export type MetalPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const metalPreviewSnippets: MetalPreviewSnippet[] = [
  {
    title: "Compute kernel",
    description:
      "A kernel that adds two arrays, with device buffers bound by [[buffer(n)]] and the grid position as input",
    code: `#include <metal_stdlib>
using namespace metal;

kernel void add_arrays(device const float* a      [[buffer(0)]],
                       device const float* b      [[buffer(1)]],
                       device float*       result [[buffer(2)]],
                       constant uint&      count  [[buffer(3)]],
                       uint                index  [[thread_position_in_grid]])
{
    if (index >= count) {
        return;
    }
    result[index] = a[index] + b[index];
}`,
  },
  {
    title: "Vertex and fragment shaders",
    description:
      "A textured quad: per-vertex attributes in, a sampled color out, with half precision in the fragment stage",
    code: `#include <metal_stdlib>
using namespace metal;

struct VertexIn {
    float3 position [[attribute(0)]];
    float2 uv       [[attribute(1)]];
};

struct VertexOut {
    float4 position [[position]];
    float2 uv;
};

struct Uniforms {
    float4x4 modelViewProjection;
    half4 tint;
};

vertex VertexOut vertex_main(VertexIn in [[stage_in]],
                             constant Uniforms& uniforms [[buffer(1)]])
{
    VertexOut out;
    out.position = uniforms.modelViewProjection * float4(in.position, 1.0);
    out.uv = in.uv;
    return out;
}

fragment half4 fragment_main(VertexOut in [[stage_in]],
                             texture2d<half> albedo [[texture(0)]],
                             sampler linearSampler [[sampler(0)]],
                             constant Uniforms& uniforms [[buffer(1)]])
{
    half4 color = albedo.sample(linearSampler, in.uv);
    return color * uniforms.tint * 0.9h;
}`,
  },
  {
    title: "Threadgroup reduction",
    description:
      "A parallel sum that shares partial results through threadgroup memory and syncs with barriers",
    code: `#include <metal_stdlib>
using namespace metal;

kernel void reduce_sum(device const float* input  [[buffer(0)]],
                       device atomic_float* total [[buffer(1)]],
                       threadgroup float*   scratch [[threadgroup(0)]],
                       uint gid  [[thread_position_in_grid]],
                       uint lid  [[thread_position_in_threadgroup]],
                       uint size [[threads_per_threadgroup]])
{
    scratch[lid] = input[gid];
    threadgroup_barrier(mem_flags::mem_threadgroup);

    for (uint stride = size / 2; stride > 0; stride /= 2) {
        if (lid < stride) {
            scratch[lid] += scratch[lid + stride];
        }
        threadgroup_barrier(mem_flags::mem_threadgroup);
    }

    if (lid == 0) {
        atomic_fetch_add_explicit(total, scratch[0], memory_order_relaxed);
    }
}`,
  },
  {
    title: "Image filter",
    description:
      "A grayscale filter that reads and writes textures with explicit access qualifiers",
    code: `#include <metal_stdlib>
using namespace metal;

constant half3 kLuma = half3(0.2126h, 0.7152h, 0.0722h);

kernel void grayscale(texture2d<half, access::read>  inTexture  [[texture(0)]],
                      texture2d<half, access::write> outTexture [[texture(1)]],
                      uint2 gid [[thread_position_in_grid]])
{
    if (gid.x >= outTexture.get_width() || gid.y >= outTexture.get_height()) {
        return;
    }

    half4 color = inTexture.read(gid);
    half gray = dot(color.rgb, kLuma);
    outTexture.write(half4(gray, gray, gray, color.a), gid);
}`,
  },
];
