precision highp float;

attribute vec3 vertex_positions;
attribute vec3 vertex_normal;
attribute vec2 vertex_tex_coords;

uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

varying vec3 FragPos;
varying vec3 Normal;
varying vec2 TexCoords;

void main() {
	FragPos = (mat_model_view * vec4(vertex_positions, 1.0)).xyz;

	Normal = normalize(mat_normals_model_view * vertex_normal);

	TexCoords = vertex_tex_coords;

	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1.0);
}
