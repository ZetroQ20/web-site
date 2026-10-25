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
        gl={{antialias: false, alpha: false, preserveDrawingBuffer: true}}
        flat
        linear
      >
        <ShaderPlane />
        <PostFx />
      </ThreeCanvas>
      <Hud />
    </AbsoluteFill>
  );
};
