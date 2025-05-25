#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec2 v2f_tex_coords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D texNoise;

uniform vec4 samples[64];
uniform mat4 projection;

// tile noise texture (screen dims divided by noise size)
uniform vec2 noiseScale;

void main() {
    // todo: understand what this does
    vec3 fragPosView = texture2D(gPosition, v2f_tex_coords).xyz;
    vec4 fragPos = vec4(fragPosView, 1.0);
    vec3 normal = texture2D(gNormal, v2f_tex_coords).rgb;
    vec3 randomVec = texture2D(texNoise, v2f_tex_coords * noiseScale).xyz;

    // todo: understand what this does
    vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN = mat3(tangent, bitangent, normal); // tangent space to view space matrix

    // iterate over samples to get final result
    float occlusion = 0.0;
    const int kernelSize = 64; // tweakable //! if change, change in sample generation as well
    float radius = 1.0; // tweakable
    float bias = 0.025; // tweakable - solves acnee
    for (int i = 0; i < kernelSize; ++i) {
        // translate sample pos from tangent to view space
        vec3 samplePosView = TBN * samples[i].xyz * radius; // sample[i] in tangent space
        vec4 samplePos = vec4(fragPosView + samplePosView, 1.0);

        // translate to screen space
        vec4 clipPos = projection * samplePos; // view to clip space
        vec2 screenPos = clipPos.xy / clipPos.w; // perspective divide --> screen space
        screenPos = screenPos * 0.5 + 0.5; // scale to [0, 1]

        // get texture at point
        float sampleDepthView = texture2D(gPosition, screenPos).z;

        // only contribute if within radius - smoothstep to interpolate smoothly
        float rangeCheck = smoothstep(0.0, 1.0, radius / abs(fragPosView.z - sampleDepthView));

        // compute occlusion - only add if visible from viewer pov and within radius
        occlusion += (sampleDepthView >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
    }

    // normalize by number of samples and 1 - X to be able to use directly on ambient light
    occlusion = 1.0 - (occlusion / float(kernelSize));
    occlusion = pow(occlusion, 2.0);	// tweakable - more intense

    gl_FragColor[0] = occlusion;
}
