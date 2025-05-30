---
title: Final Project Report CS-341 2025
---

# Mystical Forest

<div>
<video src="videos/demo_teaser.mp4" height="300px" autoplay loop></video>
</div>
<figcaption style="text-align: center;">A short teaser video, gif, or image showing an overview of the final result.</figcaption>

## Abstract

In our project Mystical Forest, we have create a foggy, mystical forest, with a calming fire. We used ambient occlusion and fog to create a dim atmosphere, and added a fire generated with particles and bloom to enhance the light it produces. The trees are L-systems generated simulate a real forest.  

## Overview

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/demo_detail.png" height="210px" style="vertical-align: middle;">
</div>
<div>
<video src="videos/demo_detail.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
</div>
<figcaption style="text-align: center;">Some more visuals focusing on interesting details of your scene.</figcaption>

We generated the trees procedurally using L-systems. This means they can be easily modified to create different types of trees, or other plants. blablabla @coaguila fill in this part. 

We also added a fog to create a more immersive atmosphere. The fog is implemented using a fragment shader that calculates the fog density based on the distance from the camera, and applies it to the scene. This gives a sense of depth and mystery to the forest, which is really cool to see. 

To add even more to the atmosphere, and because it's an interesting effect, we added screen-space ambient occlusion. This creates a more realistic lighting by simulating how light interacts with nearby environment, especially in the corners and crevices that we have on the trees. It gives a nice depth to the scene. 

Finally, we added a fire using particles. blablabla @Autek fill in this part. 

The terrain was made by hand in Blender, and we used the given shader to apply texture to it.

## Feature validation

<table>
	<caption>Feature Summary</caption>
	<thead>
		<tr>
			<th>Feature</th>
			<th>Adapted Points</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Ambient Occlusion</td>
			<td>17</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Particle Effects</td>
			<td>17</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Fog</td>
			<td>4</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>L-Systems for Procedural Scene Generation</td>
			<td>8</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Bloom</td>
			<td>4</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
	</tbody>
</table>


### Ambient Occlusion

#### Implementation

The ambient occlusion is implemented in screen space by using a fragment shader that samples the depth buffer to compute the occlusion factor: it compares the depth of the current fragment with the depth of nearby fragments to determine how much light is occluded. We then apply that factor to the ambient light of the scene to reduce it in areas that should be dimmed. A bias is applied to deal with acnee, and a later blur pass smoothes the result to avoid harsh edges.

The occlusion factor is computed in three passes:
1. **G-buffer pass:** we render the scene to a simple G-buffer with three textures in different color attachement (position, normal and albedo). We couldn't use the syntax given in the OpenGL tutorial since we are working in WEBGL1.0 instead of WEBGL2.0. This is done in `gbuffer_sr.js`, `gbuffer.vert.glsl` and `gbuffer.frag.glsl`.

2. **SSAO pass:** this pass computes the ambient occlusion factor. In `ssao_sr.js`, we generate a kernel of random samples and a random rotation texture and pass it to the shaders. The vertex shader is a simple buffer-to-screen shader, but the fragment shader `ssao.frag.glsl` computes the occulsion factor. It iterates on the random (rotationned) samples, gets the value of the G-buffer at that point, transforms it to screen-space and computes and only increments the occlusion factor if the depth of the sample is visible from the viewer's point of view. The occlusion factor is then normalized by the number of samples. 

	There are multiple tweakable parameters to adjust the effect:
	  - kernel size: the number of samplse in the kernel. The more samples we have, the more accurate the result is, but also the more expensive it is to compute. We found that 64 samples was a good middle ground.
	  - radius: the radius in which the occlusion factor is computed. The larger the radius is, the larger the area of influence of the occlusion is. To avoid hard cuttoffs, the border should be smoothstep'd.
	  - bias: the bias is used to avoid acne like is done in other shadowing techniques.
	  - intensity: the intensity of the occlusion. It's just a power applied to the final occlusion factor to make it more or less pronounced.

<!-- todo: add images of only ssao buffer -->

1. _(optional)_ **Blur pass:** this pass smoothes the result of the SSAO pass to avoid harsh edges. It applies a 4x4 box blur to the SSAO texture. This is done in `blur_sr.js`, `buffer_to_screen.vert.glsl` and `blur.frag.glsl`. We found that a box blur was sufficient for our needs since SSAO is already a discreet effect so the diffence between box blur and guassian blur was not visible.

<!-- todo: add images of blur on ssao -->

After having computed the ambient occlusion factor, we integrate it to the scene by passing it to the Blinn-Phong and terrain shaders, and multiplying it with the ambient light component. 

#### Validation
_We have a simple scene to visualize SSAO. From left to right, it has a taurus, a spehere, a small cube, and a big cube._

1. **G-buffer:**

	In the position texture, we have the green quadrant representing positions where $y > 0$ and $x < 0$, the yellow quadrant with $y > 0$ and $x > 0$, the black quadrant with $y < 0$ and $x < 0$, and the red quadrant with $y < 0$ and $x > 0$. 

	![G-buffer position texture](images/gbuffer_position.png)
	_G-buffer position texture_

	The normal texture just shows the normals of the scene, as usual.
	
	![G-buffer normal texture](images/gbuffer_normals.png)
	_G-buffer normal texture_

	The albedo texture shows the colors of the scene as they would appear wihtout any treatment. Everything is white.
	
	![G-buffer albedo texture](images/gbuffer_albedo.png)
	_G-buffer albedo texture_

2. **SSAO:** Rendering only the SSAO texture, we can see the occlusion factor computed by the shader. It is already "reversed" so the darker regions are the ones being the most occluded. We are ony rendering the occlusion factor throught the red channel, which is why the image is red. 

	We can clearly see that the regions of our objects that are closest to the ground are being occluded. There is some artifacting because of the repetition of the kernel samples, but it will later be smoothed out by the blur pass.
	
	![SSAO texture](images/ssao_simple.png)
	_Visualization of the occlusion factor through the red channel_

	We zoom in on the cubes to see the effect and artifacts more clearly. We can see the occlusion between the two cubes, which is pretty nice.
	
	![SSAO texture cubes](images/ssao_cubes.png)
	_Zoom on the two cubes_

3. **Blur:** The blur pass smoothes the result of the SSAO pass. We can see that the artifacts are gone, and the occlusion factor is more uniform. 

	![Blurred SSAO texture](images/ssao_blurred.png)
	_SSAO with blur enabled_

	Zomming in again on the cubes, we can see the effect of the blur pass.

	![Blurred SSAO texture cubes](images/ssao_cubes_blurred.png)
	_Zoom on the two cubes with blur enabled_

Finally, we can try tweaking the parameters of the SSAO pass to see how they affect the result. We are rendering the SSAO blurred texture.

- **Radius:** Increasing the radius makes the occlusion factor more pronounced. Here, it is exagerated to show the effect. This also has the side-effect of having occlusion in weird places, like the top of the sphere, which is not occluded by anything. This is because the radius is too large and samples are taken from too far away.

![SSAO big radius](images/ssao_big_radius.png)
_SSAO with increased radius_

- **Bias:** Increasing the bias reduces the acne (which we don't have much of anyway), but also reduces the occlusion factor when it is too high.

![SSAO big bias](images/ssao_big_bias.png)
_SSAO with increased bias_

- **Intensity:** Increasing the intensity makes the occlusion factor more pronounced. Here, it is exagerated to show the effect.

![SSAO big intensity](images/ssao_big_intensity.png)
_SSAO with increased intensity_

Here is the final result with all the other shaders, with all the parameters set to default values that seemed appropriate.

![Final result with SSAO](images/ssao_final_enabled.png)
_Scene with SSAO_

![Final result without SSAO](images/ssao_final_disabled.png)
_Scene without SSAO for comparision_

### Particle Effects

#### Implementation

This implementation simulates dynamic fire particles using instanced, textured quads that evolve and fade over time. Each particle is rendered as a camera-facing billboard, with GPU rendering and CPU simulation. A fire emitter spawns and evolves over time, with configurable parameters for size, lifespan, emission rate, color options, speed, fire radius.

---

##### Pipeline Structure

  - A FireEmitter extends a general ParticleEmitter class.
  - A FireEmitter manages particle state: position, velocity, life, color, spawn radius, size.
  - On each frame:
    - Dead particles are culled.
    - New ones are spawned based on emissionRate.
    - Attributes are updated using remaining lifetime (RGB and alpha).
  - Results are exported into two arrays: positions (vec4: x, y, z, size) and colors (RGBA uint8).
  - A base quad (2D unit square) is instanced per particle.
  - Quads are billboarded in the vertex shader.
  - Alpha blending is enabled for additive effects this works well for flames and will benefit from bloom.
---

##### Design Choices

- CPU simulation: because it is simpler than compute shaders and sufficient for our use.

#### Validation

<div>
<video src="videos/fire.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the preceding video, we observe a basic fire simulation and a preview of all available parameters and how they influence the fire's behavior. Reducing the particle lifespan creates a flickering effect like fireworks. This happens because each particle is assigned a lifetime upon creation. When we shorten the lifespan, the color calculations based on `(life / maxLife)` can yield values greater than one, since `life` may exceed `maxLife`. It's not a major issue, as the effect normalizes quickly.

<div>
<video src="videos/fire_in_scene.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the preceding video we can see how the fire integrates to the main scene. Everything looks pretty well together. Trees are overly bright on top but that is not an issue of the fire and has been fixed since.

<div>
<video src="videos/fire_fog.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the preceding video we can see fog getting over the particles if there is a lot of fog (when we can see far withohitting the ground) This is a known issue and we don't really know how to fix it easily.

### Fog

#### Implementation

TODO

#### Validation

TODO


### L-Systems for Procedural Scene Generation

#### Implementation

TODO

#### Validation

TODO


### Bloom

#### Implementation

TODO

#### Validation

TODO


## Discussion

### Additional Components

TODO

### Failed Experiments

TODO

### Challenges

TODO


## Contributions

<table>
	<caption>Worked hours</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Week 1</th>
			<th>Week 2</th>
			<th>Week 3</th>
			<th>Week 4</th>
			<th>Week 5</th>
			<th>Week 6</th>
			<th>Week 7</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Alonso</td>
			<td>3h</td>
			<td style="background-color: #f0f0f0;">2h</td>
			<td>4h</td>
			<td>14h</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Charlie</td>
			<td>2h</td>
			<td style="background-color: #f0f0f0;">0h</td>
			<td>8h</td>
			<td>12h</td>
			<td>8h</td>
			<td>3h</td>
			<td>7h</td>
			<td>40h</td>
		</tr>
		<tr>
			<td>Marius</td>
			<td>2h</td>
			<td style="background-color: #f0f0f0;">0h</td>
			<td>2h</td>
			<td>9h30</td>
			<td>8h</td>
			<td>4h</td>
			<td>18h30</td>
			<td>44h</td>
		</tr>
	</tbody>
</table>

<table>
	<caption>Individual contributions</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Contribution</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Alonso</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Charlie</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Marius</td>
			<td>1/3</td>
		</tr>
	</tbody>
</table>


#### Comments

TODO


## References

#### Screen-Space Ambient Occlusion
- TODO <!--! todo  -->
#### Particle Effects
- [MographPlus (2017) *Tutorial No.62 : Rendering realistic Explosion and Smoke in Arnold for 3ds Max (Arnold Volume)*](https://www.youtube.com/watch?v=5k-8ltGNUXk)
- [OGLDEV (2025) Particle System Using The Compute Shader // Intermediate OpenGL Series](https://www.youtube.com/watch?v=pzAZ0xjWDv8)
- [OpenGL-Tutorial/Particles](https://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/)
- [LearnOpenGL/Particles](https://learnopengl.com/In-Practice/2D-Game/Particles)
- [Regl Example Gallery, instance-triangle.js](https://regl-project.github.io/regl/www/gallery.html)

#### Fog
- [OGLDEV (2022) *Mastering Fog Rendering in OpenGL: Adding Depth and Atmosphere to Your Graphics (part 2/2)*](https://youtu.be/BYbIs1C7rkM?feature=shared)
- [Legakis, J. (1998) *Fast Multi Layer Fog* (SIGGRAPH '98: ACM SIGGRAPH 98)](https://dl.acm.org/doi/pdf/10.1145/280953.282233)

#### L-Systems for Procedural Scene Generation
- [SimonDev (2020) *Procedural Plant Generation with L-Systems*](https://www.youtube.com/watch?v=feNVBEPXAcE)
- [P. Prusinkiewicz, M. Cieslak, P. Ferraro, J. Hanan (2018) *Modeling Plant Development with L-Systems*](https://algorithmicbotany.org/papers/modeling-plant-development-with-l-systems.pdf)

#### Bloom
- [Joey DeVries (2015) *Advanced Lighting: Bloom*](https://learnopengl.com/Advanced-Lighting/Bloom)
- [3Angle (2024) *WebGL Game Part 19 - Bloom Effect*](https://www.youtube.com/watch?v=SqvPzbvfZEs)
- [The Cherno (2021) *Bloom.*](https://www.youtube.com/watch?v=tI70-HIc5ro)
