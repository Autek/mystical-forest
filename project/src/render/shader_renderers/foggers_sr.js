import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class FoggerShaderRenderer extends ShaderRenderer {

    constructor(regl, resource_manager) {
    super(
        regl, 
        resource_manager, 
        `foggers.vert.glsl`, 
        `foggers.frag.glsl`
    );

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

                fogMaxHeight: scene_state.ui_params.fog_max_height,
                fogOpacity: scene.ui_params.fog_opacity,

                vert: this.vert_shader, 
                frag: this.frag_shader
            });
        }

        this.pipeline(inputs);
    }

    exclude_object(obj){
        // Do not shade objects that use other dedicated shader
        return obj.material.properties.includes('no_fog');
    }

    blend(){
        // Additive blend mode
        return {
            enable: true,
            func: {
                src: 1,
                dst: 1,
            },
        };
    }

    attributes(regl) {
        return {
            vertex_position: regl.prop('mesh.vertex_positions'),
            // vertex_normal: regl.prop('mesh.vertex_normals'),
        };
    }

    depth(){
        // Use z buffer
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    uniforms(regl){
        return{
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            mat_model_view: regl.prop('mat_model_view'),
            mat_normals_model_view: regl.prop('mat_normals_model_view'),

            fog_max_height: regl.prop('fogMaxHeight'),
            fog_opacity: regl.prop('fogOpacity'),
        };
    }
}