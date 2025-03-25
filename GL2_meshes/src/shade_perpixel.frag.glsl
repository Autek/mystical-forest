precision highp float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
varying vec3 normal;
varying vec3 light;
varying vec3 view;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main()
{
	float material_ambient = 0.1;

	/*
	/* #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	// Ambient
	vec3 ambient = light_color * material_color * material_ambient;

	// Diffusion
	vec3 diffuse = vec3(0.);
	float dot_diffuse = dot(normal, light);
	if (dot_diffuse > 0.) {
		diffuse = light_color * material_color * dot_diffuse;
	}

	// Specular light
	vec3 half_v = normalize(light + view);
	vec3 specular = vec3(0.);
	float dot_spec = dot(normal, half_v);
	if (dot_diffuse > 0. && dot_spec > 0.) {
		specular = light_color * material_color * pow(dot_spec, material_shininess);
	}

	vec3 color = diffuse + ambient + specular;
	
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
