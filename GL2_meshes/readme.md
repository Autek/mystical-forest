# Solution Description

GL2.1: To solve this task, we first computed the normal vectors for all triangles using the cross product of two edges and stored them in tri_normals. Then, we computed the opening angles at each vertex and stored the corresponding weights in angle_weights. Using these weights, we accumulated and normalized vertex normals.

GL2.2: To solve this task, we first computed the model-view-projection matrix mat_mvp in mesh_render.js and declared a varying variable for the normal in both shaders. In the vertex shader, we set this variable, and in the fragment shader, we used it to render a false-color representation as normal * 0.5 + 0.5. Then, we computed the normals-to-view matrix and applied it to the normals in the vertex shader to ensure correct transformation.

GL2.3: To solve this task, we first computed the position and normal vectors using the model-view and normals-to-view matrices. Then we computed the light and view directions, with the view direction pointing towards the camera. Then we obtained the ambiant, diffuse and specular components as usual and used them to get the color. That color is passed to the fragment shader via the `varying` keyword.


# Contributions

Lhôte Marius (346838): 1/3

Eva Mangano (345375): 1/3

Alonso Coaguila (339718): 1/3
