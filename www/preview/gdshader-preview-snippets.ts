export type GdshaderPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gdshaderPreviewSnippets: GdshaderPreviewSnippet[] = [
  {
    title: "A basic spatial shader",
    description: "shader_type, render_mode, and vertex/fragment functions",
    code: `shader_type spatial;
render_mode blend_mix, depth_draw_opaque;

uniform float intensity : hint_range(0, 1) = 0.5;

void vertex() {
    VERTEX.y += sin(TIME) * 0.1;
}

void fragment() {
    vec3 color = ALBEDO.rgb * intensity;
    ALBEDO = color;
}
`,
  },
  {
    title: "Textures and hints",
    description: "sampler uniforms with hints and swizzles",
    code: `shader_type canvas_item;

uniform sampler2D noise_tex : hint_default_black, filter_linear_mipmap;
uniform vec4 tint : source_color = vec4(1.0);

void fragment() {
    vec4 tex_color = texture(noise_tex, UV);
    COLOR = tex_color * tint;
    COLOR.a = clamp(COLOR.a, 0.0, 1.0);
}
`,
  },
  {
    title: "Light function",
    description: "the light() entry point and built-in lighting variables",
    code: `shader_type spatial;

void light() {
    DIFFUSE_LIGHT += ALBEDO * LIGHT_COLOR * ATTENUATION;
    SPECULAR_LIGHT += LIGHT_COLOR * pow(max(dot(NORMAL, LIGHT), 0.0), 32.0);
}
`,
  },
];
