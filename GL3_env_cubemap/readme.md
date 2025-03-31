# Solution Description

GL3.1.1: We implemented the texture of the square tabletop using the `texture2D` method to get the texture color. We then extracted its RGB components and used it to set the color of the fragment. 

GL3.1.2: We wrapped the texture to have it repeat four times along both sides of the square, and changed the texture coordinates of the floor mesh to reduce the size of the tile.

GL3.2.1: We constructed the projection matrix for the cube map using the `mat4.perspective`method. The `fovy` was set to 90deg to cover every faces of the cube, and the aspect ratio is 1.0 since cube has square faces.

GL3.2.2: In this task, we simply constructed the up vector for each of the faces of the cube map.

GL3.2.3: We code the reflection shaders. Starting off in the vertex shader which reuses the same code in the GL2 lab to calculate the normals and direction vectors. The vectors are passed on to the fragment shader where the reflected direction vector is calculated. Using said reflected view vector, we sample the cube map and pass the color.

GL3.3.*: We implemented Phong lighting with shadows and attenuation. The fragment position in camera space was used to compute light and view directions. Light intensity was scaled by inverse squared distance. Shadows were handled using a cube shadow map with a bias to reduce shadow acne. Ambient, diffuse, and specular terms were combined only if the fragment was lit. Blending was enabled in SysRenderMeshesWithLight::init_pipeline to support additive multiple lights.

# Contributions

Marius Lhôte (346838): 1/3

Eva Mangano (345375): 1/3

Alonso Coaguila (339718): 1/3
