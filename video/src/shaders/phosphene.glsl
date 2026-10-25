// PHOSPHENE — motion reel (10 s cut).
// One full-screen fragment shader, Shadertoy style (iTime in seconds).
// It writes linear HDR colour; bloom, chromatic aberration, vignette and the
// ACES tonemap happen in the post chain (src/PostFx.tsx).
//
// Chapter start times T_* are prepended by scripts/build-shader.mjs from
// src/timeline.json, so the HUD and the picture share one timeline.
//
//   SIGNAL   two dim dashes on a near-black maroon screen
//   IRIS     they ignite into a line that opens into an almond eye wrapped in
//            fine contours; the eye glances around, then the pupil dilates
//            to show chains of tiny eyes inside it
//   PUPIL    the camera dives into that pupil
//   ECHO     a log-polar tunnel built from rings of small eyes around an orb
//   VORTEX   a log-spiral checkerboard that keeps tearing into rays
//   MERCURY  a white-out, then a raymarched iridescent chrome blob

#define DEBUG_MODE 0 // 0 final, 1 chapter id colours

// ---- Art controls -----------------------------------------------------------
const float EYE_HALF_WIDTH = 1.03;  // eye tip-to-centre distance (screen height = 2)
const float EYE_HALF_HEIGHT = 0.46; // fully open lid height
const float IRIS_RADIUS = 0.445;
const float PUPIL_RATIO = 0.36;     // pupil radius / iris radius before it dilates
const float CONTOURS = 22.0;        // fine lines around the eye
const float EXPOSURE = 1.0;
const float GRAIN = 0.03;           // a whisper of film grain to stop banding
const float FLASH = 2.4;            // white flash strength at hard cuts

float px; // one pixel in uv units, set in mainImage

vec3 hex(float r, float g, float b) { return srgbToLinear(vec3(r, g, b) / 255.0); }

float easeOutCubic(float x) {
    x = 1.0 - clamp(x, 0.0, 1.0);
    return 1.0 - x * x * x;
}

float easeInOut(float x) { return smoothstep(0.0, 1.0, x); }

// 1 inside [a, b], with smooth ramps of width f on both ends.
float window(float t, float a, float b, float f) {
    return smoothstep(a - f, a + f, t) * (1.0 - smoothstep(b - f, b + f, t));
}

// HDR stroke: an antialiased core of half-width w plus an exponential halo.
float stroke(float d, float w, float halo, float pix) {
    float core = 1.0 - smoothstep(w, w + 1.5 * pix, abs(d));
    return core + 0.4 * exp(-abs(d) / halo);
}

vec3 rainbow(float t) {
    return srgbToLinear(clamp(cosinePalette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67)), 0.0, 1.0));
}

// Rose / butter / mint / sky: the VORTEX palette, rich but not neon.
vec3 reelPalette(float t) {
    return srgbToLinear(clamp(cosinePalette(t, vec3(0.62, 0.55, 0.62), vec3(0.38, 0.38, 0.34), vec3(1.0), vec3(0.85, 0.15, 0.45)), 0.0, 1.0));
}

vec3 maroonBackground(vec2 uv) {
    float r = length(uv * vec2(0.62, 1.0));
    return mix(hex(30.0, 13.0, 24.0), hex(9.0, 4.0, 8.0), smoothstep(0.0, 1.5, r));
}

// Almond eye with its tips on the x axis. sdVesica points along y, so the
// axes are swapped: r - d is the half height, r^2 - d^2 the squared half width.
float sdEyeShape(vec2 p, float halfW, float halfH) {
    halfH = max(halfH, 0.0005);
    float r = 0.5 * (halfW * halfW / halfH + halfH);
    return sdVesica(p.yx, r, r - halfH);
}

// ---- SIGNAL -------------------------------------------------------------------

vec3 signalScene(vec2 uv, float t) {
    vec3 col = maroonBackground(uv);
    float ax = abs(uv.x);
    float dx = max(max(0.075 - ax, ax - 0.235), 0.0);
    float d = length(vec2(dx, uv.y));
    col += hex(236.0, 222.0, 210.0) * 0.5 * stroke(d, 0.0014, 0.005, px);
    return col;
}

// ---- IRIS / PUPIL -------------------------------------------------------------

// Lid opening: a slit that holds for half a second, then snaps open.
float eyeOpen(float lt) {
    float slit = mix(0.02, 0.07, smoothstep(0.0, 0.5, lt));
    return slit + (1.0 - slit) * easeOutCubic((lt - 0.5) / 0.38);
}

// Where the eye looks: quick saccades between a few fixations, plus tremor.
vec2 gaze(float t) {
    vec2 g = vec2(0.0);
    g += vec2(-0.045, 0.014) * smoothstep(2.55, 2.63, t);
    g += vec2(0.08, -0.024) * smoothstep(3.05, 3.13, t);
    g += vec2(-0.05, 0.006) * smoothstep(3.55, 3.63, t);
    g += vec2(0.015, 0.004) * smoothstep(3.95, 4.05, t);
    g += 0.0025 * vec2(sin(t * 23.0), sin(t * 17.0 + 1.0));
    return g;
}

// Horizontal light spill when the line ignites.
vec3 ignitionStreaks(vec2 uv, float amount) {
    float ax = abs(uv.x);
    vec3 col = hex(255.0, 238.0, 225.0) * 2.0 * exp(-abs(uv.y) / 0.0035) * exp(-ax * 0.5);
    for (int i = 1; i <= 12; i++) {
        float fi = float(i);
        float y = 0.032 * pow(fi, 1.3);
        float h = hash11(fi * 7.31);
        float line = exp(-abs(abs(uv.y) - y) / (0.0016 + 0.0016 * h)) * (0.5 + 0.5 * sin(uv.x * (3.0 + 4.0 * h) + fi));
        col += mix(hex(200.0, 70.0, 110.0), hex(90.0, 120.0, 200.0), h) * 0.45 * exp(-fi * 0.15) * line;
    }
    col += hex(120.0, 30.0, 70.0) * 0.25 * exp(-abs(uv.y) / 0.2);
    return col * amount;
}

// Cream at the lid, through teal and gold, to copper, red and maroon.
vec3 contourColor(float k, float cool) {
    vec3 c;
    if (k < 0.12) c = mix(hex(236.0, 222.0, 206.0), hex(90.0, 190.0, 178.0), k / 0.12);
    else if (k < 0.26) c = mix(hex(90.0, 190.0, 178.0), hex(222.0, 176.0, 116.0), (k - 0.12) / 0.14);
    else if (k < 0.42) c = mix(hex(222.0, 176.0, 116.0), hex(204.0, 104.0, 66.0), (k - 0.26) / 0.16);
    else if (k < 0.62) c = mix(hex(204.0, 104.0, 66.0), hex(166.0, 40.0, 66.0), (k - 0.42) / 0.2);
    else c = mix(hex(166.0, 40.0, 66.0), hex(70.0, 16.0, 40.0), (k - 0.62) / 0.38);
    // During the dive the inner lines warm up and the teal ones brighten.
    return mix(c, mix(c, hex(110.0, 214.0, 200.0), step(0.5, fract(k * 7.0))), cool * (1.0 - k) * 0.6);
}

vec3 eyeContours(vec2 p, float open, float lt, float cool, float pix) {
    vec3 col = vec3(0.0);
    for (int i = 1; i <= int(CONTOURS); i++) {
        float fi = float(i);
        float k = fi / CONTOURS;
        float breathe = 1.0 + 0.006 * sin(lt * 1.7 + fi * 0.9);
        // Lines bunch up near the lid and spread outwards; the tips run off
        // screen before the tops do, so every contour stays an almond.
        float sx = (1.0 + 1.5 * pow(k, 1.3)) * breathe;
        float sy = (1.0 + 2.1 * pow(k, 1.45)) * breathe;
        float d = sdEyeShape(p, EYE_HALF_WIDTH * sx, EYE_HALF_HEIGHT * sy * open);
        float gain = mix(0.7, 0.22, k) * (1.0 + 0.9 * cool);
        col += contourColor(k, cool) * gain * stroke(d, 0.0011, 0.004, pix);
    }
    return col;
}

// One ring of the pupil's ornament, in cell coordinates c (x tangential,
// y radial, both in [-0.5, 0.5]): two strands that cross at the cell edges,
// and a small eye sitting in the loop between them.
vec3 chainCell(vec2 c, float pc, float odd) {
    float amp = 0.24 * cos(PI * c.x);
    float s1 = abs(c.y - amp) / 1.15;
    float s2 = abs(c.y + amp) / 1.15;
    float eye = sdEyeShape(c, 0.27, 0.12);
    float iris = sdCircle(c, 0.055);

    vec3 strand = mix(hex(196.0, 46.0, 76.0), hex(222.0, 170.0, 104.0), odd);
    vec3 col = strand * 1.1 * (stroke(s1, 0.014, 0.02, pc) + stroke(s2, 0.014, 0.02, pc));
    col = mix(col, hex(52.0, 22.0, 36.0), 1.0 - smoothstep(-pc, pc, eye));
    col += mix(hex(226.0, 190.0, 120.0), hex(120.0, 206.0, 196.0), odd) * 1.2 * stroke(eye, 0.012, 0.018, pc);
    col = mix(col, hex(100.0, 200.0, 210.0) * 1.3, 1.0 - smoothstep(-pc, pc, iris));
    return col;
}

// q is in pupil units (|q| = 1 at the pupil edge). Rings of chains in
// log-radius, so the ornament is self-similar and the dive never runs out.
vec3 pupilOrnament(vec2 q, float t, float pix) {
    const float N = 14.0;
    const float H = 0.36;
    float r = max(length(q), 1e-4);
    float a = atan(q.y, q.x);
    float u = log(r) / H - max(t - 4.45, 0.0) * 1.6;
    float ring = floor(u);
    float odd = mod(ring, 2.0);
    float sa = a / TAU * N + 0.5 * odd + t * 0.05 * (odd * 2.0 - 1.0);
    float fa = sa - floor(sa + 0.5);
    vec2 c = vec2(fa * TAU / (N * H), fract(u) - 0.5);
    float pc = pix / (r * H);

    vec3 col = mix(hex(86.0, 30.0, 44.0), hex(66.0, 22.0, 38.0), odd);
    col += chainCell(c, pc, odd);

    // Glossy dark sphere in the middle swallows the rings that would alias.
    float core = 0.3;
    col *= smoothstep(core * 0.8, core * 1.25, r);
    float z = sqrt(max(1.0 - (r / core) * (r / core), 0.0));
    vec3 sphere = hex(70.0, 40.0, 80.0) * (0.4 + 0.8 * z) + hex(255.0, 240.0, 255.0) * 1.4 * pow(max(dot(normalize(vec3(q / core, z + 1e-4)), normalize(vec3(-0.4, 0.5, 0.8))), 0.0), 30.0);
    col = mix(col, sphere, 1.0 - smoothstep(core - pix * 2.0, core, r));
    return col;
}

// q is in iris units (|q| = 1 at the limbus).
vec3 irisColor(vec2 q, float t, float pupilR, float ornament, float pix, out float mask) {
    float r = length(q);
    vec2 dir = q / max(r, 1e-5);
    float a = atan(q.y, q.x + 1e-6);

    // Band edges wander a little so peach, teal and lavender bleed together.
    float wob = fbm(vec3(dir * 4.0, r * 2.0 + 7.0), 3, 2.0, 0.5);
    float rr = r + 0.05 * wob;
    vec3 peachIn = hex(246.0, 178.0, 126.0);
    vec3 peach = hex(255.0, 220.0, 190.0);
    vec3 teal = hex(176.0, 236.0, 230.0);
    vec3 lav = hex(206.0, 160.0, 232.0);
    vec3 plum = hex(136.0, 76.0, 178.0);
    vec3 col = mix(peachIn, peach, smoothstep(pupilR, pupilR + 0.12, rr));
    col = mix(col, teal, smoothstep(0.56, 0.64, rr));
    col = mix(col, lav, smoothstep(0.8, 0.87, rr));
    col = mix(col, plum, smoothstep(0.93, 1.0, rr));

    // Fibres: fine hairlines that all swirl the same way (the strand phase
    // grows with angle and radius), dark lines over lighter streaks, faded
    // out where they would get finer than a couple of pixels.
    float warp = 0.5 * fbm(vec3(dir * 3.0, r * 2.0), 2, 2.0, 0.5);
    float s1 = a * 120.0 / TAU + r * 34.0 + warp * 3.0;
    float s2 = a * 47.0 / TAU + r * 13.3 + warp * 1.2 + 0.3;
    float foot1 = (120.0 / TAU / max(r, 0.2) + 34.0) * pix;
    float foot2 = (47.0 / TAU / max(r, 0.2) + 13.3) * pix;
    float along = fbm(vec3(dir * 18.0, r * 3.0 + s1 * 0.05), 2, 2.0, 0.5);
    float hair1 = pow(abs(sin(PI * s1)), 6.0) * (1.0 - smoothstep(0.18, 0.45, foot1)) * (0.6 + 0.6 * along);
    float hair2 = pow(abs(sin(PI * s2)), 4.0) * (1.0 - smoothstep(0.18, 0.45, foot2));
    col = mix(col, col * 1.3 + 0.04, 0.7 * hair2);
    col *= 1.0 - 0.6 * hair1 * smoothstep(PUPIL_RATIO * 0.9, PUPIL_RATIO + 0.1, r);

    // Two dark wavy rings, like a collarette.
    float w1 = abs(r - 0.9 - 0.014 * sin(a * 9.0 + 1.0)) - 0.004;
    float w2 = abs(r - 0.7 - 0.012 * sin(a * 11.0 - 2.0)) - 0.003;
    col = mix(col, hex(90.0, 50.0, 130.0), 0.4 * (1.0 - smoothstep(0.0, 2.0 * pix, w1)));
    col = mix(col, hex(90.0, 70.0, 130.0), 0.18 * (1.0 - smoothstep(0.0, 2.0 * pix, w2)));

    // Soft shading: a touch darker towards the limbus, rose rim at the edge.
    col *= mix(1.0, 0.72, smoothstep(0.7, 1.0, r));
    col *= 1.05;
    col += hex(200.0, 70.0, 140.0) * 0.9 * exp(-abs(r - 0.995) / 0.008);

    float pd = r - pupilR;
    vec3 pupil = mix(hex(92.0, 44.0, 50.0), hex(56.0, 22.0, 30.0), smoothstep(0.0, pupilR, r));
    if (ornament > 0.0) pupil = mix(pupil, pupilOrnament(q / pupilR, t, pix / pupilR), ornament);
    col = mix(col, pupil, 1.0 - smoothstep(-pix * 1.5, pix * 1.5, pd));
    col *= 1.0 - 0.35 * exp(-max(pd, 0.0) / 0.02) * step(0.0, pd);

    // Catchlights: a ring up-left and a dot down-right, both on the cornea;
    // the camera passes through the cornea early in the dive.
    float glint = 1.0 - smoothstep(4.55, 4.75, t);
    float ring = abs(length(q - vec2(-0.45, 0.45)) - 0.165) - 0.006;
    col += hex(255.0, 255.0, 255.0) * 2.4 * glint * (1.0 - smoothstep(0.0, 1.5 * pix, ring));
    col += hex(255.0, 255.0, 255.0) * 0.35 * glint * exp(-max(ring, 0.0) / 0.03);
    float dot1 = length(q - vec2(0.48, -0.38)) - 0.028;
    col += hex(255.0, 255.0, 255.0) * 2.0 * glint * (1.0 - smoothstep(-pix, pix * 2.0, dot1));

    mask = 1.0 - smoothstep(1.0 - pix, 1.0 + pix, r);
    return col;
}

// Camera dive into the pupil: still, then an accelerating push that keeps
// creeping once the ornament fills the frame.
float diveZoom(float t) {
    float x = t - 4.45;
    if (x <= 0.0) return 1.0;
    if (x <= 0.55) return exp(4.6 * pow(x, 1.7));
    return exp(1.67 + 0.35 * (x - 0.55));
}

vec3 eyeScene(vec2 uv, float t) {
    float lt = t - T_IRIS;
    float open = eyeOpen(lt);
    float zoom = diveZoom(t);
    vec2 g = gaze(t);
    // The dive aims at the pupil, wherever the eye is looking.
    vec2 p = uv / zoom + g * smoothstep(4.45, 4.9, t);
    float pix = px / zoom;
    float cool = smoothstep(3.9, 4.5, t);

    float lid = sdEyeShape(p, EYE_HALF_WIDTH, EYE_HALF_HEIGHT * open);

    vec3 col = maroonBackground(uv);
    col += hex(120.0, 30.0, 60.0) * 0.18 * exp(-max(lid, 0.0) / 0.35) * smoothstep(0.03, 0.4, open);
    // Contours spring out of the line ahead of the lid, as flat lenses.
    float contourOpen = mix(0.02, 0.24, smoothstep(0.0, 0.25, lt)) + 0.76 * (open - 0.07) / 0.93 * step(0.07, open);
    col += eyeContours(p, max(contourOpen, open), lt, cool, pix);
    col += ignitionStreaks(uv, (1.0 - smoothstep(0.35, 1.0, lt)) * smoothstep(0.0, 0.04, lt));

    float inside = 1.0 - smoothstep(-pix, pix, lid);
    vec2 ip = p - g;
    float il = length(ip) / IRIS_RADIUS;
    vec3 interior = mix(hex(30.0, 26.0, 54.0), hex(12.0, 10.0, 26.0), smoothstep(0.1, 1.0, abs(p.x)));
    interior += hex(80.0, 72.0, 116.0) * 0.6 * exp(-max(il - 1.0, 0.0) * 2.5);
    interior += hex(50.0, 160.0, 180.0) * 0.7 * exp(-max(il - 1.0, 0.0) * 12.0);

    float ornament = smoothstep(3.95, 4.3, t);
    float pupilR = mix(PUPIL_RATIO, 0.44, smoothstep(3.95, 4.35, t)) * (1.0 + 0.03 * sin(t * 2.3));
    float irisMask;
    vec3 iris = irisColor(ip / IRIS_RADIUS, t, pupilR, ornament, pix / IRIS_RADIUS, irisMask);
    interior = mix(interior, iris, irisMask);
    // The lid casts a soft shadow over the top of the iris.
    interior *= mix(0.65, 1.0, smoothstep(0.0, 0.08, -lid));

    col = mix(col, interior, inside);
    col += hex(238.0, 224.0, 208.0) * 1.5 * stroke(lid, 0.0028, 0.012, pix);
    return col;
}

// ---- ECHO ---------------------------------------------------------------------

// The pearl orb at the heart of ECHO and VORTEX, with a darker crescent.
vec3 orb(vec2 uv, float radius, float t) {
    float r = length(uv);
    float d = r - radius;
    float z = sqrt(max(1.0 - (r / radius) * (r / radius), 0.0));
    vec3 film = rainbow(z * 1.2 + atan(uv.y, uv.x + 1e-6) / TAU + t * 0.25);
    vec3 inner = hex(250.0, 244.0, 255.0) * (1.4 + 1.4 * z) + film * 1.8 * pow(1.0 - z, 2.0);
    float crescent = sdCircle(uv - vec2(radius * 0.2, radius * 0.14), radius * 0.64);
    inner *= mix(0.45, 1.0, smoothstep(-0.015, 0.025, crescent));
    vec3 col = inner * (1.0 - smoothstep(-px, px, d));
    col += hex(255.0, 250.0, 255.0) * 2.0 * exp(-abs(d) / 0.01);
    col += hex(220.0, 200.0, 255.0) * 0.9 * exp(-max(d, 0.0) / 0.1);
    return col;
}

// A sparkling halo ring: bright core, beaded with small glints.
vec3 haloRing(vec2 uv, float radius, float width, vec3 tint, float beads, float t) {
    float r = length(uv);
    float a = atan(uv.y, uv.x + 1e-6);
    float sparkle = 0.65 + 0.35 * sin(a * beads + t * 4.0) * sin(a * beads * 0.37 - t * 2.3);
    return tint * sparkle * (exp(-abs(r - radius) / width) * 1.8 + exp(-abs(r - radius) / (width * 6.0)) * 0.35);
}

vec3 echoScene(vec2 uv, float t) {
    const float N = 16.0;
    const float H = TAU / (N * 1.6); // cells 1.6x wider than tall
    float lt = t - T_ECHO;
    float r = max(length(uv), 1e-4);
    float a = atan(uv.y, uv.x);
    float u = log(r) / H - lt * 1.8;
    float ring = floor(u);
    float odd = mod(ring, 2.0);
    float sa = a / TAU * N + 0.5 * odd + lt * 0.12 * (odd * 2.0 - 1.0);
    float cell = floor(sa + 0.5);
    vec2 c = vec2((sa - cell) * 1.6, fract(u) - 0.5);
    float pc = px / (r * H);

    // Outlines are teal/sky; a band of rose eyes spreads as the shot runs.
    float h = hash12(vec2(mod(cell, N), ring + 1000.0));
    float redShare = mix(0.12, 0.5, smoothstep(1.2, 1.9, lt));
    vec3 outline = h < redShare ? hex(214.0, 70.0, 96.0) : mix(hex(70.0, 160.0, 220.0), hex(140.0, 226.0, 220.0), h);
    float eye = sdEyeShape(c, 0.66, 0.31);
    float iris = sdCircle(c, 0.17);
    float corner = sdCircle(vec2(0.8 - abs(c.x), 0.5 - abs(c.y)), 0.07);

    vec3 col = mix(hex(8.0, 10.0, 26.0), hex(20.0, 26.0, 60.0), smoothstep(1.5, 0.0, r));
    col += hex(220.0, 60.0, 140.0) * 0.8 * (1.0 - smoothstep(-pc, pc, corner));
    col = mix(col, mix(hex(20.0, 50.0, 100.0), hex(46.0, 100.0, 160.0), 0.5 + 0.5 * c.y), 1.0 - smoothstep(-pc, pc, eye));
    col = mix(col, mix(hex(220.0, 60.0, 150.0) * 1.2, hex(250.0, 236.0, 250.0) * 1.8, smoothstep(0.17, 0.0, length(c))),
              1.0 - smoothstep(-pc, pc, iris));
    col += outline * 1.5 * stroke(eye, 0.026, 0.06, pc);

    col *= smoothstep(0.03, 0.26, r);

    // Rings around the orb; the outer one flushes rose, then iridescent.
    vec3 ringTint = mix(hex(200.0, 236.0, 240.0), hex(236.0, 90.0, 170.0), window(lt, 0.6, 0.95, 0.12));
    ringTint = mix(ringTint, rainbow(atan(uv.y, uv.x) / TAU + lt), smoothstep(1.8, 2.1, lt) * 0.6);
    col += haloRing(uv, 0.33 + 0.02 * sin(lt * 3.0), 0.011, ringTint, 40.0, lt);
    col += haloRing(uv, 0.21, 0.007, hex(120.0, 210.0, 230.0), 24.0, -lt);
    col += hex(180.0, 190.0, 240.0) * 0.6 * exp(-r / 0.3);
    col += orb(uv, 0.12, t);
    return col;
}

// ---- VORTEX -------------------------------------------------------------------

vec3 checkerboard(vec2 uv, float lt) {
    float r = max(length(uv), 1e-4);
    float v = atan(uv.y, uv.x) / TAU;
    float lr = log(r);
    // Integer multiples of v keep both families seamless across the atan cut.
    float s1 = lr * 2.6 + v * 6.0 - lt * 2.2;
    float s2 = v * 24.0 - lr * 1.2 + lt * 0.4;
    float g1 = length(vec2(2.6, 6.0 / TAU)) / r;
    float g2 = length(vec2(1.2, 24.0 / TAU)) / r;
    float m = sin(PI * s1) * sin(PI * s2);
    float check = 0.5 + 0.5 * clamp(m / (PI * (g1 + g2) * px * 0.6), -1.0, 1.0);
    vec3 col = mix(hex(10.0, 8.0, 22.0), reelPalette(v * 2.0 + lr * 0.12 - lt * 0.45) * 1.15, check);
    return col * (0.8 + 0.3 * smoothstep(1.6, 0.25, r));
}

vec3 rays(vec2 uv, float lt, float violet) {
    const float N = 36.0;
    float r = max(length(uv), 1e-4);
    float v = atan(uv.y, uv.x) / TAU;
    float sv = v * N + lt * 1.1;
    float id = floor(sv);
    float f = fract(sv);
    float soft = clamp(px * N / (TAU * r) * 1.5, 0.02, 0.2) + violet * 0.15;
    float ray = smoothstep(0.12 - soft, 0.12 + soft, f) * (1.0 - smoothstep(0.7 - soft, 0.7 + soft, f));
    vec3 c = reelPalette(id / N * 3.0 + lt * 0.35);
    if (mod(id, 6.0) == 0.0) c = hex(240.0, 232.0, 245.0);
    c = mix(c, mix(hex(200.0, 100.0, 230.0), hex(120.0, 100.0, 220.0), fract(id * 0.5)), violet);
    return mix(hex(12.0, 9.0, 26.0), c * 1.15 * (0.8 + 0.4 * exp(-r * 0.7)), ray);
}

vec3 vortexScene(vec2 uv, float t) {
    float lt = t - T_VORTEX;
    // The checkerboard keeps tearing into rays and snapping back.
    float rayMix = smoothstep(7.6, 7.72, t) * (1.0 - smoothstep(8.55, 8.66, t)) + smoothstep(8.85, 8.95, t);
    float violet = smoothstep(8.9, 9.1, t);
    vec3 col = mix(checkerboard(uv, lt), rays(uv, lt, violet), rayMix);

    float r = length(uv);
    float beads = window(t, 8.6, 8.88, 0.04);
    vec3 ringTint = mix(hex(246.0, 240.0, 250.0), hex(236.0, 100.0, 180.0), beads);
    col += haloRing(uv, 0.34 + 0.03 * sin(lt * 2.0), 0.014, ringTint, 56.0, lt) * (0.4 + 0.6 * rayMix + beads);
    col += hex(210.0, 200.0, 240.0) * 0.7 * exp(-r / 0.35);
    col += orb(uv, 0.15, t);
    return col;
}

// ---- MERCURY ------------------------------------------------------------------

float gMercuryTime;

vec2 map(vec3 p) {
    float t = gMercuryTime;
    p.xz = rot2(t * 0.55) * p.xz;
    p.xy = rot2(0.25 + 0.18 * sin(t * 0.8)) * p.xy;
    // Squash x so the figure reads wider and heavier, as in the reference.
    p.x *= 0.8;
    vec3 tp = domTwist(p, 0.55);

    float d = sdSphere(tp - vec3(0.08 + 0.07 * sin(t * 1.3), 0.78, 0.0), 0.3);
    d = smin(d, sdTorus((tp - vec3(-0.1, 0.26 + 0.05 * sin(t * 1.1), 0.0)).xzy, vec2(0.34, 0.17)), 0.26);
    d = smin(d, sdSphere(tp - vec3(0.13, -0.28 + 0.06 * sin(t * 0.9 + 1.0), 0.08), 0.4), 0.3);
    d = smin(d, sdSphere(tp - vec3(-0.05, -0.84, 0.0), 0.29 + 0.025 * sin(t * 1.7)), 0.26);
    d += 0.012 * sin(9.0 * p.y + t * 3.0) * sin(7.0 * p.x - t * 2.0);
    // Twist and ripples push the gradient above 1; the march uses stepScale < 1.
    return vec2(d * 0.8, 1.0);
}

vec3 studio(vec3 rd) {
    vec3 col = hex(30.0, 26.0, 60.0);
    col += hex(255.0, 255.0, 255.0) * 2.6 * smoothstep(0.5, 0.85, rd.y);
    col += hex(230.0, 140.0, 200.0) * 1.2 * exp(-abs(rd.y) * 6.0);
    col += hex(140.0, 210.0, 240.0) * 1.6 * exp(-length(rd.xy - vec2(-0.75, 0.2)) * 5.0);
    col += hex(255.0, 255.0, 255.0) * 2.0 * exp(-length(rd.xy - vec2(0.7, -0.1)) * 7.0);
    return col;
}

vec3 mercuryScene(vec2 uv, float t) {
    gMercuryTime = t - T_MERCURY + 2.0;

    float r = length(uv);
    vec3 col = mix(hex(26.0, 24.0, 60.0), hex(8.0, 7.0, 20.0), smoothstep(0.0, 1.8, r));
    col += hex(90.0, 80.0, 170.0) * 0.3 * (0.5 + 0.5 * cos(r * 20.0 - gMercuryTime * 3.0)) * exp(-r * 0.6);

    vec3 ro = vec3(0.0, 0.0, 3.4);
    vec3 rd = normalize(vec3(uv, -2.55));
    vec3 hit = raymarch(ro, rd, 1.0, 6.0, 0.7);

    // Closest approach of the ray to the blob, for the rose halo.
    float md = 1e3;
    float tt = 1.0;
    for (int i = 0; i < 40; i++) {
        float d = map(ro + rd * tt).x;
        md = min(md, d);
        tt += max(d, 0.04);
        if (tt > 6.0) break;
    }
    col += hex(230.0, 70.0, 140.0) * 0.9 * exp(-md * 18.0);

    if (hit.x > 0.0) {
        vec3 p = ro + rd * hit.x;
        vec3 n = calcNormal(p, 0.0005 * hit.x);
        float ndv = clamp(dot(n, -rd), 0.0, 1.0);
        vec3 film = rainbow(ndv * 1.8 + n.y * 0.4 + gMercuryTime * 0.15);
        vec3 refl = reflect(rd, n);
        vec3 surf = film * (0.7 + 0.7 * studio(refl)) + studio(refl) * 0.3;
        surf += vec3(6.0) * pow(max(dot(refl, normalize(vec3(0.5, 0.8, 0.6))), 0.0), 40.0);
        surf += hex(230.0, 60.0, 120.0) * 1.6 * pow(1.0 - ndv, 3.0);
        col = surf;
    }
    return col;
}

// ---- Timeline -------------------------------------------------------------------

vec3 chapter(int id, vec2 uv, float t) {
    if (id == 0) return signalScene(uv, t);
    if (id <= 2) return eyeScene(uv, t); // IRIS and PUPIL are one continuous shot
    if (id == 3) return echoScene(uv, t);
    if (id == 4) return vortexScene(uv, t);
    return mercuryScene(uv, t);
}

float chapterStart(int id) {
    if (id == 0) return T_SIGNAL;
    if (id == 1) return T_IRIS;
    if (id == 2) return T_PUPIL;
    if (id == 3) return T_ECHO;
    if (id == 4) return T_VORTEX;
    return T_MERCURY;
}

// Crossfade into chapter id, in seconds (0 = hard cut or continuous shot).
float chapterFade(int id) {
    if (id == 1) return 0.05;
    if (id == 3) return 0.22;
    if (id == 4) return 0.12;
    return 0.0;
}

// Flashes: the line igniting, the blur out of the pupil, the cut into the
// vortex, and the long white-out that opens MERCURY.
float flash(float t, vec2 uv) {
    float f = 0.5 * exp(-pow((t - T_IRIS) / 0.04, 2.0));
    f += 0.9 * exp(-pow((t - (T_ECHO - 0.05)) / 0.09, 2.0));
    f += 0.5 * exp(-pow((t - T_VORTEX) / 0.04, 2.0));
    float whiteout = smoothstep(T_MERCURY - 0.06, T_MERCURY, t) * (1.0 - smoothstep(T_MERCURY + 0.12, T_MERCURY + 0.26, t));
    return f * (0.4 + 0.6 * exp(-length(uv) * 1.2)) + 2.2 * whiteout;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    px = 2.0 / iResolution.y;
    float t = min(iTime, T_END);

    int id = 0;
    for (int i = 1; i < 6; i++) {
        if (t >= chapterStart(i)) id = i;
    }

    vec3 col = chapter(id, uv, t);
    float fade = chapterFade(id);
    float into = t - chapterStart(id);
    if (fade > 0.0 && into < fade) {
        col = mix(chapter(id - 1, uv, t), col, easeInOut(into / fade));
    }
    col *= EXPOSURE;
    col += hex(255.0, 240.0, 245.0) * FLASH * flash(t, uv);

#if DEBUG_MODE == 1
    col = rainbow(float(id) / 6.0);
#endif

    col = max(col, 0.0);
    float n = hash13(vec3(floor(fragCoord), float(iFrame))) * 2.0 - 1.0;
    col = filmGrain(col, GRAIN, n) + 0.002 * n;
    fragColor = vec4(max(col, 0.0), 1.0);
}
