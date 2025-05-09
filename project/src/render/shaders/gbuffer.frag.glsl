#extension GL_EXT_draw_buffers : require
precision mediump float;

varying vec2 TexCoords;
varying vec3 FragPos;
varying vec3 Normal;

void main() {    
	// pos in first color attachment
	gl_FragData[0] = vec4(FragPos, 1.0);
	
	// normalized normal in second color attachment
	gl_FragData[1] = vec4(normalize(Normal), 1.0);
	
	// albedo in third color attachment (ignore specular)
	gl_FragData[2] = vec4(vec3(0.95), 1.0);
}