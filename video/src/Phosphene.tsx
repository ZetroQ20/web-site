import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Hud} from './Hud';
import {PostFx} from './PostFx';
import {ShaderPlane} from './ShaderPlane';

export const Phosphene: React.FC = () => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: '#07050b'}}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        // The shader writes linear colour; R3F's default sRGB output encodes
        // it for display. (Its `linear` flag would skip that and crush the
        // darks.)
        gl={{antialias: false, alpha: false, preserveDrawingBuffer: true}}
        flat
      >
        <ShaderPlane />
        <PostFx />
      </ThreeCanvas>
      <Hud />
    </AbsoluteFill>
  );
};
