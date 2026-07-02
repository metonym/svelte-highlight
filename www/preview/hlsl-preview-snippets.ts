export type HlslPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const hlslPreviewSnippets: HlslPreviewSnippet[] = [
  {
    title: "Vertex shader",
    description: "struct semantics, constant buffers, and matrix math",
    code: `cbuffer Constants : register(b0) {
  float4x4 worldViewProj;
};

struct VSInput {
  float3 position : POSITION;
  float3 normal : NORMAL;
  float2 uv : TEXCOORD0;
};

struct VSOutput {
  float4 position : SV_POSITION;
  float3 normal : NORMAL;
  float2 uv : TEXCOORD0;
};

VSOutput main(VSInput input) {
  VSOutput output;
  output.position = mul(worldViewProj, float4(input.position, 1.0f));
  output.normal = input.normal;
  output.uv = input.uv;
  return output;
}`,
  },
  {
    title: "Pixel shader",
    description: "texture sampling and lighting with intrinsic functions",
    code: `Texture2D mainTex : register(t0);
SamplerState samp : register(s0);

float4 main(float3 normal : NORMAL, float2 uv : TEXCOORD0) : SV_TARGET {
  float3 lightDir = normalize(float3(0.3f, 1.0f, 0.2f));
  float diffuse = saturate(dot(normalize(normal), lightDir));
  float4 albedo = mainTex.Sample(samp, uv);
  return float4(albedo.rgb * lerp(0.2f, 1.0f, diffuse), albedo.a);
}`,
  },
  {
    title: "Compute shader",
    description: "structured buffers and preprocessor directives",
    code: `#define THREADS 64

RWStructuredBuffer<float> data : register(u0);

[numthreads(THREADS, 1, 1)]
void main(uint3 id : SV_DispatchThreadID) {
  uint i = id.x;
  data[i] = saturate(data[i] * 2.0f);
}`,
  },
];
