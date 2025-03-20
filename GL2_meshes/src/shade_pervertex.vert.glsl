// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.3
	Pass the values needed for per-pixel illumination by creating a varying vertex-to-fragment variable.
*/
//varying ...
varying vec3 color;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; // in camera space coordinates already

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main() {
	float material_ambient = 0.1;

	/** #TODO GL2.3 Gouraud lighting
	Compute the visible object color based on the Blinn-Phong formula.

	Hint: Compute the vertex position, normal and light_position in view space. 
	*/

	vec4 pos = mat_model_view * vec4(vertex_position, 1.0);
	vec3 normal = normalize(mat_normals_to_view * vertex_normal);
	vec3 light_dir = normalize(light_position - pos.xyz);
	vec3 view_dir = normalize(-pos.xyz); // vertex to cam ?? unsure if other way around maybe
	
	vec3 half_vector = normalize(light_dir + view_dir); // halfway vector light/view dir
	
	vec3 ambient = light_color * (material_color * 0.1);
	
	float diff = max(dot(normal, light_dir), 0.0);
	vec3 diffuse = light_color * material_color * diff;
	
	float spec = pow(max(dot(normal, half_vector), 0.0), material_shininess);
	spec *= step(0.0, diff);	// only if positive
	vec3 specular = light_color * material_color * spec;
	
	color = ambient + diffuse + specular;

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
