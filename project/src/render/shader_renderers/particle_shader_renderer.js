import { ShaderRenderer } from "./shader_renderer.js";


export class ParticleShaderRenderer extends ShaderRenderer {

    /**
     * Its render function is used to render particles
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `particles.vert.glsl`, 
            `particles.frag.glsl`
        );

        this.maxParticles = 1000;

        this.quadBuffer = regl.buffer([
            [-0.5, -0.5],
            [ 0.5, -0.5],
            [-0.5,  0.5],
            [ 0.5,  0.5]
        ]);

        this.positionBuffer = regl.buffer({
            usage: 'stream',
            type: 'float',
            length: this.maxParticles * 4 * 4
        });

        this.colorBuffer = regl.buffer({
            usage: 'stream',
            type: 'uint8',
            length: this.maxParticles * 4
        });

        this.pipeline = regl({
            vert: this.vert_shader,
            frag: this.frag_shader,
            attributes: {
                quadVertex: { buffer: this.quadBuffer, divisor: 0 },
                positionSize: { buffer: () => this.positionBuffer, divisor: 1 },
                color: { buffer: () => this.colorBuffer, divisor: 1, normalized: true }
            },
            uniforms: this.uniforms(regl),
            count: 4,
            instances: regl.prop('particleCount'),
            primitive: 'triangle strip',
            depth: { enable: true },
            blend: {
                enable: true,
                func: {
                    src: 'src alpha',
                    dst: 'one'
                }
            }
        });
    }

    /**
     * Render all particles.
     * @param {*} scene_state 
     */
    render(scene_state) {
        const scene = scene_state.scene;

        // Buffers to collect all particle data
        const positions = new Float32Array(this.maxParticles * 4); // [x, y, z, size]
        const colors = new Uint8Array(this.maxParticles * 4);      // [r, g, b, a]
        let aliveCount = 0;

        for (const emitter of scene.particle_emitters) {
            // Export particles from emitter directly into the buffers
            aliveCount += emitter.exportParticles(positions, colors, aliveCount); 
        }

        // Push to GPU
        this.positionBuffer.subdata(positions.subarray(0, aliveCount * 4));
        this.colorBuffer.subdata(colors.subarray(0, aliveCount * 4));

        // Call the draw pipeline
        this.pipeline({
            particleCount: aliveCount,
            positionSize: this.positionBuffer,
            color: this.colorBuffer,
            viewProjection: scene_state.scene.camera.mat.view_projection,
            view: scene_state.scene.camera.mat.view,
            time: scene_state.time
        });
    }

    uniforms(regl){
        return{
            viewProjection: regl.prop('viewProjection'),   // mat4
            view: regl.prop('view'),   // mat4
            time: regl.prop('time'),                       // float
        };
    }
}

