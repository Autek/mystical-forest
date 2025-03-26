precision highp float;

/* #TODO GL3.3.1: Pass on the normals and fragment position in camera coordinates */
varying vec4 position;
varying vec3 normal;
varying vec2 v2f_uv;


uniform vec3 light_position; // light position in camera coordinates
uniform vec3 light_color;
uniform samplerCube cube_shadowmap;
uniform sampler2D tex_color;

void main() {

	float material_shininess = 12.;
	float material_ambient = 1e-4;

	/* #TODO GL3.1.1
	Sample texture tex_color at UV coordinates and display the resulting color.
	*/
	vec4 tex_c = texture2D(tex_color, v2f_uv);
	vec3 material_color = tex_c.rgb;
	
	/*
	#TODO GL3.3.1: Blinn-Phong with shadows and attenuation

	Compute this light's diffuse and specular contributions.
	You should be able to copy your phong lighting code from GL2 mostly as-is,
	though notice that the light and view vectors need to be computed from scratch here; 
	this time, they are not passed from the vertex shader. 
	Also, the light/material colors have changed; see the Phong lighting equation in the handout if you need
	a refresher to understand how to incorporate `light_color` (the diffuse and specular
	colors of the light), `v2f_diffuse_color` and `v2f_specular_color`.
	
	To model the attenuation of a point light, you should scale the light
	color by the inverse distance squared to the point being lit.
	
	The light should only contribute to this fragment if the fragment is not occluded
	by another object in the scene. You need to check this by comparing the distance
	from the fragment to the light against the distance recorded for this
	light ray in the shadow map.
	
	To prevent "shadow acne" and minimize aliasing issues, we need a rather large
	tolerance on the distance comparison. It's recommended to use a *multiplicative*
	instead of additive tolerance: compare the fragment's distance to 1.01x the
	distance from the shadow map.

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	vec3 not_normalized_light = light_position - position.xyz;
	
	vec3 ambient = light_color * (material_color * material_ambient);
	vec3 color = ambient;	
	
	float closest_dist = textureCube(cube_shadowmap, -not_normalized_light).r;
	float squared_dist = dot(not_normalized_light, not_normalized_light);
	//shadowed
	if (squared_dist > closest_dist * closest_dist * 1.0201) {
		gl_FragColor = vec4(color, 1.);
		return;
	}

	vec3 normalized_normal = normalize(normal);
	vec3 light = normalize(not_normalized_light);
	float diff = max(dot(normalized_normal, light), 0.0);
	vec3 diffuse = light_color * material_color * diff;
	
	vec3 view = normalize(-position.xyz);
	vec3 half_vector = normalize(light + view); // halfway vector light/view dir
	float spec = pow(max(dot(normalized_normal, half_vector), 0.0), material_shininess);
	spec *= step(0.0, diff);	// only if positive
	vec3 specular = light_color * material_color * spec;

	float inv_squared_dist = 1.0 / squared_dist;
	color += (diffuse + specular) * inv_squared_dist;
	gl_FragColor = vec4(color, 1.);
}
