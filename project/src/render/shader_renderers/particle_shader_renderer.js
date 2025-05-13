import { ShaderRenderer } from "./shader_renderer.js";

export class ParticleShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `particles.vert.glsl`, 
            `particles.frag.glsl`
        );

        this.maxParticles = 100000;

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

    render(scene_state) {
        const scene = scene_state.scene;

        const positions = new Float32Array(this.maxParticles * 4);
        const colors = new Uint8Array(this.maxParticles * 4);
        let aliveCount = 0;

        for (const emitter of scene.particle_emitters) {
            aliveCount += emitter.exportParticles(positions, colors, aliveCount);
        }

        // Create sortable particle records
        const particles = [];
        for (let i = 0; i < aliveCount; i++) {
            const i4 = i * 4;
            const x = positions[i4];
            const y = positions[i4 + 1];
            const z = positions[i4 + 2];
            const size = positions[i4 + 3];
            const r = colors[i4];
            const g = colors[i4 + 1];
            const b = colors[i4 + 2];
            const a = colors[i4 + 3];
            const viewMatrix = scene.camera.mat.view;

            const dist = viewMatrix[2] * x +
    viewMatrix[6] * y +
    viewMatrix[10] * z +
    viewMatrix[14]
            particles.push({ x, y, z, size, r, g, b, a, dist });
        }

        // Sort back-to-front
        particles.sort((a, b) => a.dist - b.dist);

        // Rebuild sorted buffers
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const i4 = i * 4;
            positions.set([p.x, p.y, p.z, p.size], i4);
            colors.set([p.r, p.g, p.b, p.a], i4);
        }

        this.positionBuffer.subdata(positions.subarray(0, aliveCount * 4));
        this.colorBuffer.subdata(colors.subarray(0, aliveCount * 4));

        this.pipeline({
            particleCount: aliveCount,
            positionSize: this.positionBuffer,
            color: this.colorBuffer,
            viewProjection: scene.camera.mat.view_projection,
            view: scene.camera.mat.view,
            time: scene_state.time
        });
    }

    uniforms(regl){
        return {
            viewProjection: regl.prop('viewProjection'),
            view: regl.prop('view'),
            time: regl.prop('time'),
        };
    }
}
