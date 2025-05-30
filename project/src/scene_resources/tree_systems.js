import {vec2, vec3, vec4, mat2, mat3, mat4} from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { fromRotation } from "../../lib/gl-matrix_3.3.0/esm/mat2.js";
import { mat4_to_string } from "../cg_libraries/cg_math.js";

export function poly_plane() {
    const vertices = [
        [0, 0, 0],
        [1, 1, 1],
        [-1, 1, 1],
        [0, 0, 3],
    ];

    const normals = [
        [0, 1, 0],
        [1/Math.sqrt(2), -1/Math.sqrt(2), 0],
        [-1/Math.sqrt(2), -1/Math.sqrt(2), 0],
        [0, 1, 0],
    ];

    const faces = [
        [0, 1, 3],
        [0, 2, 3],
    ];

    const tex = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
    ];

    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: faces,
        vertex_tex_coords: tex
    };
}

export function make_n_planes(n) {
    const planes = [];
    for (let i = 0; i < n; i ++) {
        planes.push(poly_plane());
    }
    return planes;
}

export function poly_mesh(n, b_1, b_2, height) {
    const vertices = [];
    const normals = [];
    const faces = [];
    const tex = [];

    const th = (2 * Math.PI) / n;

    for (let i = 0; i < n; i ++) {
        vertices.push([b_1 * Math.cos(th * i), b_1 * Math.sin(th * i), 0]);
        vertices.push([b_2 * Math.cos(th * i), b_2 * Math.sin(th * i), height]);

        normals.push([Math.cos(th * i), Math.sin(th * i), 0]);
        normals.push([Math.cos(th * i), Math.sin(th * i), 0]);

        faces.push([(2*i) % (2*n), ((2*i) + 1) % (2*n), ((2*i) + 3) % (2*n)]);
        faces.push([(2*i) % (2*n), ((2*i) + 2) % (2*n), ((2*i) + 3) % (2*n)]);
        
        const u = i / n;
        tex.push([u, 0]); // bottom
        tex.push([u, 1]); // top
    }

    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: faces,
        vertex_tex_coords: tex
    }
}

export function scale_mesh(mesh, n) {
    return {
        vertex_positions: mesh.vertex_positions.map(v => v.map(e => n * e)),
        vertex_normals: mesh.vertex_normals,
        faces: mesh.faces,
        vertex_tex_coords: mesh.vertex_tex_coords,
    }
}

export function rotate_vec(vec, th, ph) {
    const rot_th = mat4.fromRotation(mat4.create(), th, vec3.fromValues(1, 0, 0));
    const rot_ph = mat4.fromRotation(mat4.create(), ph, vec3.fromValues(0, 0, 1));

    const rot_full = mat4.mul(mat4.create(), rot_ph, rot_th);

    return vec4.transformMat4(vec4.create(), vec, rot_full);
}

export function rotate_mesh(mesh, th, ph) {
    const rot_th = mat4.fromRotation(mat4.create(), th, vec3.fromValues(1, 0, 0));
    const rot_ph = mat4.fromRotation(mat4.create(), ph, vec3.fromValues(0, 0, 1));

    const rot_full = mat4.mul(mat4.create(), rot_ph, rot_th);

    const vertices = [...mesh.vertex_positions].map((v) => {
        const vec = vec4.fromValues(v[0], v[1], v[2], 1.);
        vec4.transformMat4(vec, vec, rot_full);

        return [vec[0], vec[1], vec[2]];
    });
    const normals = [...mesh.vertex_normals].map((v) => {
        const vec = vec4.fromValues(v[0], v[1], v[2], 1.);
        vec4.transformMat4(vec, vec, rot_full);

        return [vec[0], vec[1], vec[2]];
    });

    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: mesh.faces,
        vertex_tex_coords: mesh.vertex_tex_coords
    };
}

export function translate_vec(vec, to) {
    const trans_to = mat4.fromTranslation(mat4.create(), vec3.fromValues(to[0], to[1], to[2]));

    return vec4.transformMat4(vec4.create(), vec, trans_to);
}

export function translate_mesh(mesh, to) {
    const trans_to = mat4.fromTranslation(mat4.create(), vec3.fromValues(to[0], to[1], to[2]));

    const vertices = [...mesh.vertex_positions].map((v) => {
    const vec = vec4.fromValues(v[0], v[1], v[2], 1.);
        vec4.transformMat4(vec, vec, trans_to);

        return [vec[0], vec[1], vec[2]];
    });

    return {
        vertex_positions: vertices,
        vertex_normals: mesh.vertex_normals,
        faces: mesh.faces,
        vertex_tex_coords: mesh.vertex_tex_coords,
    };
}

export function tree(init) {
    const POLY_N = 4;

    const BRANCH_LEN = 0.7;
    const BASE = 0.1;

    const BRANCH_RATE = 0.7;
    const BASE_RATE = 0.5;

    const X_ROT_RATE = (Math.PI / 180) * 35;
    const Z_ROT_RATE = (2 * Math.PI) / 3;

    const LEAVES_PER_BRANCH = 3;

    const branches = [];
    const leaves = [];

    const pos_stack = [[0, 0, 0]];
    const rot_stack = [[0, 0]];
    const h_stack = [BRANCH_LEN];
    const b_stack = [BASE]

    for (let i = 0; i < init.length; i++) {
        switch(init[i]) {
            case 'B':
                let h = h_stack[h_stack.length - 1];
                h_stack.push(h * BRANCH_RATE);

                let b = b_stack[b_stack.length - 1];

                let branch = poly_mesh(POLY_N, b, b * BASE_RATE, h);
                let end = vec4.fromValues(0, 0, h, 1);

                // let leaf = scale_mesh(poly_plane(), 0.05);
                
                let bunch = [];
                for (let i = 0; i < LEAVES_PER_BRANCH; i ++) {
                    let phi = Math.random() * (2 * Math.PI);

                    let leaf = scale_mesh(poly_plane(), 0.05);
                    leaf = rotate_mesh(leaf, 2 * X_ROT_RATE, phi);
                    leaf = translate_mesh(leaf, [(b * BASE_RATE) * Math.cos(phi), (b * BASE_RATE) * Math.sin(phi), (Math.random() * (h/2)) + (h/2)]);

                    bunch.push(leaf);
                }

                // bunch.map(leaf => {
                //     let l = rotate_mesh(leaf, 2 * X_ROT_RATE, Math.random() * (2 * Math.PI));
                //     l = translate_mesh(l, [0, -(b * BASE_RATE), Math.random() * h]);

                //     return l;
                // });

                // leaf = rotate_mesh(leaf, 2 * X_ROT_RATE, 0.6);
                // leaf = translate_mesh(leaf, [0, -(b * BASE_RATE), h/2]);

                // Rotate mesh recursively
                rot_stack.slice().reverse().forEach (rot => {
                    branch = rotate_mesh(branch, rot[0], rot[1]);
                    end = rotate_vec(end, rot[0], rot[1]);

                    for (let i = 0; i < LEAVES_PER_BRANCH; i ++) {
                        bunch[i] = rotate_mesh(bunch[i], rot[0], rot[1]);
                    }
                    // bunch.map(leaf => rotate_mesh(leaf, rot[0], rot[1]));
                    // leaf = rotate_mesh(leaf, rot[0], rot[1]);
                });

                // Translate mesh to last position
                let last = pos_stack[pos_stack.length - 1];
                branch = translate_mesh(branch, last);

                for (let i = 0; i < LEAVES_PER_BRANCH; i ++) {
                    bunch[i] = translate_mesh(bunch[i], last);
                }
                // bunch.map(l => translate_mesh(l, last));
                // leaf = translate_mesh(leaf, last);

                // Push new last position
                pos_stack.push([end[0] + last[0], end[1] + last[1], end[2] + last[2]]);

                // Push mesh
                branches.push(branch);
                bunch.forEach(l => leaves.push(l))
                // leaves.push(leaf);
                break;

            case 'X':
                rot_stack.push([X_ROT_RATE, 0 * Z_ROT_RATE]);
                break;

            case 'Y':
                rot_stack.push([X_ROT_RATE, 1 * Z_ROT_RATE]);
                break;

            case 'Z':
                rot_stack.push([X_ROT_RATE, 2 * Z_ROT_RATE]);
                break;

            case '[':
                b_stack.push(b_stack[b_stack.length - 1] * BASE_RATE)
                break;

            case ']':
                pos_stack.pop();
                rot_stack.pop();
                h_stack.pop();
                b_stack.pop();
                break;

            default:
                break;
        }
    }
    return {
        branches: branches,
        leaves: leaves
    };
}

export function merge_meshes(meshes){
    const vertices = [];
    const normals = [];
    const faces = [];
    const tex = [];

    let vertex_count = 0;
    meshes.forEach(branch => {
        branch.vertex_positions.forEach(v => vertices.push(v));
        branch.vertex_normals.forEach(n => normals.push(n));
        branch.faces.forEach(f => faces.push(f[0] + vertex_count, f[1] + vertex_count, f[2] + vertex_count));
        branch.vertex_tex_coords.forEach(t => tex.push(t));

        vertex_count += branch.vertex_positions.length;
    })


    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: faces,
        vertex_tex_coords: tex
    };
};

export function full_tree(init, position) {
    let fun = tree(init);

    let b = merge_meshes(fun.branches);
    let l = merge_meshes(fun.leaves);

    b = translate_mesh(b, position);
    l = translate_mesh(l, position);

    return {
        branches: b,
        leaves: l
    }
}
