
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

export class MirkwoodScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene(){

    // ui stuff
		this.ui_params = {
      // fog
      fog_max_height: 0.3,
      fog_opacity: 2.5,

      // ssao
      is_active_ssao: false,
      is_active_blur: false, 
      ssao_radius: 1.0,
      ssao_bias: 0.025, 
      ssao_intensity: 2.0,
    };

    // Place
    const suz ={
      translation: [0, 0, 0],
      scale: [1., 1., 1.],
      mesh_reference: 'place.obj',
      material: MATERIALS.terrain
    };
    this.objects.push(suz);

    // Fireplace
    const fire_scale = [0.3, 0.3, 0.3];
    const fire_pos = [-0.75, 0, -0.3];

    const logs ={
      translation: fire_pos,
      scale: fire_scale,
      mesh_reference: 'firelogs.obj',
      material: MATERIALS.wood
    };
    this.objects.push(logs);

    const stones ={
      translation: fire_pos,
      scale: fire_scale,
      mesh_reference: 'firestones.obj',
      material: MATERIALS.gray
    };
    this.objects.push(stones);

    const dirt ={
      translation: fire_pos,
      scale: fire_scale,
      mesh_reference: 'firedirt.obj',
      material: MATERIALS.black
    };
    this.objects.push(dirt);

    // Skybox
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
    this.objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });

    // Light Source
    this.lights.push({
      position : [0. , -15.0, 5.],
      color: [1.0, 1.0, 0.9]
    });

    this.lights.push({
      position : [0. , -15.0, -5.],
      color: [1.0, 1.0, 0.9]
    });

  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){

  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params() {

    // preset view
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.09854892647087418,
        angle_z : 0.5413185307179585,
        angle_y : -0.03459877559829886,
        look_at : [0, 0, 0]
      })
    });
    
    // fog params
    create_slider("Fog max height", [0.0, 50.0], (value) => {
      this.ui_params.fog_max_height = value/100.0;
    });
    create_slider("Fog opacity", [0.0, 100.0], (value) => {
      this.ui_params.fog_opacity = value/10.0;
    });

    

  }

}
