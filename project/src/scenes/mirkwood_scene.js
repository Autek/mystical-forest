
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
import { FireEmitter } from "../scene_resources/fire_emitter.js";

export class MirkwoodScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.particle_emitters = [];
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
      is_active_fog: false,
      fog_max_height: 2.52,
      fog_opacity: 0.62,

      // ssao
      is_active_ssao: false,
      is_active_blur: false, 
      ssao_radius: 1.0,
      ssao_bias: 0.0025, 
      ssao_intensity: 2.0,

      // bloom
      bloom_exposition: 0.8,
      bloom_threshold: 1.0,
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
    const fireEmitter = new FireEmitter({
      position: [-0.75, 0, -0.3], 
      maxParticles: 100000,
      emissionRate: 10000, // per second
      color: [1.0, 0.5, 0.0, 1.0],
      maxLife: 1.0,
      minLife: 0.,
      minPartSize: 0.,
      maxPartSize: 0.2,

    });
    this.particle_emitters.push(fireEmitter);
    this.actors["fire"] = fireEmitter;
    this.lights.push({
      position : [-0.75 , 0, -2],
      color: [0.7, 0.4, 0.0]
    });

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

    // Add random trees
    const minimum_distance_from_fire = 0.8;
    const maximum_distance_from_fire = 4.0;
    const num_trees = 100;
    
    for (let i = 0; i < num_trees; i++) {
      let tree_pos;
      do {
        const x = (Math.random() * 6) - 3;
        const y = (Math.random() * 6) - 3;
        const z = -0.1;

        tree_pos = [x, y, z];
        
        const dx = tree_pos[0] - fire_pos[0];
        const dy = tree_pos[1] - fire_pos[1];
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance >= minimum_distance_from_fire && distance <= maximum_distance_from_fire) {
          break;
        }
      } while (true);
      
      const tree_scale = 0.3 + Math.random() * 0.7;
      
      this.objects.push({
        translation: tree_pos,
        scale: [tree_scale, tree_scale, tree_scale],
        mesh_reference: 'pine.obj',
        material: MATERIALS.pine
      });
    }

    // Light Source
    // this.lights.push({
    //   position : [0. , -15.0, 5.],
    //   color: [1.0, 0.5, 0.1]
    // });
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){
    for (const name in this.actors) {
      // Pine tree
      if (name === "fire"){
        const fire = this.actors[name];
        fire.evolve = (dt) => {
          fire.update(dt); 
          fire.maxPartSize = this.ui_params.fire_max_part_size;
          fire.emissionRate = this.ui_params.fire_part_emission_rate;
          fire.maxLife = this.ui_params.fire_max_part_life;
        }
      }
    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params() {

    this.ui_params.light_height = [7, 6];
    this.ui_params.fire_max_part_size = 0.1;
    this.ui_params.fire_part_emission_rate = 10000;
    this.ui_params.fire_max_part_life = 3;

    const n_steps_slider = 100;
    var min1 = 0;
    var max1 = 0.2;
    create_slider("max fire particle size", [0, n_steps_slider], (i) => {
      this.ui_params.fire_max_part_size = Math.max(min1 + i * (max1 - min1) / n_steps_slider, 0.);
    });
    const min2= 0;
    const max2 = 10000;
    create_slider("fire particle emission rate", [0, n_steps_slider], (i) => {
      this.ui_params.fire_part_emission_rate = min2 + i * (max2 - min2) / n_steps_slider;
    });

    var min3 = 0;
    var max3 = 8;
    create_slider("max fire particle life", [0, n_steps_slider], (i) => {
      this.ui_params.fire_max_part_life = Math.max(min3 + i * (max3 - min3) / n_steps_slider, 0.);
    });
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
    create_button_with_hotkey("Fog", "f", () => {
      this.ui_params.is_active_fog = !this.ui_params.is_active_fog;
    });
    create_slider("Fog max height", [0.0, 500.0], (value) => {
      this.ui_params.fog_max_height = value/100.0;
    });
    create_slider("Fog opacity", [0.0, 100.0], (value) => {
      this.ui_params.fog_opacity = value/100.0;
    });

    // ssao params
		create_button_with_hotkey("Ambient Occlusion", "a", () => {
			this.ui_params.is_active_ssao = !this.ui_params.is_active_ssao;
		});
    create_button_with_hotkey("Ambient Occlusion Blur", "b", () => {
      this.ui_params.is_active_blur = !this.ui_params.is_active_blur;
    });
    create_slider("SSAO radius", [0.0, 200.], (value) => {
      this.ui_params.ssao_radius = value/10.; // divide by 10 to account for slider only having ints
    });
    create_slider("SSAO bias", [0.0, 20.0], (value) => {
      this.ui_params.ssao_bias = value/10.0;
    });
    create_slider("SSAO intensity", [0.0, 200.0], (value) => {
      this.ui_params.ssao_intensity = value/10.0;
    });

    // bloom params
    create_button_with_hotkey("Bloom", "c", () => {
      this.ui_params.is_active_bloom = !this.ui_params.is_active_bloom;
    });
    create_slider("Bloom intensity", [0.0, 40.0], (value) => {
      this.ui_params.bloom_exposition = value/10.0;
    });
    create_slider("Bloom threshold", [0.0, 40.0], (value) => {
      this.ui_params.bloom_threshold = value/10.0;
    });




  }

}
