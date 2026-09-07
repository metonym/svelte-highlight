export type ShaderlabPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const shaderlabPreviewSnippets: ShaderlabPreviewSnippet[] = [
  {
    title: "A basic shader",
    description: "properties, tags, and an embedded CGPROGRAM block",
    code: `Shader "Custom/Simple" {
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
        _Color ("Tint", Color) = (1,1,1,1)
    }
    SubShader {
        Tags { "RenderType"="Opaque" }
        Pass {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float4 frag() : SV_Target {
                return float4(1, 0, 0, 1);
            }
            ENDCG
        }
    }
}
`,
  },
  {
    title: "Attributes and blend state",
    description: "property attributes, Blend, and ZTest state",
    code: `Properties {
    [HideInInspector] _Cutoff ("Alpha Cutoff", Range(0,1)) = 0.5
    [Toggle] _UseFog ("Use Fog", Float) = 1
}

SubShader {
    Blend SrcAlpha OneMinusSrcAlpha
    ZWrite Off
    ZTest LEqual
    Cull Back
}
`,
  },
  {
    title: "HLSL surface shader",
    description: "HLSLPROGRAM/ENDHLSL with multi_compile pragmas",
    code: `Pass {
    HLSLPROGRAM
    #pragma vertex vert
    #pragma surface surf Standard
    #pragma multi_compile _ _MAIN_LIGHT_SHADOWS

    struct Attributes {
        float3 positionOS : POSITION;
    };
    ENDHLSL
}
`,
  },
];
