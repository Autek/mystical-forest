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

TODO

#### Validation

TODO


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
In the above video, we observe a basic fire simulation and a preview of all available parameters and how they influence the fire's behavior. Reducing the particle lifespan creates a flickering effect like fireworks. This happens because each particle is assigned a lifetime upon creation. When we shorten the lifespan, the color calculations based on `(life / maxLife)` can yield values greater than one, since `life` may exceed `maxLife`. It's not a major issue, as the effect normalizes quickly.

<div style="display: flex; justify-content: center;">
<video src="videos/fire_in_scene.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the above video we can see how the fire integrates to the main scene. Everything looks pretty well together. Trees are overly bright on top but that is not an issue of the fire and has been fixed since.

<div style="display: flex; justify-content: center;">
<video src="videos/fire_fog.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the above video we can see fog getting over the particles if there is a lot of fog (when we can see far withohitting the ground) This is a known issue and we don't really know how to fix it easily.

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
In the pictures above, we see the fire integrated with the bloom effect. The flames appear more vivid and impactful. Bright particles contribute significantly to the glow, creating a more immersive look.

<div style="display: flex; justify-content: center;">
<video src="videos/bloom.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
In the vido above, we can clearly see the bloom effect being added to the seen and everything looks nice. We also see that the exposition and bloom threshold is working as expected. We have some weird lighting on trees but this does not come from bloom.

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
  <div><img src="images/bloom_pip1.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip2.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip3.png" height="210px" style="vertical-align: middle;"></div>
  <div><img src="images/bloom_pip4.png" height="210px" style="vertical-align: middle;"></div>
</div>
In the pictures above, we see the whole blooming pipeline. First the base image, then the thresholded image, then the blurred thresholded map andfinally the mix of the blurred and base image. (it is not the same image everywhere.)

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
