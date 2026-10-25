import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {chapterAt, chapters, DURATION_IN_FRAMES, numberedChapters} from './timeline';

// Bundled in public/fonts (SIL OFL) so renders never wait on the network.
const fontFamily = 'JetBrains Mono';
for (const weight of ['400', '700']) {
  loadFont({family: fontFamily, url: staticFile(`fonts/jetbrains-mono-latin-${weight}-normal.woff2`), weight});
}

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// A faint red/cyan split and glow, so the HTML layer sits in the same
// glass as the WebGL picture underneath.
const glassText = '-1px 0 rgba(255,60,120,0.55), 1px 0 rgba(80,220,255,0.55), 0 0 12px rgba(255,255,255,0.35)';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&';

/** Deterministic text scramble that resolves left to right. */
const scramble = (text: string, progress: number, seed: number) => {
  if (progress >= 1) return text;
  return [...text]
    .map((ch, i) => {
      if (ch === ' ' || i / text.length < progress) return ch;
      const h = Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453);
      return GLYPHS[Math.floor((h % 1) * GLYPHS.length)];
    })
    .join('');
};

const pad = (n: number) => String(n).padStart(2, '0');

const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  return `TC ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frame % fps)}`;
};

/** CRT power-on: a few hard flickers, then steady. Pure function of frame. */
const powerOn = (frame: number, start: number) => {
  const f = frame - start;
  if (f < 0) return 0;
  if (f > 14) return 1;
  return [0.6, 0, 0.9, 0.2, 1, 0.4, 1, 0.8, 1, 1, 0.7, 1, 1, 1, 1][f];
};

const Corner: React.FC<{x: 'left' | 'right'; y: 'top' | 'bottom'}> = ({x, y}) => (
  <div
    style={{
      position: 'absolute',
      [x]: 44,
      [y]: 40,
      width: 26,
      height: 26,
      [`border${y === 'top' ? 'Top' : 'Bottom'}`]: '1.5px solid rgba(255,255,255,0.6)',
      [`border${x === 'left' ? 'Left' : 'Right'}`]: '1.5px solid rgba(255,255,255,0.6)',
    }}
  />
);

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const iris = chapters.find((c) => c.id === 'IRIS')!;
  const after = chapters.find((c) => c.id === 'AFTERIMAGE')!;
  // The HUD boots once the eye has opened and powers down with the last line.
  const visible =
    powerOn(frame, Math.round((iris.start + 0.75) * fps)) *
    interpolate(t, [after.start + 1.4, after.start + 1.9], [1, 0], clamp);

  const chapter = chapterAt(t);
  const index = numberedChapters.findIndex((c) => c.id === chapter.id);
  const next = numberedChapters[index + 1];
  const sinceCut = frame - Math.round(chapter.start * fps);
  const resolve = interpolate(sinceCut, [0, 16], [0, 1], clamp);

  const tagline = chapter.id === 'AFTERIMAGE' ? 'YOU MAY CLOSE THEM NOW' : 'PLEASE KEEP YOUR EYES OPEN';
  const taglineVisible =
    interpolate(t, [iris.start + 1.1, iris.start + 1.6, iris.start + 2.4, iris.start + 2.7], [0, 1, 1, 0], clamp) +
    interpolate(t, [after.start + 0.5, after.start + 0.9, after.start + 1.4, after.start + 1.8], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill
      name="HUD"
      style={{
        fontFamily,
        color: 'rgba(255,255,255,0.88)',
        textShadow: glassText,
        textTransform: 'uppercase',
        opacity: visible,
        pointerEvents: 'none',
      }}
    >
      <Corner x="left" y="top" />
      <Corner x="right" y="top" />
      <Corner x="left" y="bottom" />
      <Corner x="right" y="bottom" />

      <Interactive.Div name="Title block" style={{position: 'absolute', left: 84, top: 72, lineHeight: 1.35}}>
        <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '0.2em'}}>Phosphene</div>
        <div style={{fontSize: 15, letterSpacing: '0.24em', opacity: 0.6}}>Motion reel — vol. 01</div>
      </Interactive.Div>

      <Interactive.Div
        name="Chapter block"
        style={{position: 'absolute', right: 84, top: 72, lineHeight: 1.35, textAlign: 'right'}}
      >
        <div style={{fontSize: 15, letterSpacing: '0.24em', opacity: 0.6}}>
          {pad(index + 1)} / {pad(numberedChapters.length)}
        </div>
        <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '0.2em'}}>
          {scramble(chapter.id, resolve, index + 1)}
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Tagline"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 150,
          textAlign: 'center',
          fontSize: 20,
          letterSpacing: '0.62em',
          opacity: Math.min(taglineVisible, 1),
        }}
      >
        {tagline}
      </Interactive.Div>

      <Interactive.Div name="Timecode" style={{position: 'absolute', left: 84, bottom: 76, lineHeight: 1.5}}>
        <div style={{fontSize: 17, letterSpacing: '0.16em'}}>{timecode(frame, fps)}</div>
        <div style={{fontSize: 13, letterSpacing: '0.22em', opacity: 0.55}}>
          <span style={{color: '#ff4d7a', opacity: Math.floor(t * 2) % 2 === 0 ? 1 : 0.25}}>●</span> Rec · 60 fps ·
          1920×1080
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Next chapter"
        style={{position: 'absolute', right: 84, bottom: 76, lineHeight: 1.5, textAlign: 'right'}}
      >
        <div style={{fontSize: 13, letterSpacing: '0.22em', opacity: 0.55}}>{next ? 'Next' : 'End of reel'}</div>
        <div style={{fontSize: 17, fontWeight: 700, letterSpacing: '0.2em'}}>{next ? next.id : '— —'}</div>
      </Interactive.Div>

      <div style={{position: 'absolute', left: 84, right: 84, bottom: 52, height: 12}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 6, height: 1, background: 'rgba(255,255,255,0.22)'}} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 5,
            height: 3,
            width: `${interpolate(frame, [0, DURATION_IN_FRAMES - 1], [0, 100], {...clamp, easing: Easing.linear})}%`,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 10px rgba(255,255,255,0.7)',
          }}
        />
        {numberedChapters.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${(c.start / (DURATION_IN_FRAMES / fps)) * 100}%`,
              top: 0,
              width: 1,
              height: 12,
              background: 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
