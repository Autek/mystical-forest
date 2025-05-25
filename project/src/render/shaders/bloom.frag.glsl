precision mediump float;

varying vec2 TexCoords;

uniform sampler2D image;

uniform vec2 resolution;
uniform bool horizontal;
uniform float weight[5];

void main()
{
    vec2 tex_offset = 1.0 / resolution;
    vec3 result = texture2D(image, TexCoords).rgb * weight[0];

    if (horizontal) {
        for (int i = 1; i < 5; ++i) {
            float fi = float(i);
            result += texture2D(image, TexCoords + vec2(tex_offset.x * fi, 0.0)).rgb * weight[i];
            result += texture2D(image, TexCoords - vec2(tex_offset.x * fi, 0.0)).rgb * weight[i];
        }
    } else {
        for (int i = 1; i < 5; ++i) {
            float fi = float(i);
            result += texture2D(image, TexCoords + vec2(0.0, tex_offset.y * fi)).rgb * weight[i];
            result += texture2D(image, TexCoords - vec2(0.0, tex_offset.y * fi)).rgb * weight[i];
        }
    }

    gl_FragColor = vec4(result, 1.0);
}
