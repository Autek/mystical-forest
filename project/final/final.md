---
title: Final Project Report CS-341 2025
---

# Mystical Forest

<div>
<video src="videos/demo_teaser.mp4" height="300px" autoplay loop></video>
</div>
<figcaption style="text-align: center;">A short teaser video, gif, or image showing an overview of the final result.</figcaption>

## Abstract

TODO


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

TODO


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

<div style="display: flex; justify-content: center;">
<video src="videos/fire.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
 <figcaption style="text-align: center;">fire particles isolated</figcaption>

In the above video, we observe a basic fire simulation and a preview of all available parameters and how they influence the fire's behavior. Reducing the particle lifespan creates a flickering effect like fireworks. This happens because each particle is assigned a lifetime upon creation. When we shorten the lifespan, the color calculations based on `(life / maxLife)` can yield values greater than one, since `life` may exceed `maxLife`. It's not a major issue, as the effect normalizes quickly.

<div style="display: flex; justify-content: center;">
<video src="videos/fire_in_scene.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
 <figcaption style="text-align: center;">fire particles in scene</figcaption>

In the above video we can see how the fire integrates to the main scene. Everything looks pretty well together. Trees are overly bright on top but that is not an issue of the fire and has been fixed since.

<div style="display: flex; justify-content: center;">
<video src="videos/fire_fog.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
 <figcaption style="text-align: center;">fire particles clashing with fog</figcaption>

In the above video we can see fog getting over the particles if there is a lot of fog (when we can see far withohitting the ground) This is a known issue and we don't really know how to fix it easily.

### Fog

#### Implementation

The fog is implemented through a shader. The fog has its own frame buffer where it loads one texture produced by one pair of fragment and vertex shaders.

In the shaders, we calculate the fog factor, which is a number between 0 and 1, where 0 represents full fog and 1 represents 0 no fog. To calculate, we use the distance of the vertex from the camera and the intensity of the fog tends towards 0 in a squared exponentially. 

Within the final mixer shader, the color of the fragement is mixed with the fog's gray color the fog factor that is extracted from the fog texture.

#### Validation

![image](images/foggers/low_height.png)
![image](images/foggers/mid_height.png)
![image](images/foggers/high_height.png)
In these images, the height of the fog varies. The difference between the fragments that are mixed with the fog texture and those that are not.
![image](images/foggers/low_opacity.png)
![image](images/foggers/high_opacity.png)
In these images, the oppacity of the fog varies. It can obscure as much as possible but also be as transparent as needed.


### L-Systems for Procedural Scene Generation

#### Implementation

The trees are procedurally generated with Lindenmayer Systems, otherwise known as L-Systems. By predetermining an alphabet from which we can produces axioms that can be recursively developped through predetermine rules, tree can be "grown" from a string. To generate the trees in the scene, we chose a random spot away from the campfire and randomly choose a predetermined starting axiom. From there, the rules of system are applied a random amount of times.

##### Defining the L-System
L-Systems are defined as a tuple $G = (V, \omega, P)$, where $V$ is the alphabet, $\omega$ is the starting axiom and $P$ is the set of production rules. The L-System $L$ that was defined to describe the tree has a randomly chosen starting axiom, an alphabet of $V = \{L, B, X, Y, Z, [,]\}$ and one production rule $P = \{B \rightarrow L[XB][YB][ZB][B]\}$.
The functions that represent the rules and their recursive application are defined in `l_system.js`, which are called within the scene to generate the string defining the tree. 

##### Generating Meshes
To generate the tree, meshes have to be made, which are defined in `tree_systems.js`. The meshes for the branches are polygonal based prisms and the meshes for the leaves are two triangular faces at a right angle.
To be able to correctly place all the meshes, functions that rotate and transform the meshes were also defined making the code clearer. 
To optimize the number of objects, a function that would merge meshes into one mesh was made.

##### Generating the Tree
To generate the trees mesh, the final string must be parsed, therefore the alphabet must map to some action. The alphabet is parsed as:

- $\{L, B\}$ : They represent a branch and the difference between the two is the branch represented by B could continue to grow if the production rule is applied.
- $\{X, Y, Z\}$ : They represent a rotation from the base branch that they come from. The difference of the three symbols is the exact angle that the next branch will take.
- $\{[,]\}$ : They represent a sub tree that would have a smaller base size and represent a new state from which new branches can come from.

Leaves would be randomly placed on the upper half of branches.

Using these rules, the string would be parsed and the corresponding branches and leaves would be generated and placed. To correctly be able to come back to an old position, a stack of the previous positions and rotations done would be kept.

After generating a list of branch meshes and a seperate list of the leaf meshes they would both be merged into two collective meshes that would be added to scene with the `wood` material and the `leaf` material.

#### Validation

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
  <div><img src="images/l_system/0_step.png" height="190px" style="vertical-align: middle;"></div>
  <div><img src="images/l_system/1_step.png" height="190px" style="vertical-align: middle;"></div>
  <div><img src="images/l_system/2_step.png" height="190px" style="vertical-align: middle;"></div>
  <div><img src="images/l_system/3_step.png" height="190px" style="vertical-align: middle;"></div>
  <div><img src="images/l_system/4_step.png" height="190px" style="vertical-align: middle;"></div>
</div>
 <figcaption style="text-align: center;">Different levels of depth (0, 1, 2, 3, 4) </figcaption>

 In the following images you can see the progression and "growth" of a tree, the initial axiom in these image is simply `B`. From the single character we can progress to the first step by applying the production rule `B -> L[XB][YB][ZB][B]`.
 Also the leaves, are randomly placed in the upper half of a given branch. Since the leaves are generated at each instance, 
 this generated small differences in each instance of a tree, even if they are generated from the same axiom and have the same depth. 

### Bloom

#### Implementation

This implementation includes a bloom effect. Bloom is computed by first thresholding the bright values of the screen and storing them in a separate texture. This texture is then blurred using a Gaussian kernel multiple times to create a soft glow. Finally, the blurred texture is additively blended back with the original image to produce the final effect.

To enhance the visual quality and prevent overly bright areas from burning out, we also implement tone mapping. This step compresses high dynamic range values into a displayable range, ensuring a more natural and balanced appearance.

---

##### Bloom Integration

- Bloom is applied as a post-processing step after rendering the scene.
- It captures bright fragments (typically from fire particles) and blurs them across neighboring pixels.
- This creates a glowing aura that enhances the perceived brightness and softness of the fire.
- Combined with alpha blending, bloom adds volume and visual depth to the flames.

---

##### Design Choices

- A simple threshold-based bloom implementation is used to keep performance reasonable.
- We use a Gaussian blurring kernel to get a better render than with a box kernel.
- We downsample the thresholded texture to get better performances without losing much quality.
- We use and exponential tone mapping with an exposition parameter to allow for customization.

#### Validation

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/not_bloom.png" height="210px" style="vertical-align: middle;">
</div>
<div>
<img src="images/bloom.png" height="210px" style="vertical-align: middle;">
</div>
</div>
 <figcaption style="text-align: center;">bloom isolated</figcaption>
In the pictures above, we see the fire integrated with the bloom effect. The flames appear more vivid and impactful. Bright particles contribute significantly to the glow, creating a more immersive look.

<div style="display: flex; justify-content: center;">
<video src="videos/bloom.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
 <figcaption style="text-align: center;">bloom in scene</figcaption>
In the vido above, we can clearly see the bloom effect being added to the seen and everything looks nice. We also see that the exposition and bloom threshold is working as expected. We have some weird lighting on trees but this does not come from bloom.

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
  <div><img src="images/bloom_pip1.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip2.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip3.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip4.png" height="210px" style="vertical-align: middle;"></div>
</div>
 <figcaption style="text-align: center;">bloom pipeline</figcaption>
In the pictures above, we see the whole blooming pipeline. First the base image, then the thresholded image, then the blurred thresholded map andfinally the mix of the blurred and base image. (it is not the same image everywhere.)

## Discussion

### Additional Components

As a small additional component, we implemented HDR rendering with tone mapping to bring values back into the [0,1][0,1] range.
The equation we used is:

$$
\mathbf{1} - \exp(-\text{hdrColor} \cdot \text{exposure})
$$

This introduces an exposure parameter, which is very useful for achieving a cinematic look. It's not strictly required for bloom, but it greatly improves the result—without it, the image tends to appear overexposed, with all bloomed pixels turning completely white.

### Failed Experiments

No components failed during our implementation.

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
			<td>4h</td>
			<td>7h</td>
			<td>15h</td>
			<td>49h</td>
		</tr>
		<tr>
			<td>Charlie</td>
			<td>2h</td>
			<td style="background-color: #f0f0f0;">0h</td>
			<td>8h</td>
			<td>12h</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
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
- [Joey DeVries (2015) *Advanced Lighting: SSAO*](https://learnopengl.com/Advanced-Lighting/SSAO)
- [Arijit Nandi (2023) *Depth-Only Screen Space Ambient Occlusion (SSAO) for Forward Renderers*](https://medium.com/better-programming/depth-only-ssao-for-forward-renderers-1a3dcfa1873a)
- [Bavoil, L. Sainz, M (2008) *Screen Space Ambient Occlusion*](https://www.researchgate.net/publication/228576448_Screen_Space_Ambient_Occlusion)

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
