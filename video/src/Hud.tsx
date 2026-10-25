import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  chapterAt,
  chapters,
  DURATION_IN_FRAMES,
  HUD_TOTAL,
  hudLabels,
  labelStart,
} from "./timeline";

// Bundled in public/fonts (SIL OFL) so renders never wait on the network.
const fontFamily = "JetBrains Mono";
for (const weight of ["400", "700"]) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/jetbrains-mono-latin-${weight}-normal.woff2`),
    weight,
  });
}

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A faint red/cyan split and glow, so the HTML layer sits in the same
// glass as the WebGL picture underneath.
const glassText =
  "-1px 0 rgba(255,60,120,0.55), 1px 0 rgba(80,220,255,0.55), 0 0 12px rgba(255,255,255,0.35)";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&";

/** Deterministic text scramble that resolves left to right. */
const scramble = (text: string, progress: number, seed: number) => {
  if (progress >= 1) return text;
  return [...text]
    .map((ch, i) => {
      if (ch === " " || i / text.length < progress) return ch;
      const h = Math.abs(
        Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453,
      );
      return GLYPHS[Math.floor((h % 1) * GLYPHS.length)];
    })
    .join("");
};

/**
 * The tagline's last words never settle: a few glyphs keep glitching,
 * re-rolled every few frames (PLEASE KEEP YOUR 1\ Z +%S!).
 */
const glitchTail = (head: string, tail: string, frame: number) => {
  const tick = Math.floor(frame / 4);
  const glitched = [...tail]
    .map((ch, i) => {
      if (ch === " ") return ch;
      const h =
        Math.abs(Math.sin((i + 1) * 91.7 + tick * 12.9898) * 43758.5453) % 1;
      return h < 0.55 ? GLITCH[Math.floor(h * 1000) % GLITCH.length] : ch;
    })
    .join("");
  return `${head} ${glitched}`;
};

const GLITCH = "1\\Z+%S!/#7<>";

const pad = (n: number) => String(n).padStart(2, "0");

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

const Corner: React.FC<{ x: "left" | "right"; y: "top" | "bottom" }> = ({
  x,
  y,
}) => (
  <div
    style={{
      position: "absolute",
      [x]: 22,
      [y]: 22,
      width: 22,
      height: 22,
      [`border${y === "top" ? "Top" : "Bottom"}`]:
        "1.5px solid rgba(255,255,255,0.6)",
      [`border${x === "left" ? "Left" : "Right"}`]:
        "1.5px solid rgba(255,255,255,0.6)",
    }}
  />
);

/** Small registration ticks on the frame edges, as in the reference. */
const EdgeTicks: React.FC = () => {
  const tick = {
    position: "absolute",
    background: "rgba(255,255,255,0.35)",
  } as const;
  const groups = [0.28, 0.74];
  return (
    <>
      {groups.map((g) =>
        [0, 1, 2].map((i) => (
          <div
            key={`t${g}${i}`}
            style={{
              ...tick,
              top: 12,
              left: `calc(${g * 100}% + ${i * 9}px)`,
              width: 5,
              height: 3,
            }}
          />
        )),
      )}
      {groups.map((g) =>
        [0, 1, 2].map((i) => (
          <div
            key={`l${g}${i}`}
            style={{
              ...tick,
              left: 12,
              top: `calc(${(g - 0.02) * 100}% + ${i * 6}px)`,
              width: 12,
              height: 1.5,
            }}
          />
        )),
      )}
      {groups.map((g) =>
        [0, 1, 2].map((i) => (
          <div
            key={`r${g}${i}`}
            style={{
              ...tick,
              right: 12,
              top: `calc(${(g - 0.02) * 100}% + ${i * 6}px)`,
              width: 12,
              height: 1.5,
            }}
          />
        )),
      )}
    </>
  );
};

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const iris = chapters.find((c) => c.id === "IRIS")!;
  const back = chapters.find((c) => c.id === "RETURN")!;
  // The HUD boots once the eye has opened, and blinks out under the
  // white-out that takes us back to the eye.
  const visible =
    powerOn(frame, Math.round((iris.start + 0.95) * fps)) *
    interpolate(
      t,
      [
        back.start - 0.02,
        back.start + 0.04,
        back.start + 0.22,
        back.start + 0.3,
      ],
      [1, 0, 0, 1],
      clamp,
    );

  const label = chapterAt(t).label || hudLabels[0];
  const index = hudLabels.indexOf(label);
  const sinceCut = frame - Math.round(labelStart(label, t) * fps);
  const resolve = interpolate(sinceCut, [0, 16], [0, 1], clamp);

  const taglineVisible = interpolate(
    t,
    [iris.start + 1.15, iris.start + 1.4, iris.start + 2.6, iris.start + 2.85],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill
      name="HUD"
      style={{
        fontFamily,
        color: "rgba(255,255,255,0.86)",
        textShadow: glassText,
        textTransform: "uppercase",
        opacity: visible,
        pointerEvents: "none",
      }}
    >
      <Corner x="left" y="top" />
      <Corner x="right" y="top" />
      <EdgeTicks />
      <Corner x="left" y="bottom" />
      <Corner x="right" y="bottom" />

      <Interactive.Div
        name="Title block"
        style={{ position: "absolute", left: 40, top: 44, lineHeight: 1.45 }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.26em" }}>
          Phosphene
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.26em", opacity: 0.5 }}>
          Motion reel — MMXXVI
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Chapter block"
        style={{
          position: "absolute",
          right: 40,
          top: 44,
          lineHeight: 1.45,
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: "0.26em", opacity: 0.5 }}>
          {pad(index + 1)} / {pad(HUD_TOTAL)}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.26em" }}>
          {scramble(label, resolve, index + 1)}
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Tagline"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 96,
          textAlign: "center",
          fontSize: 15,
          letterSpacing: "0.6em",
          opacity: 0.55 * Math.min(taglineVisible, 1),
        }}
      >
        {glitchTail("PLEASE KEEP YOUR", "EYES OPEN", frame)}
      </Interactive.Div>

      <Interactive.Div
        name="Timecode"
        style={{ position: "absolute", left: 40, bottom: 40, lineHeight: 1.5 }}
      >
        <div style={{ fontSize: 12, letterSpacing: "0.2em", opacity: 0.7 }}>
          {timecode(frame, fps)}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.24em", opacity: 0.4 }}>
          <span
            style={{
              color: "#ff4d7a",
              opacity: Math.floor(t * 2) % 2 === 0 ? 1 : 0.25,
            }}
          >
            ●
          </span>{" "}
          Rec · 60 fps
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Next chapter"
        style={{
          position: "absolute",
          right: 40,
          bottom: 40,
          lineHeight: 1.5,
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.3em", opacity: 0.45 }}>
          ■ ■ ■
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.3em", opacity: 0.7 }}>
          Claude
        </div>
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 22,
          height: 12,
          opacity: 0.8,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 6,
            height: 1,
            background: "rgba(255,255,255,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 5,
            height: 3,
            width: `${interpolate(frame, [0, DURATION_IN_FRAMES - 1], [0, 100], { ...clamp, easing: Easing.linear })}%`,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 0 10px rgba(255,255,255,0.7)",
          }}
        />
        {chapters
          .filter((c, i) => c.label && c.label !== chapters[i - 1]?.label)
          .map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: `${(c.start / (DURATION_IN_FRAMES / fps)) * 100}%`,
                top: 0,
                width: 1,
                height: 12,
                background: "rgba(255,255,255,0.5)",
              }}
            />
          ))}
      </div>
    </AbsoluteFill>
  );
};
