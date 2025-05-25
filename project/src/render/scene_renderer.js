import { BlurShaderRenderer } from "./shader_renderers/blur_sr.js"
import { GBufferShaderRenderer } from "./shader_renderers/gbuffer_sr.js"
import { NormalsShaderRenderer } from "./shader_renderers/normals_sr.js"
import { SSAOShaderRenderer } from "./shader_renderers/ssao_sr.js"
import { BloomShaderRenderer } from "./shader_renderers/bloom_sr.js"
import { BlinnPhongShaderRenderer } from "./shader_renderers/blinn_phong_sr.js"
import { FlatColorShaderRenderer } from "./shader_renderers/flat_color_sr.js"
import { MirrorShaderRenderer } from "./shader_renderers/mirror_sr.js"
import { ShadowsShaderRenderer } from "./shader_renderers/shadows_sr.js"
import { MapMixerShaderRenderer } from "./shader_renderers/map_mixer_sr.js"
import { TerrainShaderRenderer } from "./shader_renderers/terrain_sr.js"
import { PreprocessingShaderRenderer } from "./shader_renderers/pre_processing_sr.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ParticleShaderRenderer } from "./shader_renderers/particle_shader_renderer.js"
import { BloomCompositeRenderer } from "./shader_renderers/bloom_composite_sr.js"
import { ThresholdShaderRenderer } from "./shader_renderers/threshold_sr.js"

export class SceneRenderer {

    /** 
     * Create a new scene render to display a scene on the screen
     * @param {*} regl the canvas to draw on 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager) {
        this.regl = regl;
        this.resource_manager = resource_manager;

        this.textures_and_buffers = {};

        // Creates the renderer object for each shader kind
        this.pre_processing = new PreprocessingShaderRenderer(regl, resource_manager);

        this.flat_color = new FlatColorShaderRenderer(regl, resource_manager);
        this.blinn_phong = new BlinnPhongShaderRenderer(regl, resource_manager);
        this.terrain = new TerrainShaderRenderer(regl, resource_manager);

        this.particle = new ParticleShaderRenderer(regl, resource_manager);

        this.mirror = new MirrorShaderRenderer(regl, resource_manager);
        this.shadows = new ShadowsShaderRenderer(regl, resource_manager);
        this.map_mixer = new MapMixerShaderRenderer(regl, resource_manager);

        this.normals = new NormalsShaderRenderer(regl, resource_manager);

        // ssao stuff
        this.gbuffer = new GBufferShaderRenderer(regl, resource_manager);
        this.ssao = new SSAOShaderRenderer(regl, resource_manager);
        this.blur = new BlurShaderRenderer(regl, resource_manager);
        this.threshold = new ThresholdShaderRenderer(regl, resource_manager, this.render_in_texture.bind(this));
        this.bloom_shader = new BloomShaderRenderer(regl, resource_manager, this.render_in_texture.bind(this));
        this.bloom_composite = new BloomCompositeRenderer(regl, resource_manager);

        // Create textures & buffer to save some intermediate renders into a texture
        this.create_texture_and_buffer("shadows", {}); 
        this.create_texture_and_buffer("base", {}); 
        this.textures_and_buffers["gbuffer"] = [    
            [this.gbuffer.positionTex, this.gbuffer.normalsTex, this.gbuffer.albedoTex], 
            this.gbuffer.gbuffer
        ];  // equivalent to `create_texture_and_buffer` with 3 textures instead of 1
        this.create_texture_and_buffer("ssao", {});
        this.create_texture_and_buffer("blur", {});
        this.create_texture_and_buffer("shaded", {});
        this.create_texture_and_buffer("lowres0", { scale: 0.5 });
        this.create_texture_and_buffer("lowres1", { scale: 0.5 });
    }

    /**
     * Helper function to create regl texture & regl buffers
     * @param {*} name the name for the texture (used to save & retrive data)
     * @param {*} parameters use if you need specific texture parameters
     */
    create_texture_and_buffer(name, {wrap = 'clamp', format = 'rgba', type = 'float', scale = 1.0}){
        const regl = this.regl;
        const framebuffer_width = Math.floor(window.innerWidth * scale);
        const framebuffer_height = Math.floor(window.innerHeight * scale);

        // Create a regl texture and a regl buffer linked to the regl texture
        const text = regl.texture({ width: framebuffer_width, height: framebuffer_height, wrap: wrap, format: format, type: type })
        const buffer = regl.framebuffer({ color: [text], width: framebuffer_width, height: framebuffer_height, })
        
        this.textures_and_buffers[name] = [text, buffer]; 
    }

    /**
     * Function to run a rendering process and save the result in the designated texture
     * @param {*} name of the texture to render in
     * @param {*} render_function that is used to render the result to be saved in the texture
     * @returns 
     */
    render_in_texture(name, render_function){
        const regl = this.regl;
        const [texture, buffer] = this.textures_and_buffers[name];
        regl({ framebuffer: buffer })(() => {
            regl.clear({ color: [0,0,0,1], depth: 1 });
            render_function();
          });
        return texture;
    }

    /**
     * Retrieve a render texture with its name
     * @param {*} name 
     * @returns 
     */
    texture(name){
        const [texture, buffer] = this.textures_and_buffers[name];
        return texture;
    }

    /**
     * Core function to render a scene
     * Call the render passes in this function
     * @param {*} scene_state the description of the scene, time, dynamically modified parameters, etc.
     */
    render(scene_state) {
        
        const scene = scene_state.scene;
        const frame = scene_state.frame;

        /*---------------------------------------------------------------
            0. Camera Setup
        ---------------------------------------------------------------*/

        // Update the camera ratio in case the windows size changed
        scene.camera.update_format_ratio(frame.framebufferWidth, frame.framebufferHeight);
        
        // Compute the objects matrices at the beginning of each frame
        // Note: for optimizing performance, some matrices could be precomputed and shared among different objects
        scene.camera.compute_objects_transformation_matrices(scene.objects);

        /*---------------------------------------------------------------
            1. Base Render Passes
        ---------------------------------------------------------------*/

        // ssao texture computation
        const texture_to_render = scene_state.ui_params.is_active_blur ? "blur" : "ssao";
        this.render_in_texture("gbuffer", () => {
            this.pre_processing.render(scene_state);
            this.gbuffer.render(scene_state);
        });
        
        if (scene_state.ui_params.is_active_ssao) {
            this.render_in_texture("ssao", () => {
                this.pre_processing.render(scene_state);
                this.ssao.render(scene_state, this.texture("gbuffer"));
            });

            if (scene_state.ui_params.is_active_blur) {
                this.render_in_texture("blur", () => {
                    this.pre_processing.render(scene_state);
                    this.blur.render(scene_state, this.texture("ssao"));
                });
            }
        }
            
        // Render call: the result will be stored in the texture "base"
        this.render_in_texture("base", () => {

            // Prepare the z_buffer and object with default black color
            this.pre_processing.render(scene_state);

            // normals
            this.normals.render(scene_state);
            
            // Render the background
            this.flat_color.render(scene_state);
            
            // Render the terrain
            this.terrain.render(scene_state, this.texture(texture_to_render));
            
            // Render shaded objects
            this.blinn_phong.render(scene_state, this.texture(texture_to_render)); // pass occlusion factor
            
            this.particle.render(scene_state);

            // Render the reflection of mirror objects on top
            if (scene_state.ui_params.is_active_mirror) {
                this.mirror.render(scene_state, (s_s) => {
                    this.pre_processing.render(scene_state);
                    this.normals.render(scene_state);
                    this.flat_color.render(s_s);
                    this.terrain.render(scene_state, this.texture(texture_to_render));
                    this.blinn_phong.render(s_s, this.texture(texture_to_render)); // same
                });
            }
        })

        /*---------------------------------------------------------------
            2. Shadows Render Pass
        ---------------------------------------------------------------*/
        
        // Render the shadows of the scene in a black & white texture. White means shadow.
        this.render_in_texture("shadows", () =>{

            // Prepare the z_buffer and object with default black color
            this.pre_processing.render(scene_state);

            // Render the shadows
            this.shadows.render(scene_state);
        })

        /*---------------------------------------------------------------
            3. Compositing
        ---------------------------------------------------------------*/


        if (scene_state.ui_params.is_active_bloom) {
            // Mix the base color of the scene with the shadows information to create the final result
            this.render_in_texture("shaded", () =>{
                this.map_mixer.render(scene_state, this.texture("shadows"), this.texture("base"));
            })
            // 4. Threshold post-processing from base to pingpong0
            this.threshold.render(this.texture("shaded"), "lowres0", scene_state.ui_params.bloom_threshold);

            // 5. Blur the result
            const blurred = this.bloom_shader.applyBlur(
                this.texture("lowres0"),
                this.texture("lowres0"),
                this.texture("lowres1"),
                10
            );

            // 6. Final composite bloom on top
            this.bloom_composite.render(this.texture("shaded"), blurred, scene_state.ui_params.exposition);
        }

        else {
                this.map_mixer.render(scene_state, this.texture("shadows"), this.texture("base"));
        }

        // Visualize cubemap
        // this.mirror.env_capture.visualize();
    }
}
