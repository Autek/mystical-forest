precision mediump float;

uniform sampler2D baseTex;
uniform sampler2D bloomTex;
varying vec2 v_uv;

void main() {
    vec3 base = texture2D(baseTex, v_uv).rgb;
    vec3 bloom = texture2D(bloomTex, v_uv).rgb;
    gl_FragColor = vec4(base + bloom, 1.0); // or mix(base, bloom, 0.3) for subtle effect
}
