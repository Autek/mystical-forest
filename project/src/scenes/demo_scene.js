
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"
import { terrain_build_mesh } from "../scene_resources/terrain_generation.js"
import { noise_functions } from "../render/shader_renderers/noise_sr.js"
import { Scene } from "./scene.js"
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { create_button, create_slider, create_hotkey_action, create_button_with_hotkey } from "../cg_libraries/cg_web.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"
import { framebuffer_to_image_download } from "../cg_libraries/cg_screenshot.js"
import { FireEmitter } from "../scene_resources/fire_emitter.js"


export class DemoScene extends Scene {

  /**
   * A scene featuring a procedurally generated terrain with dynamic objects
   * 
   * @param {ResourceManager} resource_manager 
   * @param {ProceduralTextureGenerator} procedural_texture_generator 
   */
  constructor(resource_manager, procedural_texture_generator){
    super();

    this.resource_manager = resource_manager;    
    this.procedural_texture_generator = procedural_texture_generator;

    // Additional helper lists to better organize dynamic object generation
    this.static_objects = [];
    this.dynamic_objects = [];
    this.particle_emitters = [];

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  initialize_scene(){

    // ui stuff
		this.ui_params = {
      is_active_ssao: false,
    };

    // Add lights
    this.lights.push({
      position : [-4,-5,7],
      color: [0.5, 0.5, 0.5]
    });
    this.lights.push({
      position : [6,4,6],
      color: [1.0, 0.8, 0.8]
    });
    
    // Add a procedurally generated mesh
    const height_map = this.procedural_texture_generator.compute_texture(
      "perlin_heightmap", 
      noise_functions.FBM_for_terrain, 
      {width: 96, height: 96, mouse_offset: [-12.24, 8.15]}
    );
    this.WATER_LEVEL = -0.03125;
    this.TERRAIN_SCALE = [10,10,10];
    const terrain_mesh = terrain_build_mesh(height_map, this.WATER_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_terrain", terrain_mesh);
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));

    // Add some meshes dynamically - see more functions below
    place_random_trees(this.dynamic_objects, this.actors, terrain_mesh, this.TERRAIN_SCALE, this.WATER_LEVEL);

    // Add some meshes to the static objects list
    this.static_objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });

    this.static_objects.push({
      translation: [0, 0, 0],
      scale: this.TERRAIN_SCALE,
      mesh_reference: 'mesh_terrain',
      material: MATERIALS.terrain
    });

    // Combine the dynamic & static objects into one array
    this.objects = this.static_objects.concat(this.dynamic_objects);

    // We add the (static) lights to the actor list to allow them to be modified from the UI
    this.lights.forEach((light, i) => {
      this.actors[`light_${i}`] = light
    });

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
    }
      if (name.includes("tree")){
        const tree = this.actors[name];
        tree.evolve = (dt) => {
          const max_scale = 0.4;
          if (tree.scale[0] < max_scale){
            grow_tree(tree.scale, dt);
          }
          else{
            tree.scale = [max_scale, max_scale, max_scale];
          }
        };
      }
      // Lights
      else if (name.includes("light")){
        const light = this.actors[name];
        const light_idx = parseInt(name.split("_")[1]);
        light.evolve = (dt) => {
          const curr_pos = light.position;
          light.position = [curr_pos[0], curr_pos[1], this.ui_params.light_height[light_idx]];
        }
      }
    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    this.ui_params.light_height = [7, 6];
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
    this.ui_params.is_active_bloom = false;
    this.ui_params.bloom_threshold = 1.0;
    this.ui_params.exposition = 1.0;


    // Set preset view
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.6086308726792908,
        angle_z : -1.3426814692820401,
        angle_y : -0.47559877559829866,
        look_at : [0, 0, 0]
      })
    });
    
    // Create a slider to change the height of each light
    const n_steps_slider = 100;
    const min_light_height_1 = 7;
    const max_light_height_1 = 9;
    create_slider("Height light 1 ", [0, n_steps_slider], (i) => {
      this.ui_params.light_height[0] = min_light_height_1 + i * (max_light_height_1 - min_light_height_1) / n_steps_slider;
    });
    const min_light_height_2 = 6;
    const max_light_height_2 = 8;
    create_slider("Height light 2 ", [0, n_steps_slider], (i) => {
      this.ui_params.light_height[1] = min_light_height_2 + i * (max_light_height_2 - min_light_height_2) / n_steps_slider;
    });

    // Add button to generate random terrain
    create_button("Random terrain", () => {this.random_terrain()});

    // ssao button
    create_button_with_hotkey("Ambient Occlusion", "a", () => {
      this.ui_params.is_active_ssao = !this.ui_params.is_active_ssao;
    });
    // blur button
    create_button_with_hotkey("Ambient Occlusion Blur", "b", () => {
      this.ui_params.is_active_blur = !this.ui_params.is_active_blur;
    });

    create_button_with_hotkey("bloom", "c", () => {
      this.ui_params.is_active_bloom = !this.ui_params.is_active_bloom;
    });

    const min_bloom = 0;
    const max_bloom = 4;
    create_slider("exposition", [0, n_steps_slider], (i) => {
      this.ui_params.exposition = min_bloom + i * (max_bloom - min_bloom) / n_steps_slider;
    });

    const min_bloom_thresh = 0;
    const max_bloom_thresh = 4;
    create_slider("bloom threshold", [0, n_steps_slider], (i) => {
      this.ui_params.bloom_threshold = min_bloom_thresh + i * (max_bloom_thresh - min_bloom_thresh) / n_steps_slider;
    });

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
  }

  /**
   * Generate a random terrain
   */
  random_terrain(){
    const x = Math.round((Math.random()-0.5)*1000);
    const y = Math.round((Math.random()-0.5)*1000);
    console.log(`seed: [${x}, ${y}]`)
    this.recompute_terrain([x, y]);
  }

  /**
   * Allow the generate a new terrain without recreating the whole scene
   * @param {*} offset the new offset to compute the noise for the heightmap
   */
  recompute_terrain(offset){
    // Clear the list of dynamic objects
    this.dynamic_objects = [];

    // Compute a new height map
    const height_map = this.procedural_texture_generator.compute_texture(
      "perlin_heightmap", 
      noise_functions.FBM_for_terrain, 
      {width: 96, height: 96, mouse_offset: offset}
    );

    // Recompute the terrain mesh with the new heigthmap and replace
    // the old one in the resources manager
    const terrain_mesh = terrain_build_mesh(height_map, this.WATER_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_terrain", terrain_mesh);
    
    // Place the trees on this new terrain
    place_random_trees(this.dynamic_objects, this.actors, terrain_mesh, this.TERRAIN_SCALE, this.WATER_LEVEL);

    // Reinitialize the actors actions
    this.initialize_actor_actions();

    // Update the scene objects
    this.objects = this.static_objects.concat(this.dynamic_objects);
  }

}


/**
 * Dynamically place some object on a mesh. 
 * Iterate over all vertices and randomly decide whether 
 * to place an object on it or not.
 * @param {*} objects 
 * @param {*} actors 
 * @param {*} terrain_mesh 
 * @param {*} TERRAIN_SCALE 
 * @param {*} water_level 
 */
function place_random_trees(objects, actors, terrain_mesh, TERRAIN_SCALE, water_level){
  
  const up_vector = [0,0,1] 

  // Iterate ovew the terrain vertices as a pair vertex (the position) 
  // and its index in the array used for pseudo-randomness
  terrain_mesh.vertex_positions.forEach((vertex, index) => {
      const position = vertex;
      const normal = terrain_mesh.vertex_normals[index];

      // Decide wether or not place something on this vertex
      const result = decide(index);

      // If the decision function return 1 we choose to place a tree
      if (result == 1){
        // Check vertices is above water, below mountain, with gentle slope, and far from the boundary
        if(
          position[2] > water_level
          && position[2] < 0.1 // mountain level
          && vec3.angle(up_vector, normal) < Math.PI/180*40 
          && position[0] > -0.45 && position[0] < 0.45  // avoid boundary
          && position[1] > -0.45 && position[1] < 0.45
        ){
          // Add a new tree to the list of scene objects and actors
          const tree = new_tree(position, TERRAIN_SCALE, index);
          objects.push(tree);
          actors[`tree_${objects.length}`] = tree;
        }
      }
  });
}


/**
 * Update the scale and increase it linearly with time
 * @param {*} scale scale to update 
 * @param {*} dt 
 */
function grow_tree(scale, dt){
  const grow_factor = 0.1;
  scale[0] = scale[0] + (dt*grow_factor);
  scale[1] = scale[1] + (dt*grow_factor);
  scale[2] = scale[2] + (dt*grow_factor);
}

/**
 * Given a vertex, decide wether to place something on it or not
 * @param {*} index of the vertex 
 * @returns 
 */
function decide(index){
  const chance = 10; // the higher this value, the less likely it is to place an object
  const idx = (pseudo_random_int(index))%chance;
  return idx
}


/**
 * Create a new tree with a pseudo random scale based on index
 * scale position and size regarding the terrain scale
 * @param {*} position where the tree will be
 * @param {*} TERRAIN_SCALE 
 * @param {*} index associated with the position
 * @returns 
 */
function new_tree(position, TERRAIN_SCALE, index){

  const min_size = 0.0001;
  const max_size = 0.25;
  
  const scale = min_size + (max_size-min_size) * (pseudo_random_int(index)%1000)/1000;

  return {
      translation: vec3.mul([0,0,0], TERRAIN_SCALE, position),
      scale: [
        scale, 
        scale, 
        scale
      ],
          
      mesh_reference: 'pine.obj',

      material: MATERIALS.pine,
  }
}

/**
 * Gives a pseudo random number based on an index value
 * @param {*} index random seed 
 * @returns a pseudo random int
 */
function pseudo_random_int(index) {
  index = (index ^ 0x5DEECE66D) & ((1 << 31) - 1);
  index = (index * 48271) % 2147483647; // Prime modulus
  return (index & 0x7FFFFFFF); 
}

