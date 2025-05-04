import { Scene } from "./scene.js"
import * as MATERIALS from "../render/materials.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"
import { ParticleEmitter } from "../scene_resources/particle_emitter.js";


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

    const fireEmitter = new ParticleEmitter({
      position: [0., 0., 0.], 
      maxParticles: 500,
      color: [1.0, 0.5, 0.0, 1.0],
      emissionRate: 30, // per second
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
        fire.evolve = fire.update; 
      };
    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){
  }
}
