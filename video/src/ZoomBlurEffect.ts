import {Effect, EffectAttribute} from 'postprocessing';
import {Uniform, Vector2} from 'three';

// Radial zoom blur: each pixel averages samples along the line towards the
// centre, as if the camera were rushing forwards during the exposure. The
// sample offsets are jittered per pixel to trade banding for fine noise.
const fragmentShader = /* glsl */ `
uniform float strength;
uniform vec2 center;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (strength <= 0.0) {
    outputColor = inputColor;
    return;
  }
  vec2 dir = uv - center;
  float jitter = fract(sin(dot(uv * resolution, vec2(12.9898, 78.233))) * 43758.5453);
  vec4 acc = vec4(0.0);
  float wsum = 0.0;
  for (int i = 0; i < 24; i++) {
    float s = (float(i) + jitter) / 24.0;
    float w = 1.0 - 0.55 * s;
    acc += texture2D(inputBuffer, uv - dir * strength * s) * w;
    wsum += w;
  }
  outputColor = acc / wsum;
}
`;

export class ZoomBlurEffect extends Effect {
  constructor() {
    super('ZoomBlurEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ['strength', new Uniform(0)],
        ['center', new Uniform(new Vector2(0.5, 0.5))],
      ]),
    });
  }

  set strength(value: number) {
    this.uniforms.get('strength')!.value = value;
  }
}
