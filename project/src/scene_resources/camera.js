import { vec2, vec3, vec4, mat3, mat4 } from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { deg_to_rad, mat4_matmul_many } from "../cg_libraries/cg_math.js"

export class TurntableCamera {
    constructor() {
        this.angle_z = Math.PI * 0.2;
        this.angle_y = -Math.PI / 6;
        this.distance_factor = 1.;
        this.distance_base = 15.;
        this.look_at = [0, 0, 0];

        this.position = [0, 0, 0]; // Will be computed

        this.mat = {
            projection: mat4.create(),
            view: mat4.create(),
            view_projection: mat4.create()
        };

        this.update_format_ratio(100, 100);
        this.update_cam_transform();
    }

    update_format_ratio(width, height) {
        mat4.perspective(this.mat.projection,
            deg_to_rad * 60,
            width / height,
            0.01,
            512
        );
    }

    update_cam_transform() {
        const r = this.distance_base * this.distance_factor;
        const rawPos = vec3.fromValues(-r, 0, 0);

        // Apply rotations to raw camera position
        const rotY = mat4.fromYRotation(mat4.create(), this.angle_y);
        const rotZ = mat4.fromZRotation(mat4.create(), this.angle_z);
        const totalRot = mat4_matmul_many(mat4.create(), rotY, rotZ);

        vec3.transformMat4(this.position, rawPos, totalRot);
        vec3.add(this.position, this.position, this.look_at); // move relative to look_at

        // Recompute view matrix from camera position
        const M_look_forward = mat4.lookAt(mat4.create(),
            this.position,
            this.look_at,
            [0, 0, 1]
        );

        mat4_matmul_many(this.mat.view, M_look_forward);
        mat4.multiply(this.mat.view_projection, this.mat.projection, this.mat.view);
    }

    compute_objects_transformation_matrices(scene_objects) {
        this.object_matrices = new Map();

        for (const obj of scene_objects) {
            const transformation_matrices = this.compute_transformation_matrices(obj);
            this.object_matrices.set(obj, transformation_matrices);
        }
    }

    compute_transformation_matrices(object) {
        const mat_projection = this.mat.projection;
        const mat_view = this.mat.view;

        const mat_model_to_world = mat4.create();
        mat4.fromTranslation(mat_model_to_world, object.translation);
        mat4.scale(mat_model_to_world, mat_model_to_world, object.scale);

        const mat_model_view = mat4.create();
        const mat_model_view_projection = mat4.create();
        const mat_normals_model_view = mat3.create();

        mat4_matmul_many(mat_model_view, mat_view, mat_model_to_world);
        mat4_matmul_many(mat_model_view_projection, mat_projection, mat_model_view);

        mat3.identity(mat_normals_model_view);
        mat3.fromMat4(mat_normals_model_view, mat_model_view);
        mat3.invert(mat_normals_model_view, mat_normals_model_view);
        mat3.transpose(mat_normals_model_view, mat_normals_model_view);

        return { mat_model_view, mat_model_view_projection, mat_normals_model_view };
    }

    set_preset_view(view) {
        this.distance_factor = view.distance_factor;
        this.angle_z = view.angle_z;
        this.angle_y = view.angle_y;
        this.look_at = view.look_at;
        this.update_cam_transform();
    }

    log_current_state() {
        console.log(
            "distance_factor:", this.distance_factor,
            "angle_z:", this.angle_z,
            "angle_y:", this.angle_y,
            "look_at:", this.look_at
        );
    }

    zoom_action(deltaY) {
        const factor_mul_base = 1.18;
        const factor_mul = (deltaY > 0) ? factor_mul_base : 1. / factor_mul_base;
        this.distance_factor *= factor_mul;
        this.distance_factor = Math.max(0.02, Math.min(this.distance_factor, 4));
        this.update_cam_transform();
    }

    rotate_action(movementX, movementY) {
        this.angle_z += movementX * 0.003;
        this.angle_y += -movementY * 0.003;
        this.update_cam_transform();
    }

    move_action(movementX, movementY) {
        const scaleFactor = this.distance_base * this.distance_factor * 0.0005;

        const right = [
            Math.sin(this.angle_z),
            Math.cos(this.angle_z),
            0
        ];

        const up = [
            -Math.cos(this.angle_z) * Math.sin(this.angle_y),
            Math.sin(this.angle_z) * Math.sin(this.angle_y),
            Math.cos(this.angle_y)
        ];

        this.look_at[0] += right[0] * movementX * scaleFactor + up[0] * movementY * scaleFactor;
        this.look_at[1] += right[1] * movementX * scaleFactor + up[1] * movementY * scaleFactor;
        this.look_at[2] += up[2] * movementY * scaleFactor;

        this.update_cam_transform();
    }
}
