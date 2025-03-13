// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec2 position;
		
// Global variables specified in "uniforms" entry of the pipeline
uniform vec2 mouse_offset;

void main() {
	// #TODO GL1.1.1.1 Edit the vertex shader to apply mouse_offset translation to the vertex position.
	// We have to return a vec4, because homogenous coordinates are being used.
	gl_Position = vec4(position + mouse_offset, 0, 1);
}