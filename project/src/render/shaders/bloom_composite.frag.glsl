precision mediump float;

uniform sampler2D baseTex;
uniform sampler2D bloomTex;
varying vec2 v_uv;

void main() {
    const float gamma = 2.2;
    vec3 hdrColor = texture2D(baseTex, v_uv).rgb;      
    vec3 bloomColor = texture2D(bloomTex, v_uv).rgb;
    hdrColor += bloomColor; // additive blending
    // tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * 1.1);
    gl_FragColor = vec4(result, 1.0);
}
