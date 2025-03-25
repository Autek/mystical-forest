precision mediump float;

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
	vec3 normal = normalize(normal);
	vec3 light = normalize(light);
	vec3 view = normalize(view);

	vec3 half_vector = normalize(light + view); // halfway vector light/view dir
	
	vec3 ambient = light_color * (material_color * material_ambient);
	
	float diff = max(dot(normal, light), 0.0);
	vec3 diffuse = light_color * material_color * diff;
	
	float spec = pow(max(dot(normal, half_vector), 0.0), material_shininess);
	spec *= step(0.0, diff);	// only if positive
	vec3 specular = light_color * material_color * spec;
	
	vec3 color = ambient + diffuse + specular;
	
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
