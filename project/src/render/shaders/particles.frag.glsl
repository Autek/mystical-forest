precision mediump float;


varying vec2 vUV;
varying vec4 vColor;

void main() {
  // Create a circular particle with soft edges
  float distanceFromCenter = length(vUV - vec2(0.5, 0.5)) * 2.0;
  float alpha = smoothstep(1.0, 0.0, distanceFromCenter) * vColor.a;
  gl_FragColor = vec4(vColor.rgb, 0.);
}
