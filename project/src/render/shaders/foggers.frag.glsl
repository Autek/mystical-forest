precision mediump float;

varying float fog_factor;

const vec3 fog_color = vec3(0.1);

void main()
{
	gl_FragColor = vec4(fog_factor);
}