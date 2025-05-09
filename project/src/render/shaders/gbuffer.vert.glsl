precision highp float;

attribute vec3 vertex_positions;
attribute vec3 vertex_normals;
attribute vec2 vertex_tex_coords;

uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

varying vec3 FragPos; // in view space
varying vec3 Normal; // in view space
varying vec2 TexCoords;

void main() {
	// pos in view space
	FragPos = vec3(mat_model_view * vec4(vertex_positions, 1.0));

	// normal in view space
	Normal = mat_normals_model_view * vertex_normals;

	// texture coordinates
	TexCoords = vertex_tex_coords;

	// clip-space vertex_positions
	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1.0);
}
