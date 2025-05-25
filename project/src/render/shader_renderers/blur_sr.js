import { vec2, vec4 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class BlurShaderRenderer extends ShaderRenderer {
	constructor(regl, resource_manager) {

		super(regl, resource_manager, `buffer_to_screen.vert.glsl`, `blur.frag.glsl`);
		
		this.regl = regl;
		this.resource_manager = resource_manager;

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// textures
		this.blurTex = regl.texture({
			width: this.width,
			height: this.height,
			format: 'rgba',
			type: 'float'
		});
	}

	render(scene_state, ssaoTex) {
		if (!scene_state.ui_params.is_active_ssao) {
			return null;
		}

		const scene = scene_state.scene;
		const inputs = []; 

		for (const obj of scene.objects) {
			
			const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

			const texelSize = vec2.fromValues(1.0 / this.width, 1.0 / this.height);

			inputs.push({
				mesh: mesh,
				ssaoTex: ssaoTex,
				texelSize: texelSize
			});
		}
	
		return this.pipeline(inputs);  
	}

	uniforms(regl) {
		return {
			ssao_tex : regl.prop('ssaoTex'),
			texelSize: regl.prop('texelSize'),
		};
	}

}