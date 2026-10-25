import {useFrame, useThree} from '@react-three/fiber';
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';
import {useEffect, useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {HalfFloatType} from 'three';
import {aberrationAt} from './timeline';

// Built imperatively rather than with @react-three/postprocessing: that
// wrapper assembles its passes in effects, after Remotion's one-shot
// advance() for a rendered frame, so stills came out empty. Creating the
// composer synchronously means it is ready on the very first advance.
//
// Every parameter is a pure function of the frame, so renders are
// deterministic. Grain lives in the shader for the same reason (the
// postprocessing Noise effect accumulates wall-clock time).
export const PostFx: React.FC = () => {
  const {gl, scene, camera, size} = useThree();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const {composer, aberration} = useMemo(() => {
    const composer = new EffectComposer(gl, {frameBufferType: HalfFloatType, multisampling: 0});
    const bloom = new BloomEffect({
      mipmapBlur: true,
      intensity: 0.95,
      luminanceThreshold: 0.75,
      luminanceSmoothing: 0.3,
      radius: 0.72,
    });
    const aberration = new ChromaticAberrationEffect({radialModulation: true, modulationOffset: 0.12});
    const vignette = new VignetteEffect({offset: 0.32, darkness: 0.42});
    const toneMapping = new ToneMappingEffect({mode: ToneMappingMode.ACES_FILMIC});
    composer.addPass(new RenderPass(scene, camera));
    // Chromatic aberration samples its input, so it needs its own pass.
    composer.addPass(new EffectPass(camera, bloom));
    composer.addPass(new EffectPass(camera, aberration, vignette, toneMapping));
    return {composer, aberration};
  }, [gl, scene, camera]);

  useEffect(() => () => composer.dispose(), [composer]);
  composer.setSize(size.width, size.height);

  const amount = aberrationAt(frame / fps);
  aberration.offset.set(amount, amount * 0.35);

  // Priority 1 replaces R3F's default render with the composer. This only
  // draws; nothing here animates, so timing stays on useCurrentFrame().
  useFrame(() => composer.render(), 1);

  return null;
};
