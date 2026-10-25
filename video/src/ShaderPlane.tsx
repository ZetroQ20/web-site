import {useThree} from '@react-three/fiber';
import {useEffect, useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {GLSL3, RawShaderMaterial, Vector2, Vector3} from 'three';
import {phospheneShadertoy} from './shaders/phosphene.frag';

const vertexShader = /* glsl */ `
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// The Shadertoy-style source expects iResolution / iTime / iFrame and defines
// mainImage(). It writes linear HDR colour; the post chain tonemaps it.
const fragmentShader = /* glsl */ `
precision highp float;
precision highp int;
uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
out vec4 outColor;
${phospheneShadertoy}
void main() {
  mainImage(outColor, gl_FragCoord.xy);
}
`;

export const ShaderPlane: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gl = useThree((state) => state.gl);

  const material = useMemo(
    () =>
      new RawShaderMaterial({
        glslVersion: GLSL3,
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          iResolution: {value: new Vector3()},
          iTime: {value: 0},
          iFrame: {value: 0},
        },
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  const buffer = gl.getDrawingBufferSize(new Vector2());
  material.uniforms.iResolution.value.set(buffer.x, buffer.y, 1);
  material.uniforms.iTime.value = frame / fps;
  material.uniforms.iFrame.value = frame;

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};
