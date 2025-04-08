# Solution Description

Task 2.1: Implemented 1D Perlin noise by looking up gradients in hash table at neighboring grid points, evaluating their contributions, and interpolating smoothly using a blending polynomial.

Task 3.1: Implemented 1D fBm by summing multiple octaves of Perlin noise at increasing frequencies and decreasing amplitudes to create layered, natural-looking noise.

Task 4.1: Implemented 2D Perlin noise by looking up gradient of the cornering points and evaluating their contributions, and correctly interpolate from 4 points and 2 dimensions.

Task 4.2: Implemented 2D FBM, by using the new 2D Perlin Noise in the calculation. Otherwise it is the same as the 1D version.

Task 4.3: Implemented 2D Turbulence, just like the 2D FBM, by using the new 2D Perlin Noise as its base. Otherwise it is the same as the 1D version.

Task 5.1: We implemented the different textures by just applying the given interpolation functions to the noise value.

Task 6.2: We implemented the mesh by following the given formulaes for the vertices and faces, setting the height value to WATER_LEVEL if the noise value was below the water level and adjusting the normals. The shaders we done by copying over the work from lab GL2 and adding a few lines to set the color based on the noise value.


# Contributions

Marius Lhôte (346838): 1/3

Eva Mangano (345375): 1/3

Alonso Coaguila (339718): 1/3
