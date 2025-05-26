#extension GL_EXT_draw_buffers : require
precision mediump float;

varying vec2 v2f_tex_coords;

uniform sampler2D ssao_tex;
uniform vec2 texelSize;

void main() {
	
	// iterate over the kernel
	float res = 0.0;
	for (int x = -2; x < 2; ++x) {
		for (int y = -2; y < 2; ++y) {
			vec2 offset = vec2(float(x), float(y)) * texelSize;
			res += texture2D(ssao_tex, v2f_tex_coords + offset).r;
		}
	}

	gl_FragColor[0] = res / (4.0 * 4.0); // average over samples
}

