import { vec2, vec4 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class SSAOShaderRenderer extends ShaderRenderer {
  constructor(regl, resource_manager) {

    super(regl, resource_manager, `buffer_to_screen.vert.glsl`, `ssao.frag.glsl`);
    
		this.regl = regl;
		this.resource_manager = resource_manager;

		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.size = 4;  // size of noise texture
		this.sample_count = 64;	// number of samples in ssao kernel
		this.ssaoKernel = this.generateSSAOKernel();
		this.ssaoNoise = this.generateSSAONoise();

		// textures
		this.ssaoNoiseTex = regl.texture({
			width: this.size,
			height: this.size,
			format: 'rgba',
			type: 'float',
			data: this.ssaoNoise,
			wrapS: 'repeat',	// tile over 
			wrapT: 'repeat',
		});
		this.ssaoTex = regl.texture({
			width: this.width,
			height: this.height,
			format: 'rgba',
			type: 'float',
		});
  }

  render(scene_state, gbufferTex) {
    if (!scene_state.ui_params.is_active_ssao) {
      return null;
    }

		const scene = scene_state.scene;
    const inputs = []; 

    for (const obj of scene.objects) {
			
			const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

			this.noiseScale = vec2.fromValues(this.width/this.size, this.height/this.size);

      inputs.push({
        mesh: mesh,

				projection: scene.camera.mat.projection,

				samples: this.ssaoKernel,
				noiseScale: this.noiseScale,
				ssaoRadius: scene_state.ui_params.ssao_radius,
				ssaoBias: scene_state.ui_params.ssao_bias,
				ssaoIntensity: scene_state.ui_params.ssao_intensity,
				
				// textures
				gPosition: gbufferTex[0],
				gNormal: gbufferTex[1],
				texNoise: this.ssaoNoiseTex,

				vert: this.vert_shader, 
				frag: this.frag_shader
      });
    }
  
		return this.pipeline(inputs);  
  }

  uniforms(regl) {
    return {
			projection: regl.prop('projection'),

			samples: regl.prop('samples'),
			noiseScale: regl.prop('noiseScale'),
			ssao_radius: regl.prop('ssaoRadius'),
			ssao_bias: regl.prop('ssaoBias'),
			ssao_intensity: regl.prop('ssaoIntensity'),
			
			gPosition: regl.prop('gPosition'),
			gNormal: regl.prop('gNormal'),
			texNoise: regl.prop('texNoise'),
    };
  }

  // ssao noise: texture of random rotation vectors for the hemisphere
  // 4x4 texture grid to tile over whole plane
  generateSSAONoise() {
		const ssao_noise = new Float32Array(this.size * this.size * 4);  // each vector has 4 coords
		for (let i = 0; i < this.size * this.size; ++i) {
			const stride = i * 4;
			ssao_noise[stride + 0] = Math.random() * 2 - 1;  // x in [-1, 1]
			ssao_noise[stride + 1] = Math.random() * 2 - 1;  // y in [-1, 1]
			ssao_noise[stride + 2] = 0.0;  // z = 0, rotate around z-axis
			ssao_noise[stride + 3] = 1.0;  // a = 0, unused
		}

		return ssao_noise;
  }

	// ssao kernel: 64 random samples to use in hemisphere
	generateSSAOKernel() {
		const ssao_kernel = [];
		for (let i = 0; i < this.sample_count; i++) {
			// gen random coords
			const x = Math.random() * 2 - 1;  // [-1, 1]
			const y = Math.random() * 2 - 1;  // [-1, 1]
			const z = Math.random();  // [0, 1] for semi-sphere instead of whole sphere
	
			// normalise and scale to random size in [0,1] (within hemisphere)
			const sample = vec4.fromValues(x, y, z, 1.0);
			vec4.normalize(sample, sample);
			vec4.scale(sample, sample, Math.random());
			
			// more kernels closer to center
			let scale = i / 64;
			scale = this.lerp(0.1, 1.0, scale * scale);
			vec4.scale(sample, sample, scale);
	
			ssao_kernel.push(sample[0], sample[1], sample[2]);  // put sample on kernel
		}

		return ssao_kernel;
	}

	lerp(a, b, t) {
		return a + t * (b - a);
	}

}