import timeline from './timeline.json';

export type ChapterId = (typeof timeline.chapters)[number]['id'];
export type Chapter = (typeof timeline.chapters)[number];

export const FPS = timeline.fps;
export const DURATION_IN_FRAMES = Math.round(timeline.durationInSeconds * timeline.fps);
export const chapters = timeline.chapters;
/** The reel has seven chapters; this cut loops back to the first. */
export const HUD_TOTAL = timeline.hudTotal;

/**
 * HUD chapters, in order. Several shader chapters share one HUD label
 * (PUPIL is still IRIS; ECHO and VORTEX are both FUNNEL; RETURN is IRIS
 * again, so the counter loops back to 01).
 */
export const hudLabels = [...new Set(chapters.map((c) => c.label).filter(Boolean))];

export const chapterAt = (t: number): Chapter =>
  [...chapters].reverse().find((c) => t >= c.start) ?? chapters[0];

/** When the HUD label shown at time t last appeared (re-scrambles on RETURN). */
export const labelStart = (label: string, t = Infinity) =>
  [...chapters].reverse().find((c, i, rev) => c.label === label && c.start <= t && rev[i + 1]?.label !== label)?.start ??
  chapters.find((c) => c.label === label)?.start ??
  0;

/** Seconds to the nearest chapter boundary (cuts are where the glass smears). */
const distanceToCut = (t: number) =>
  Math.min(...chapters.slice(1).map((c) => Math.abs(t - c.start)));

/** Chromatic aberration offset: a steady base that spikes around each cut. */
export const aberrationAt = (t: number) => {
  const spike = Math.exp(-((distanceToCut(t) / 0.12) ** 2));
  return 0.0009 + 0.0065 * spike;
};

/** Radial zoom-blur strength: the dive, the funnel and its tears. */
export const zoomBlurAt = (t: number) => {
  const keys = timeline.zoomBlur;
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const x = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
      return v0 + (v1 - v0) * x * x * (3 - 2 * x);
    }
  }
  return 0;
};
