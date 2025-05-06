
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js";
import * as MATERIALS from "../render/materials.js";

import {
  create_button_with_hotkey,
  create_hotkey_action,
  create_slider
} from "../cg_libraries/cg_web.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { Scene } from "./scene.js";

export class TutorialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager) {
    super();

    this.resource_manager = resource_manager;

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene() {

    const suzanne = {
      translation: [0, 0, 0],
      scale: [1., 1., 1.],
      mesh_reference: 'suzanne.obj',
      material: MATERIALS.gray
    };
    this.objects.push(suzanne);
    this.actors['suzanne'] = suzanne;

    const sphere_env_map = {
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    };
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16))
    this.objects.push(sphere_env_map);

    this.lights.push({
      position: [0.0, -2.0, 2.0], // [left/right, front/back up/down]
      color: [1.0, 1.0, 0.9]
    });

    // ui stuff
    this.ui_params = {
      obj_height: 0,
      is_active_mirror: true
    };

  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions() {

    const suzanne = this.actors['suzanne'];
    this.phase = 0;

    suzanne.evolve = (dt) => {
      const f = 0.25;
      this.phase += dt * Math.PI * 2 * f;
      this.phase %= 2 * Math.PI;

      const grow = 0.2;
      const new_scale = 1 + Math.cos(this.phase) * grow;
      suzanne.scale = [new_scale, new_scale, new_scale];

      suzanne.translation = [0, 0, this.ui_params.obj_height];
    }

  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params() {

    // preset view: in front of obj
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor: 0.2,
        angle_z: -1.57, // right/left
        angle_y: -0.29240122440170113, // up/down
        look_at: [0, 0, 0]
      })
    });

    // slider: vertical pos of suzanne
    const steps = 100;
    const min_height = 0;
    const max_height = 1;
    create_slider("Suzanne's position ", [0, steps], (i) => {
      this.ui_params.obj_height = min_height + i * (max_height - min_height) / steps;
    });

    // mirror button
    create_button_with_hotkey("Mirror on/off", "m", () => {
      this.ui_params.is_active_mirror = !this.ui_params.is_active_mirror;
    });

  }


}
