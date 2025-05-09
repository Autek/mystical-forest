import { ShaderRenderer } from "./shader_renderer.js";

export class GBufferShaderRenderer extends ShaderRenderer {

	constructor(regl, resource_manager) {
		super(regl, resource_manager, `gbuffer.vert.glsl`, `gbuffer.frag.glsl`);

		this.regl = regl;
		this.resource_manager = resource_manager;

		// textures 
		this.positionTex = regl.texture({	// in view space
			width: window.innerWidth, 
			height: window.innerHeight, 
			format: 'rgba', 
			type: 'float'
		});
		this.normalsTex = regl.texture({	// normals in view space
			width: window.innerWidth, 
			height: window.innerHeight,
			format: 'rgba',
			type: 'float'
		});
		this.albedoTex = regl.texture({	// albedo
			width: window.innerWidth, 
			height: window.innerHeight,
			format: 'rgba',
			type: 'float'
		});

		// framebuffer
		this.gbuffer = regl.framebuffer({
			color: [this.positionTex, this.normalsTex, this.albedoTex],
			depth: true, 
			depthTexture: true,
		});

	}

	render(scene_state) {

		const scene = scene_state.scene;
		const inputs = [];

		for (const obj of scene.objects) {
			
			const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

			const {
				mat_model_view, 
				mat_model_view_projection,
				mat_normals_model_view
			}	= scene.camera.object_matrices.get(obj);
		
			inputs.push({
				mesh: mesh,

				mat_model_view_projection: mat_model_view_projection,
				mat_model_view: mat_model_view,
				mat_normals_model_view: mat_normals_model_view,
			});
		}

		this.pipeline(inputs);
	}

	uniforms(regl) {
		return {
			// camera
			mat_model_view: regl.prop('mat_model_view'),
			mat_model_view_projection: regl.prop('mat_model_view_projection'),
			mat_normals_model_view: regl.prop('mat_normals_model_view'),

			// gbuffer
			gbuffer: regl.prop('gbuffer'),

			// textures
			positionTex: regl.prop('positionTex'),
			normalsTex: regl.prop('normalsTex'),
			albedoTex: regl.prop('albedoTex')
		};
	}

	attributes(regl) {
		return {
			vertex_positions: regl.prop('mesh.vertex_positions'),
			vertex_normals: regl.prop('mesh.vertex_normals'),
			vertex_tex_coords: regl.prop('mesh.vertex_tex_coords'),
		};
	}

}