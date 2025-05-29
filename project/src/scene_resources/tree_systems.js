import {vec2, vec3, vec4, mat2, mat3, mat4} from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { fromRotation } from "../../lib/gl-matrix_3.3.0/esm/mat2.js";

/**
 * Handles building the 3d tree
 */

// vvv Creates simple square mesh
export function square_mesh(x, y, z, square_size) {

	const vertices = [];
	const normals = [];
	const faces = [];

    
    let sx = x - 0.5 * square_size;
    let sy = y - 0.5 * square_size;

    

    normals[0] = [0,0,1];
    normals[1] = [0,0,1];
    normals[2] = [0,0,1];
    normals[3] = [0,0,1];


    vertices[0] = [sx, sy, z];
    vertices[1] = [sx + square_size, sy + square_size, z];
    vertices[2] = [sx, sy + square_size, z];
    vertices[3] = [sx + square_size, sy, z];


    faces.push([0, 1, 2]);
    faces.push([0, 1, 3]);

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
        vertex_tex_coords: []
	}
}

export function poly_mesh(n, b_1, b_2, height) {
    const vertices = [];
    const normals = [];
    const faces = [];

    const th = (2 * Math.PI) / n;

    for (let i = 0; i < n; i ++) {
        vertices.push([b_1 * Math.cos(th * i), b_1 * Math.sin(th * i), 0]);
        vertices.push([b_2 * Math.cos(th * i), b_2 * Math.sin(th * i), height]);

        normals.push([Math.cos(th * i), Math.sin(th * i), 0]);
        normals.push([Math.cos(th * i), Math.sin(th * i), 0]);

        faces.push([(2*i) % (2*n), ((2*i) + 1) % (2*n), ((2*i) + 3) % (2*n)]);
        faces.push([(2*i) % (2*n), ((2*i) + 2) % (2*n), ((2*i) + 3) % (2*n)]);
    }
    const vertex_tex_coords = [];

    for (let i = 0; i < n; i++) {
        const u = i / n;
        vertex_tex_coords.push([u, 0]); // bottom
        vertex_tex_coords.push([u, 1]); // top
    }


    return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
        vertex_tex_coords: vertex_tex_coords,
	}
}

export function rotate_mesh(mesh, axis, th, ph) {
    const rot_th = mat4.fromRotation(mat4.create(), th, vec3.fromValues(1, 0, 0));
    const rot_ph = mat4.fromRotation(mat4.create(), ph, vec3.fromValues(0, 0, 1));

    const vertices = [...mesh.vertex_positions].map((v) => {
        const vec = vec4.fromValues(v[0], v[1], v[2], 1.);

        vec4.transformMat4(vec, vec, rot_th);
        vec4.transformMat4(vec, vec, rot_ph);

        return [vec[0], vec[1], vec[2]];
    });
    const normals = [...mesh.vertex_normals].map((v) => {
        const vec = vec4.fromValues(v[0], v[1], v[2], 1.);

        vec4.transformMat4(vec, vec, rot_th);
        vec4.transformMat4(vec, vec, rot_ph);

        return [vec[0], vec[1], vec[2]];
    });

    const tex_coords = mesh.vertex_tex_coords.map((uv) => [...uv]);
    return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: mesh.faces,
        vertex_tex_coords: tex_coords,
	};
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
		vertex_normals: normals,
		faces: mesh.faces,
        vertex_tex_coords: []
	};
}


// // vvv Creates triangular mesh
// export function branch_mesh(z_off) {
//     const vertices = [];
// 	const normals = [];
// 	const faces = [];

//     const r = 1/Math.sqrt(3);
//     const a_1 = Math.PI * (2/3);
//     const a_2 = Math.PI * (4/3);

//     // Base bottom 0-2
//     vertices.push([r, 0, 0]);
//     vertices.push([r * Math.cos(a_1), r * Math.sin(a_1), 0]);
//     vertices.push([r * Math.cos(a_2), r * Math.sin(a_2), 0]);

//     normals.push([1, 0, 0]);
//     normals.push([Math.cos(a_1), Math.sin(a_1), 0]);
//     normals.push([Math.cos(a_2), Math.sin(a_2), 0]);
    
//     // faces.push([0, 1, 2]);

//     // Base top 3-5
//     vertices.push([r, 0, z_off]);
//     vertices.push([r * Math.cos(a_1), r * Math.sin(a_1), z_off]);
//     vertices.push([r * Math.cos(a_2), r * Math.sin(a_2), z_off]);

//     normals.push([1, 0, 0]);
//     normals.push([Math.cos(a_1), Math.sin(a_1), 0]);
//     normals.push([Math.cos(a_2), Math.sin(a_2), 0]);
//     // faces.push([3, 4, 5]);

//     // Sides 
//     faces.push([0, 1, 3]);
//     faces.push([4, 1, 3]);

//     faces.push([1, 2, 4]);
//     faces.push([5, 2, 4]);

//     faces.push([2, 0, 5]);
//     faces.push([3, 0, 5]);

//     return {
// 		vertex_positions: vertices,
// 		vertex_normals: normals,
// 		faces: faces,
//         vertex_tex_coords: []
// 	}
// }

export function tree(init, position) {
    // const BRANCH_LEN = 3;
    const branches = [poly_mesh(3)];

    const pos_stack = [];
    const rot_stack = [];

    const pos_mat = mat4.create();
    const rot_mat = mat4.create();

    for (let i = 0; i < init.length; i++) {
        switch(init[i]) {
            case 'B':
                
                break;
            case 'R':
                


                break;

            default:
                break;
        }
    }


    // const mat_stack = [];
    // const pos_stack = [];
    // const siz_stack = [];

    // let curr_mat = mat4.create();
    // let curr_pos = vec4.fromValues(0., 0., 0., 1.)
    // let curr_siz = BRANCH_LEN;

    // for(let i = 0; i < init.length; i++) {
    //     switch(init[i]){

    //         case 'B':
    //             // Position Matrix
    //             curr_mat = mat4.translate(curr_mat, curr_mat, [0, 0, curr_siz])
                
    //             vec4.transformMat4(curr_pos, vec4.fromValues(0., 0., 0., 1.), curr_mat);


    //             let mesh = branch_mesh(curr_siz);

    //             const n_vertices = mesh.vertex_positions.map((v) => {
    //                 const res = vec4.create();
    //                 vec4.transformMat4(res, vec4.fromValues(v[0], v[1], v[2], 1.), curr_mat);
    //                 return [res[0], res[1], res[2]];
    //             })

    //             // New mesh
    //             const n_mesh = {
    //                 vertex_positions: n_vertices,
    //                 vertex_normals: mesh.vertex_normals,
    //                 faces: mesh.faces,
    //                 vertex_tex_coords: []
    //             }

    //             branches.push(n_mesh);
    //             break;

    //         case '[':
    //             siz_stack.push(curr_siz);
    //             curr_siz = curr_siz / 2;
    //             break;

    //         case ']':
    //             curr_siz = siz_stack.pop();
    //             break;

    //         case 'X':0
    //             curr_siz = curr_siz;
    //             break;

    //         case 'Y':
    //             curr_siz = curr_siz;
    //             break;

    //     }
    // }
    return branches;
}
