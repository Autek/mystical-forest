import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";


/*---------------------------------------------------------------
	SUPER CLASS OF ALL THE SHADER RENDERS
---------------------------------------------------------------*/

export class NormalsShaderRenderer extends ShaderRenderer {

	constructor(regl, resource_manager) {
	super(regl, resource_manager, `normals.vert.glsl`, `normals.frag.glsl`);

	this.regl = regl;
		this.resource_manager = resource_manager;
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
			} = scene.camera.object_matrices.get(obj);

			inputs.push({
				mesh: mesh, 
				mat_model_view_projection: mat_model_view_projection, 
				mat_model_view: mat_model_view, 
				mat_normals_model_view: mat_normals_model_view,

				vert: this.vert_shader, 
				frag: this.frag_shader
			});
		}

		this.pipeline(inputs);
	}

	uniforms(regl) {
		return {
			mesh : regl.prop('mesh'), 
			mat_model_view_projection: regl.prop('mat_model_view_projection'), 
			mat_model_view: regl.prop('mat_model_view'), 
			mat_normals_model_view: regl.prop('mat_normals_model_view')
		};
	}
}