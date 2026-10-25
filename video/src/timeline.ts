import timeline from './timeline.json';

export type ChapterId = (typeof timeline.chapters)[number]['id'];
export type Chapter = (typeof timeline.chapters)[number];

export const FPS = timeline.fps;
export const DURATION_IN_FRAMES = Math.round(timeline.durationInSeconds * timeline.fps);
export const chapters = timeline.chapters;
/** The reel has seven chapters; this cut ends inside the fifth. */
export const HUD_TOTAL = timeline.hudTotal;

/** Chapters that carry the HUD counter (the SIGNAL intro does not). */
export const numberedChapters = chapters.filter((c) => c.hud);

export const chapterAt = (t: number): Chapter =>
  [...chapters].reverse().find((c) => t >= c.start) ?? chapters[0];

/** Seconds to the nearest chapter boundary (cuts are where the glass smears). */
const distanceToCut = (t: number) =>
  Math.min(...chapters.slice(1).map((c) => Math.abs(t - c.start)));

/** Chromatic aberration offset: a steady base that spikes around each cut. */
export const aberrationAt = (t: number) => {
  const spike = Math.exp(-((distanceToCut(t) / 0.12) ** 2));
  return 0.0009 + 0.0065 * spike;
};
