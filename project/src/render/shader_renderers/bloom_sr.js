import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js"


export class BloomShaderRenderer extends ShaderRenderer {

    /**
     * Its render function can be used to apply bloom
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager, renderInTexture){
        super(
            regl, 
            resource_manager, 
            `bloom.vert.glsl`, 
            `bloom.frag.glsl`
        );
        this.renderInTexture = renderInTexture;
        this.pipeline = this.init_pipeline();
    }
    
    /**
     * Render the objects of the scene_state with its shader
     * @param {*} scene_state 
     */
    render(inputTex, outputBufName, horizontal) {
        console.log("inputTex:", inputTex);  // 🔍 Check what you're passing in
        this.renderInTexture(outputBufName, () => {
        this.pipeline({
            image: inputTex,
            horizontal: horizontal
        });

    });
    }
    uniforms(regl){
        return {
            weight: [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216],
            resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
            image: regl.prop('image'),
            horizontal: regl.prop('horizontal')
        };
    }
    applyBlur(inputTex, pingpong0Tex, pingpong1Tex, passes = 10) {
        let horizontal = true;
        let first_iteration = true;
        let input = inputTex;

        for (let i = 0; i < passes; ++i) {
            const output = horizontal ? "pingpong1" : "pingpong0";

            this.render(
                first_iteration ? input : (horizontal ? pingpong0Tex : pingpong1Tex),
                output,
                horizontal
            );

            horizontal = !horizontal;
            if (first_iteration) first_iteration = false;
        }

        // Return the last buffer used as output
        return horizontal ? pingpong0Tex : pingpong1Tex;
    }
    init_pipeline() {
        return this.regl({
            vert: this.vert_shader,
            frag: this.frag_shader,

            attributes: {
                position: [
                    [-1, -1],
                    [1, -1],
                    [1, 1],
                    [-1, 1],
                ],
            },

            elements: [
                [0, 1, 2],
                [0, 2, 3],
            ],

            uniforms: this.uniforms(this.regl),
            depth: { enable: false },
            blend: this.blend(),
        });
    }
}
