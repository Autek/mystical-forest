attribute vec2 quadVertex;
attribute vec4 positionSize;
attribute vec4 color;

uniform mat4 viewProjection;
uniform mat4 view;

varying vec2 vUV;
varying vec4 vColor;

void main() {
  vec3 center = positionSize.xyz;
  float size = positionSize.w;

  // Extract camera right and up vectors from view matrix
  vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
  vec3 up    = vec3(view[0][1], view[1][1], view[2][1]);

  // Compute screen-facing offset
  vec3 offset = quadVertex.x * right * size + quadVertex.y * up * size;
  vec4 worldPos = vec4(center + offset, 1.0);

  gl_Position = viewProjection * worldPos;

  vUV = quadVertex * 0.5 + 0.5;
  vColor = color;
}
