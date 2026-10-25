import {Composition} from 'remotion';
import {Phosphene} from './Phosphene';
import {DURATION_IN_FRAMES, FPS} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Phosphene"
      component={Phosphene}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
