import { Scene } from "./scene.js"
import * as MATERIALS from "../render/materials.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"
import { FireEmitter } from "../scene_resources/fire_emitter.js";
import { create_button_with_hotkey, create_slider } from "../cg_libraries/cg_web.js";


export class ParticleScene extends Scene {

  /**
   * A scene featuring particles
   * 
   * @param {ResourceManager} resource_manager 
   * @param {ProceduralTextureGenerator} procedural_texture_generator 
   */
  constructor(resource_manager){
    super();

    this.resource_manager = resource_manager;    

    // particles 
    this.particle_emitters = [];

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  initialize_scene(){

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

    const fireEmitter = new FireEmitter({
      position: [0., 0., 0.], 
      maxParticles: 100000,
      emissionRate: 300, // per second
      color: [1.0, 0.5, 0.0, 1.0],
      maxLife: 3,
      minLife: 1.5,
      minPartSize: 0.5,
      maxPartSize: 1.5,

    });
    this.particle_emitters.push(fireEmitter);
    this.actors["fire"] = fireEmitter;

    this.objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){
    
    for (const name in this.actors) {
      // fire
      if (name === "fire"){
        const fire = this.actors[name];
        fire.evolve = (dt) => {
          fire.maxPartSize = this.ui_params.fire_max_part_size;
          fire.minPartSize = this.ui_params.fire_min_part_size;
          fire.emissionRate = this.ui_params.fire_part_emission_rate;
          fire.maxLife = this.ui_params.fire_max_part_life;
          fire.minLife = this.ui_params.fire_min_part_life;
          fire.fireRadius = this.ui_params.fire_radius;
          fire.speed = this.ui_params.fire_speed;
          fire.aDecay = this.ui_params.fire_alpha_decay;
          fire.bDecay = this.ui_params.fire_blue_decay;
          fire.gDecay = this.ui_params.fire_green_decay;
          fire.rDecay = this.ui_params.fire_red_decay;
          fire.aThreshold = this.ui_params.fire_alpha_threshold;
          fire.bThreshold = this.ui_params.fire_blue_threshold;
          fire.gThreshold = this.ui_params.fire_green_threshold;
          fire.rThreshold = this.ui_params.fire_red_threshold;
          fire.update(dt); 
        }
      };
    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){
    this.ui_params.fire_max_part_size = 0.5;
    this.ui_params.fire_min_part_size = 0.;
    this.ui_params.fire_part_emission_rate = 1000;
    this.ui_params.fire_max_part_life = 3;
    this.ui_params.fire_min_part_life = 0.;
    this.ui_params.fire_radius = 2;
    this.ui_params.fire_speed = 1;
    this.ui_params.fire_alpha_decay = 1;
    this.ui_params.fire_blue_decay = 1;
    this.ui_params.fire_green_decay = 1;
    this.ui_params.fire_red_decay = 1;
    this.ui_params.fire_alpha_threshold = 0;
    this.ui_params.fire_blue_threshold = 0;
    this.ui_params.fire_green_threshold = 0;
    this.ui_params.fire_red_threshold = 0;

    const n_steps_slider = 100;
    var min1 = 0;
    var max1 = 2;
    create_slider("max fire particle size", [0, n_steps_slider], (i) => {
      this.ui_params.fire_max_part_size = Math.max(min1 + i * (max1 - min1) / n_steps_slider, this.ui_params.fire_min_part_size);
    });
    create_slider("min fire particle size", [0, n_steps_slider], (i) => {
      this.ui_params.fire_min_part_size = Math.min(min1 + i * (max1 - min1) / n_steps_slider, this.ui_params.fire_max_part_size);
    });

    const min2= 0;
    const max2 = 10000;
    create_slider("fire particle emission rate", [0, n_steps_slider], (i) => {
      this.ui_params.fire_part_emission_rate = min2 + i * (max2 - min2) / n_steps_slider;
    });

    var min3 = 0;
    var max3 = 8;
    create_slider("max fire particle life", [0, n_steps_slider], (i) => {
      this.ui_params.fire_max_part_life = Math.max(min3 + i * (max3 - min3) / n_steps_slider, this.ui_params.fire_min_part_life);
    });
    create_slider("min fire particle life", [0, n_steps_slider], (i) => {
      this.ui_params.fire_min_part_life = Math.min(min3 + i * (max3 - min3) / n_steps_slider, this.ui_params.fire_max_part_life);
    });

    const min4= 0;
    const max4 = 10;
    create_slider("fire radius", [0, n_steps_slider], (i) => {
      this.ui_params.fire_radius = min4 + i * (max4 - min4) / n_steps_slider;
    });

    const min5= 0;
    const max5 = 10;
    create_slider("fire particle speed", [0, n_steps_slider], (i) => {
      this.ui_params.fire_speed = min5 + i * (max5 - min5) / n_steps_slider;
    });

    const min7 = 0;
    const max7 = 1;
    create_slider("fire alpha decay", [0, n_steps_slider], (i) => {
      this.ui_params.fire_alpha_decay = min7 + i * (max7 - min7) / n_steps_slider;
    });

    const min8 = 0;
    const max8 = 1;
    create_slider("fire alpha threshold", [0, n_steps_slider], (i) => {
      this.ui_params.fire_alpha_threshold = min8 + i * (max8 - min8) / n_steps_slider;
    });

    const min9 = 0;
    const max9 = 1;
    create_slider("fire blue decay", [0, n_steps_slider], (i) => {
      this.ui_params.fire_blue_decay = min9 + i * (max9 - min9) / n_steps_slider;
    });

    const min10 = 0;
    const max10 = 1;
    create_slider("fire blue threshold", [0, n_steps_slider], (i) => {
      this.ui_params.fire_blue_threshold = min10 + i * (max10 - min10) / n_steps_slider;
    });

    const min11 = 0;
    const max11 = 1;
    create_slider("fire green decay", [0, n_steps_slider], (i) => {
      this.ui_params.fire_green_decay = min11 + i * (max11 - min11) / n_steps_slider;
    });
    
    const min12 = 0;
    const max12 = 1;
    create_slider("fire green threshold", [0, n_steps_slider], (i) => {
      this.ui_params.fire_green_threshold = min12 + i * (max12 - min12) / n_steps_slider;
    });
    const min13 = 0;
    const max13 = 1;
    create_slider("fire red decay", [0, n_steps_slider], (i) => {
      this.ui_params.fire_red_decay = min13 + i * (max13 - min13) / n_steps_slider;
    });
    const min14 = 0;
    const max14 = 1;
    create_slider("fire red threshold", [0, n_steps_slider], (i) => {
      this.ui_params.fire_red_threshold = min14 + i * (max14 - min14) / n_steps_slider;
    });
    // bloom params
    create_button_with_hotkey("Bloom", "c", () => {
      this.ui_params.is_active_bloom = !this.ui_params.is_active_bloom;
    });
    create_slider("camera exposition", [0.0, 40.0], (value) => {
      this.ui_params.bloom_exposition = value/10.0;
    });
    create_slider("Bloom threshold", [0.0, 40.0], (value) => {
      this.ui_params.bloom_threshold = value/10.0;
    });
  }
}
