// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_model_view_projection;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_model_view;
uniform float fog_max_height;
uniform float fog_opacity;

varying float fog_factor;

void main() {
	float fog_max = fog_max_height; // tweakable
	float drop_rate = fog_opacity; // tweakable
	float dfactor = vertex_position.z - fog_max;

	fog_factor = 1.;
	if (vertex_position.z < fog_max) {
		fog_factor = exp(-(drop_rate * dfactor) * (drop_rate * dfactor)); //clamp(vertex_position.z * 4. , 0., 1.);
	}

	gl_Position = mat_model_view_projection * vec4(vertex_position, 1);
}