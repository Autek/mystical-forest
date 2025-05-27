
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

import { 
  tree,
 } from "../scene_resources/tree_systems.js"

export class TreeScene extends Scene {

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

    // const sqar_mesh = drawSquare(0, 0);

    // const sq_1 = square_mesh(0, 0, 0, 2);
    // this.resource_manager.add_procedural_mesh("sq1", sq_1);

    // const sq_2 = square_mesh(0, 0, 3, 2);
    // this.resource_manager.add_procedural_mesh("sq2", sq_2);

    // this.objects.push({
    //   translation: [0, 0, 0],
    //   scale: [1., 1., 1.],
    //   mesh_reference: 'sq1',
    //   material: MATERIALS.gold
    // });

    // this.objects.push({
    //   translation: [0, 0, 0],
    //   scale: [1., 1., 1.],
    //   mesh_reference: 'sq2',
    //   material: MATERIALS.gold
    // });

    // const branch = tree('B', 1);

    // let i = 0;
    // branch.forEach((t) => {
    //   let name = "branch" + i.toString();
    //   this.resource_manager.add_procedural_mesh(name, t);


    //   this.objects.push({
    //     translation: [0, 0, 0],
    //     scale: [1, 1, 1],
    //     mesh_reference: name,
    //     material: MATERIALS.gray
    //   })
    //   i += 1;
    // })
    // this.resource_manager.add_procedural_mesh("sq2", branch);

    // this.objects.push({
    //   translation: [1, 0, 0],
    //   scale: [0.5, 0.5, 1.],
    //   mesh_reference: 'sq2',
    //   material: MATERIALS.terrain
    // })

    // this.objects.push({
    //   translation: [0, 0, 0],
    //   scale: [0.5, 0.5, 0.5],
    //   mesh_reference: 'log.obj',
    //   material: MATERIALS.gray
    // })

    // Suzanne
    this.objects.push({
      translation: [0, 0, 0],
      scale: [2., 2., 2.],
      mesh_reference: 'suzanne.obj',
      material: MATERIALS.gray
    });

    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
    this.objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });

    this.lights.push({
      position : [-10.0 , 0., 4.],
      color: [0.75, 0.53, 0.45]
    });

    this.lights.push({
      position : [10., 0., 4.],
      color: [0, 0, 0.3]
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
  initialize_ui_params(){



  }

}
