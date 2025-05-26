precision mediump float;

varying vec3 normal;

void main()
{
	vec3 color = normal * 0.5 + 0.5;

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
