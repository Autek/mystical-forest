precision highp float;

varying float v2f_height;

/* #TODO PG1.6.1: Copy Blinn-Phong shader setup from previous exercises */
//varying ...
//varying ...
//varying ...
varying vec3 normal0;
varying vec3 light0;
varying vec3 view0;


const vec3  light_color = vec3(1.0, 0.941, 0.898);
// Small perturbation to prevent "z-fighting" on the water on some machines...
const float terrain_water_level    = -0.03125 + 1e-6;
const vec3  terrain_color_water    = vec3(0.29, 0.51, 0.62);
const vec3  terrain_color_mountain = vec3(0.8, 0.5, 0.4);
const vec3  terrain_color_grass    = vec3(0.33, 0.43, 0.18);

void main()
{
	float material_ambient = 0.1; // Ambient light coefficient
	float height = v2f_height;

	/* #TODO PG1.6.1
	Compute the terrain color ("material") and shininess based on the height as
	described in the handout. `v2f_height` may be useful.
	
	Water:
			color = terrain_color_water
			shininess = 30.
	Ground:
			color = interpolate between terrain_color_grass and terrain_color_mountain, weight is (height - terrain_water_level)*2
	 		shininess = 2.
	*/

	vec3 material_color; // = terrain_color_grass;
	float shininess; // = 0.5;

	if (height < terrain_water_level) {
		material_color = terrain_color_water;
		shininess = 30.;
	} else {
		float alpha = (height - terrain_water_level) * 2.;
		material_color = mix(terrain_color_grass, terrain_color_mountain, alpha);
		shininess = 2.;
	}

/* #TODO PG1.6.1: apply the Blinn-Phong lighting model
    	Add the Blinn-Phong implementation from GL2 here.
	*/
	vec3 normal = normalize(normal0);
	vec3 light = normalize(light0);
	vec3 view = normalize(view0);

	vec3 half_vector = normalize(light + view); // halfway vector light/view dir
	
	vec3 ambient = light_color * (material_color * material_ambient);
	
	float diff = max(dot(normal, light), 0.0);
	vec3 diffuse = light_color * material_color * diff;
	
	float spec = pow(max(dot(normal, half_vector), 0.0), shininess);
	spec *= step(0.0, diff);	// only if positive
	vec3 specular = light_color * material_color * spec;
	
	vec3 color = ambient + diffuse + specular;
	
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
