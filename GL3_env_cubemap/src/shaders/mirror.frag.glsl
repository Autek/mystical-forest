precision mediump float;

/* #TODO GL3.2.3
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* view vector: direction to camera
*/
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_camera;

uniform samplerCube cube_env_map;

void main()
{
	/*
	/* #TODO GL3.2.3: Mirror shader
	Calculate the reflected ray direction R and use it to sample the environment map.
	Pass the resulting color as output.
	*/
	
	//vec4 alt = textureCube(cube_env_map, v2f_dir_to_cam);

	vec3 space= v2f_dir_to_camera - dot(v2f_dir_to_camera, v2f_normal) * v2f_normal;
	vec3 reflect = normalize(v2f_dir_to_camera - 2. * space);

	vec4 sample = textureCube(cube_env_map, reflect);

	gl_FragColor = sample;//vec4(color, 1.); // output: RGBA in 0..1 range
}
