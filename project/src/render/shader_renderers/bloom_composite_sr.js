import { ShaderRenderer } from "./shader_renderer.js";

export class BloomCompositeRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(regl, resource_manager, "bloom_composite.vert.glsl", "bloom_composite.frag.glsl");
        this.pipeline = this.init_pipeline();
    }

    render(baseTex, bloomTex) {
        this.pipeline({
            baseTex,
            bloomTex
        });
    }

    uniforms(regl) {
        return {
            baseTex: regl.prop("baseTex"),
            bloomTex: regl.prop("bloomTex"),
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
                uv: [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
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
