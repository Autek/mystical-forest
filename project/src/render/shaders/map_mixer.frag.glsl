precision mediump float;
		
// Varying values passed from the vertex shader
varying vec4 canvas_pos;

// Global variables specified in "uniforms" entry of the pipeline
uniform sampler2D shadows;
uniform sampler2D fog;
uniform sampler2D blinn_phong;

void main()
{
    float shadows_strength = 0.4;

    // get uv coordinates in the canvas 
    vec2 uv = (canvas_pos.xy / canvas_pos.w) * 0.5 + 0.5;

    float shadow_factor = texture2D(shadows, uv).x;
    vec3 phong_color = texture2D(blinn_phong, uv).rgb;
    vec3 shadow_color = (1.0 - (shadow_factor * shadows_strength)) * phong_color;

    vec3 color = phong_color;
    // darken the area where there is shadows
    if (shadow_factor > 0.0){
        color = shadow_color;
    }

    float fog_factor = texture2D(fog, uv).x;
    vec4 fog_color = vec4(0.6, 0.57, 0.57, 0.25); // tweakable, its the color of the fog but like 

	gl_FragColor = mix(fog_color, vec4(color, 1.), fog_factor);//vec4(color, 1.); // output: RGBA in 0..1 range
}