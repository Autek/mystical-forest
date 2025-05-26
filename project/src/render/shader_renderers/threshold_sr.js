import { ShaderRenderer } from "./shader_renderer.js";

export class ThresholdShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager, renderInTexture) {
        super(regl, resource_manager, "threshold.vert.glsl", "threshold.frag.glsl");
        this.renderInTexture = renderInTexture;
    }

    render(inputTex, outputBufName, threshold) {
        this.renderInTexture(outputBufName, () => {
            this.pipeline({
                inputTex,
                position: [
                    [-1, -1], [1, -1], [1, 1], [-1, 1]
                ],
                elements: [
                    [0, 1, 2], [0, 2, 3]
                ],
                threshold
            });
        });
    }

    uniforms(regl) {
        return {
            inputTex: regl.prop("inputTex"),
            threshold: regl.prop("threshold")
        };
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
            blend: { enable: false },
        });
    }
}
