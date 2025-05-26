precision mediump float;
varying vec2 uv;
uniform sampler2D inputTex;
uniform float threshold;

void main() {
    vec3 color = texture2D(inputTex, uv).rgb;
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = brightness > threshold ? vec4(color, 1.0) : vec4(0.0);
}
