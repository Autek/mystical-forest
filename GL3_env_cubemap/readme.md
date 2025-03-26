# Solution Description

GL3.3: We implemented Phong lighting with shadows and attenuation. The fragment position in camera space was used to compute light and view directions. Light intensity was scaled by inverse squared distance. Shadows were handled using a cube shadow map with a bias to reduce shadow acne. Ambient, diffuse, and specular terms were combined only if the fragment was lit. Blending was enabled in SysRenderMeshesWithLight::init_pipeline to support additive multiple lights.

# Contributions

Marius Lhôte (346838): 1/3

Name2 Surname2 (000002): 1/3

Name3 Surname3 (000003): 1/3
