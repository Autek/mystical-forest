precision mediump float;

attribute vec2 position;
varying vec2 v_uv;

void main() {
    v_uv = 0.5 * (position + 1.0); // Map from [-1,1] to [0,1]
    gl_Position = vec4(position, 0.0, 1.0);
}
