// PHOSPHENE — motion reel (10 s cut).
// One full-screen fragment shader, Shadertoy style (iTime in seconds).
// It writes linear HDR colour; bloom, chromatic aberration, vignette and the
// ACES tonemap happen in the post chain (src/PostFx.tsx).
//
// Chapter start times T_* are prepended by scripts/build-shader.mjs from
// src/timeline.json, so the HUD and the picture share one timeline.
//
//   SIGNAL   two dim dashes on a plum screen
//   IRIS     they ignite into a line that opens into an almond eye wrapped in
//            neon contours; the pupil dilates into a mandala
//   PUPIL    the camera dives into the mandala
//   ECHO     a log-polar tunnel built from rings of small eyes around an orb
//   VORTEX   a rainbow log-spiral checkerboard that keeps tearing into rays
//   MERCURY  a white-out, then a raymarched iridescent chrome blob

#define DEBUG_MODE 0 // 0 final, 1 chapter id colours

// ---- Art controls -----------------------------------------------------------
const float EYE_HALF_WIDTH = 1.0;   // eye tip-to-centre distance (screen height = 2)
const float EYE_HALF_HEIGHT = 0.38; // fully open lid height
const float IRIS_RADIUS = 0.355;
const float PUPIL_RATIO = 0.3;      // pupil radius / iris radius before it dilates
const float CONTOURS = 16.0;        // neon lines around the eye
const float EXPOSURE = 0.9;
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

// Hot pink / yellow / green / cyan, the palette of the VORTEX checkerboard.
vec3 neonPalette(float t) {
    return srgbToLinear(clamp(cosinePalette(t, vec3(0.6, 0.5, 0.6), vec3(0.5, 0.5, 0.45), vec3(1.0), vec3(0.85, 0.15, 0.45)), 0.0, 1.0));
}

vec3 plumBackground(vec2 uv) {
    float r = length(uv * vec2(0.62, 1.0));
    return mix(hex(84.0, 62.0, 104.0), hex(30.0, 22.0, 42.0), smoothstep(0.0, 1.6, r));
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
    vec3 col = plumBackground(uv);
    float ax = abs(uv.x);
    float dx = max(max(0.075 - ax, ax - 0.235), 0.0);
    float d = length(vec2(dx, uv.y));
    col += hex(240.0, 232.0, 255.0) * 0.55 * stroke(d, 0.0016, 0.006, px);
    return col;
}

// ---- IRIS / PUPIL -------------------------------------------------------------

// Lid opening: a slit that holds for half a second (iris colours flicker
// through it), then snaps open.
float eyeOpen(float lt) {
    float slit = mix(0.02, 0.07, smoothstep(0.0, 0.5, lt));
    return slit + (1.0 - slit) * easeOutCubic((lt - 0.5) / 0.38);
}

// Horizontal light spill when the line ignites.
vec3 ignitionStreaks(vec2 uv, float amount) {
    float ax = abs(uv.x);
    vec3 col = hex(255.0, 236.0, 250.0) * 2.4 * exp(-abs(uv.y) / 0.004) * exp(-ax * 0.45);
    for (int i = 1; i <= 16; i++) {
        float fi = float(i);
        float y = 0.034 * pow(fi, 1.3);
        float h = hash11(fi * 7.31);
        float line = exp(-abs(abs(uv.y) - y) / (0.002 + 0.002 * h)) * (0.5 + 0.5 * sin(uv.x * (3.0 + 4.0 * h) + fi));
        col += mix(hex(200.0, 110.0, 255.0), hex(70.0, 110.0, 255.0), h) * 0.9 * exp(-fi * 0.12) * line;
    }
    col += hex(150.0, 70.0, 220.0) * 0.6 * exp(-abs(uv.y) / 0.25);
    return col * amount;
}

vec3 eyeContours(vec2 p, float open, float lt, float pix) {
    // Warm pinks first, cooling to gold / orange / cyan as the shot holds.
    float shift = smoothstep(1.6, 2.6, lt);
    vec3 c1 = hex(255.0, 244.0, 240.0);
    vec3 c2 = mix(hex(255.0, 150.0, 190.0), hex(255.0, 205.0, 120.0), shift);
    vec3 c3 = mix(hex(255.0, 60.0, 160.0), hex(255.0, 120.0, 60.0), shift);
    vec3 c4 = mix(hex(170.0, 60.0, 255.0), hex(70.0, 220.0, 255.0), shift);
    vec3 col = vec3(0.0);
    for (int i = 1; i <= int(CONTOURS); i++) {
        float fi = float(i);
        float k = fi / CONTOURS;
        float breathe = 1.0 + 0.012 * sin(lt * 1.7 + fi * 0.9);
        // Lines bunch up near the lid and spread outwards; the tips run off
        // screen before the tops do, so every contour stays an almond.
        float sx = (1.0 + 1.9 * pow(k, 1.15)) * breathe;
        float sy = (1.0 + 2.3 * pow(k, 1.35)) * breathe;
        float d = sdEyeShape(p, EYE_HALF_WIDTH * sx, EYE_HALF_HEIGHT * sy * open);
        vec3 c = k < 0.33 ? mix(c1, c2, k / 0.33) : (k < 0.66 ? mix(c2, c3, (k - 0.33) / 0.33) : mix(c3, c4, (k - 0.66) / 0.34));
        if (i % 4 == 2) c = mix(c, hex(130.0, 255.0, 225.0), 0.4 + 0.4 * shift);
        col += c * 3.0 * exp(-k * 1.4) * stroke(d, 0.0016 + 0.0045 * k, 0.009, pix);
    }
    return col;
}

// q is in pupil units (|q| = 1 at the pupil edge). Rings of petals in
// log-radius, so the pattern is self-similar and can flow outwards forever.
vec3 mandala(vec2 q, float t, float pix) {
    const float N = 12.0;
    const float H = 0.42;
    float r = max(length(q), 1e-4);
    float a = atan(q.y, q.x);
    float u = log(r) / H - t * 0.9;
    float ring = floor(u);
    float odd = mod(ring, 2.0);
    float sa = a / TAU * N + 0.5 * odd;
    float fa = sa - floor(sa + 0.5);
    vec2 c = vec2(fa * TAU / (N * H), fract(u) - 0.5);
    float pc = pix / (r * H);

    float petal = sdVesica(c, 0.62, 0.42);
    float seed = sdVesica(c, 0.34, 0.27);
    float eyeDot = sdCircle(c - vec2(0.0, -0.02), 0.035);

    vec3 base = mix(hex(170.0, 12.0, 60.0), hex(120.0, 10.0, 90.0), odd);
    vec3 fill = mix(hex(255.0, 50.0, 40.0), hex(255.0, 40.0, 140.0), odd) * (1.3 + 0.6 * (0.5 - c.y));
    vec3 col = mix(base, fill, 1.0 - smoothstep(-pc, pc, petal));
    col += hex(255.0, 130.0, 190.0) * 2.4 * stroke(petal, 0.012, 0.03, pc);
    col = mix(col, mix(hex(255.0, 236.0, 140.0), hex(255.0, 200.0, 120.0), odd) * 3.6, 1.0 - smoothstep(-pc, pc, seed));
    col = mix(col, hex(200.0, 30.0, 40.0), 1.0 - smoothstep(-pc, pc, eyeDot));

    // Tiny rings near the centre alias; let the orb swallow them.
    col *= smoothstep(0.015, 0.2, r);
    col += hex(220.0, 230.0, 255.0) * 5.0 * exp(-r / 0.06);
    col += hex(90.0, 130.0, 255.0) * 2.0 * exp(-abs(r - 0.13) / 0.015);
    return col;
}

// q is in iris units (|q| = 1 at the limbus).
vec3 irisColor(vec2 q, float t, float pupilR, float mandalaMix, float swirl, float pix, out float mask) {
    float r = length(q);
    vec2 dir = q / max(r, 1e-5);
    float a = atan(q.y, q.x + 1e-6);
    float fib = fbm(vec3(dir * 9.0, r * 2.5 - t * 0.2), 4, 2.0, 0.5);
    float fib2 = fbm(vec3(dir * 26.0, r * 4.0 + 3.0), 3, 2.0, 0.5);

    // Blown-out white, with fibres only where it falls off near the limbus.
    vec3 col = hex(255.0, 250.0, 250.0) * 5.0;
    col *= mix(1.0, 0.65 + 0.6 * fib2, smoothstep(0.55, 0.95, r));
    float strand = smoothstep(0.1, 0.4, fib) * smoothstep(0.7, 0.98, r);
    col = mix(col, hex(150.0, 110.0, 230.0) * 2.0, strand * 0.55);

    // Limbus: blue on one side, magenta on the other; later a cyan swirl.
    float side = 0.5 + 0.5 * dir.x;
    vec3 limbCol = mix(hex(60.0, 120.0, 255.0), hex(230.0, 60.0, 230.0), side) * 3.0;
    float sw = fbm(vec3(dir * 3.0, r * 6.0 + a * 0.5 - t * 1.5), 3, 2.0, 0.5);
    vec3 swirlCol = mix(hex(40.0, 140.0, 255.0), hex(160.0, 240.0, 255.0), 0.5 + 0.5 * sw) * 3.2;
    limbCol = mix(limbCol, swirlCol, swirl);
    float limb = smoothstep(mix(0.86, 0.62, swirl), 1.0, r);
    col = mix(col, limbCol, limb * mix(1.0, 0.6 + 0.4 * smoothstep(-0.2, 0.3, sw), swirl));

    float pd = r - pupilR;
    vec3 pupil = mix(hex(255.0, 96.0, 64.0) * 1.8, hex(215.0, 40.0, 30.0) * 1.2, smoothstep(0.0, pupilR, r));
    if (mandalaMix > 0.0) pupil = mix(pupil, mandala(q / pupilR, t, pix / pupilR), mandalaMix);
    col = mix(col, pupil, 1.0 - smoothstep(-pix, pix, pd));
    col += hex(255.0, 140.0, 120.0) * 1.2 * exp(-abs(pd) / 0.03);

    mask = 1.0 - smoothstep(1.0 - pix, 1.0 + pix, r);
    return col;
}

// Camera dive into the pupil: still, then an accelerating push that keeps
// creeping once the mandala fills the frame.
float diveZoom(float t) {
    float x = t - 4.45;
    if (x <= 0.0) return 1.0;
    if (x <= 0.55) return exp(4.95 * pow(x, 1.7));
    return exp(1.79 + 0.35 * (x - 0.55));
}

vec3 eyeScene(vec2 uv, float t) {
    float lt = t - T_IRIS;
    float open = eyeOpen(lt);
    float zoom = diveZoom(t);
    vec2 p = uv / zoom;
    float pix = px / zoom;

    float lid = sdEyeShape(p, EYE_HALF_WIDTH, EYE_HALF_HEIGHT * open);

    // Outside the lid: lit plum, a magenta haze hugging the eye, the contours.
    vec3 col = plumBackground(uv);
    col += hex(210.0, 60.0, 200.0) * 1.3 * exp(-max(lid, 0.0) / 0.42) * smoothstep(0.03, 0.4, open);
    // Contours spring out of the line ahead of the lid, as flat lenses.
    float contourOpen = mix(0.02, 0.24, smoothstep(0.0, 0.25, lt)) + 0.76 * (open - 0.07) / 0.93 * step(0.07, open);
    col += eyeContours(p, max(contourOpen, open), lt, pix);
    col += ignitionStreaks(uv, (1.0 - smoothstep(0.35, 1.0, lt)) * smoothstep(0.0, 0.04, lt));

    float inside = 1.0 - smoothstep(-pix, pix, lid);
    vec3 interior = hex(112.0, 98.0, 150.0) + hex(140.0, 100.0, 255.0) * 0.6 * exp(-length(p) / 0.3);

    // The pupil dilates as the mandala blooms inside it.
    float bloomIn = smoothstep(3.9, 4.35, t);
    float pupilR = mix(PUPIL_RATIO, 0.56, smoothstep(4.05, 4.5, t));
    float swirl = smoothstep(4.2, 4.6, t);
    float irisMask;
    vec3 iris = irisColor(p / IRIS_RADIUS, t, pupilR, bloomIn, swirl, pix / IRIS_RADIUS, irisMask);
    float halo = exp(-max(length(p) / IRIS_RADIUS - 1.0, 0.0) * 6.0);
    interior += mix(hex(80.0, 120.0, 255.0), hex(220.0, 70.0, 255.0), 0.5 + 0.5 * p.x / IRIS_RADIUS) * 1.4 * halo;
    interior = mix(interior, iris, irisMask);

    col = mix(col, interior, inside);
    col += hex(255.0, 240.0, 248.0) * 4.0 * stroke(lid, 0.006, 0.022, pix);
    return col;
}

// ---- ECHO ---------------------------------------------------------------------

// The glass orb at the heart of ECHO and VORTEX, with a darker crescent.
vec3 orb(vec2 uv, float radius, float t) {
    float r = length(uv);
    float d = r - radius;
    float z = sqrt(max(1.0 - (r / radius) * (r / radius), 0.0));
    vec3 film = rainbow(z * 1.2 + atan(uv.y, uv.x + 1e-6) / TAU + t * 0.25);
    vec3 inner = hex(255.0, 250.0, 255.0) * (2.0 + 2.0 * z) + film * 3.0 * pow(1.0 - z, 2.0);
    float crescent = sdCircle(uv - vec2(radius * 0.2, radius * 0.14), radius * 0.64);
    inner *= mix(0.45, 1.0, smoothstep(-0.015, 0.025, crescent));
    vec3 col = inner * (1.0 - smoothstep(-px, px, d));
    col += hex(255.0, 255.0, 255.0) * 3.0 * exp(-abs(d) / 0.012);
    col += hex(230.0, 210.0, 255.0) * 1.8 * exp(-max(d, 0.0) / 0.12);
    return col;
}

// A sparkling halo ring: bright core, beaded with small glints.
vec3 haloRing(vec2 uv, float radius, float width, vec3 tint, float beads, float t) {
    float r = length(uv);
    float a = atan(uv.y, uv.x + 1e-6);
    float sparkle = 0.65 + 0.35 * sin(a * beads + t * 4.0) * sin(a * beads * 0.37 - t * 2.3);
    return tint * sparkle * (exp(-abs(r - radius) / width) * 2.4 + exp(-abs(r - radius) / (width * 6.0)) * 0.5);
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

    // Outlines are blue/cyan; a band of red eyes spreads as the shot runs.
    float h = hash12(vec2(mod(cell, N), ring + 1000.0));
    float redShare = mix(0.12, 0.55, smoothstep(1.2, 1.9, lt));
    vec3 outline = h < redShare ? hex(255.0, 60.0, 90.0) : mix(hex(50.0, 150.0, 255.0), hex(130.0, 245.0, 255.0), h);
    float eye = sdEyeShape(c, 0.66, 0.31);
    float iris = sdCircle(c, 0.17);
    float corner = sdCircle(vec2(0.8 - abs(c.x), 0.5 - abs(c.y)), 0.075);

    vec3 col = mix(hex(16.0, 26.0, 70.0), hex(40.0, 56.0, 130.0), smoothstep(1.5, 0.0, r));
    col += hex(255.0, 50.0, 170.0) * 1.6 * (1.0 - smoothstep(-pc, pc, corner));
    col = mix(col, mix(hex(30.0, 110.0, 220.0), hex(90.0, 190.0, 255.0), 0.5 + 0.5 * c.y), 1.0 - smoothstep(-pc, pc, eye));
    col = mix(col, mix(hex(255.0, 40.0, 170.0) * 2.0, hex(255.0, 240.0, 255.0) * 3.0, smoothstep(0.17, 0.0, length(c))),
              1.0 - smoothstep(-pc, pc, iris));
    col += outline * 2.6 * stroke(eye, 0.03, 0.08, pc);

    col *= smoothstep(0.03, 0.26, r);

    // Rings around the orb; the outer one flushes pink, then rainbow.
    vec3 ringTint = mix(hex(200.0, 240.0, 255.0), hex(255.0, 70.0, 190.0), window(lt, 0.6, 0.95, 0.12));
    ringTint = mix(ringTint, rainbow(atan(uv.y, uv.x) / TAU + lt), smoothstep(1.8, 2.1, lt) * 0.7);
    col += haloRing(uv, 0.33 + 0.02 * sin(lt * 3.0), 0.012, ringTint, 40.0, lt);
    col += haloRing(uv, 0.21, 0.008, hex(120.0, 220.0, 255.0), 24.0, -lt);
    col += hex(200.0, 210.0, 255.0) * 1.2 * exp(-r / 0.3);
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
    vec3 col = mix(hex(14.0, 12.0, 34.0), neonPalette(v * 2.0 + lr * 0.12 - lt * 0.45) * 2.0, check);
    return col * (0.85 + 0.35 * smoothstep(1.6, 0.25, r));
}

vec3 rays(vec2 uv, float lt, float purple) {
    const float N = 36.0;
    float r = max(length(uv), 1e-4);
    float v = atan(uv.y, uv.x) / TAU;
    float sv = v * N + lt * 1.1;
    float id = floor(sv);
    float f = fract(sv);
    float soft = clamp(px * N / (TAU * r) * 1.5, 0.02, 0.2) + purple * 0.15;
    float ray = smoothstep(0.12 - soft, 0.12 + soft, f) * (1.0 - smoothstep(0.7 - soft, 0.7 + soft, f));
    vec3 c = neonPalette(id / N * 3.0 + lt * 0.35);
    if (mod(id, 6.0) == 0.0) c = hex(255.0, 245.0, 255.0);
    c = mix(c, mix(hex(230.0, 80.0, 255.0), hex(120.0, 90.0, 255.0), fract(id * 0.5)), purple);
    vec3 col = mix(hex(16.0, 12.0, 38.0), c * 2.0 * (0.8 + 0.5 * exp(-r * 0.7)), ray);
    return col;
}

vec3 vortexScene(vec2 uv, float t) {
    float lt = t - T_VORTEX;
    // The checkerboard keeps tearing into rays and snapping back.
    float rayMix = smoothstep(7.6, 7.72, t) * (1.0 - smoothstep(8.55, 8.66, t)) + smoothstep(8.85, 8.95, t);
    float purple = smoothstep(8.9, 9.1, t);
    vec3 col = mix(checkerboard(uv, lt), rays(uv, lt, purple), rayMix);

    float r = length(uv);
    float beads = window(t, 8.6, 8.88, 0.04);
    vec3 ringTint = mix(hex(255.0, 245.0, 255.0), hex(255.0, 90.0, 200.0), beads);
    col += haloRing(uv, 0.34 + 0.03 * sin(lt * 2.0), 0.016, ringTint, 56.0, lt) * (0.4 + 0.6 * rayMix + beads);
    col += hex(230.0, 220.0, 255.0) * 1.4 * exp(-r / 0.35);
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
    vec3 col = hex(60.0, 50.0, 110.0);
    col += hex(255.0, 255.0, 255.0) * 3.2 * smoothstep(0.5, 0.85, rd.y);
    col += hex(255.0, 140.0, 210.0) * 2.0 * exp(-abs(rd.y) * 6.0);
    col += hex(140.0, 210.0, 255.0) * 2.2 * exp(-length(rd.xy - vec2(-0.75, 0.2)) * 5.0);
    col += hex(255.0, 255.0, 255.0) * 2.5 * exp(-length(rd.xy - vec2(0.7, -0.1)) * 7.0);
    return col;
}

vec3 mercuryScene(vec2 uv, float t) {
    gMercuryTime = t - T_MERCURY + 2.0;

    float r = length(uv);
    vec3 col = mix(hex(46.0, 40.0, 96.0), hex(18.0, 14.0, 40.0), smoothstep(0.0, 1.8, r));
    col += hex(120.0, 100.0, 220.0) * 0.45 * (0.5 + 0.5 * cos(r * 20.0 - gMercuryTime * 3.0)) * exp(-r * 0.6);

    vec3 ro = vec3(0.0, 0.0, 3.4);
    vec3 rd = normalize(vec3(uv, -2.55));
    vec3 hit = raymarch(ro, rd, 1.0, 6.0, 0.7);

    // Closest approach of the ray to the blob, for the pink halo.
    float md = 1e3;
    float tt = 1.0;
    for (int i = 0; i < 40; i++) {
        float d = map(ro + rd * tt).x;
        md = min(md, d);
        tt += max(d, 0.04);
        if (tt > 6.0) break;
    }
    col += hex(255.0, 70.0, 150.0) * 1.3 * exp(-md * 18.0);

    if (hit.x > 0.0) {
        vec3 p = ro + rd * hit.x;
        vec3 n = calcNormal(p, 0.0005 * hit.x);
        float ndv = clamp(dot(n, -rd), 0.0, 1.0);
        vec3 film = rainbow(ndv * 1.8 + n.y * 0.4 + gMercuryTime * 0.15);
        vec3 refl = reflect(rd, n);
        vec3 surf = film * (1.1 + 0.8 * studio(refl)) + studio(refl) * 0.35;
        surf += vec3(8.0) * pow(max(dot(refl, normalize(vec3(0.5, 0.8, 0.6))), 0.0), 40.0);
        surf += hex(255.0, 60.0, 120.0) * 2.4 * pow(1.0 - ndv, 3.0);
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

// Flashes: the line igniting, the blur out of the mandala, the cut into the
// vortex, and the long white-out that opens MERCURY.
float flash(float t, vec2 uv) {
    float f = 0.6 * exp(-pow((t - T_IRIS) / 0.04, 2.0));
    f += 1.1 * exp(-pow((t - (T_ECHO - 0.05)) / 0.09, 2.0));
    f += 0.6 * exp(-pow((t - T_VORTEX) / 0.04, 2.0));
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
    col += hex(255.0, 236.0, 250.0) * FLASH * flash(t, uv);

#if DEBUG_MODE == 1
    col = rainbow(float(id) / 6.0);
#endif

    col = max(col, 0.0);
    float n = hash13(vec3(floor(fragCoord), float(iFrame))) * 2.0 - 1.0;
    col = filmGrain(col, GRAIN, n) + 0.002 * n;
    fragColor = vec4(max(col, 0.0), 1.0);
}
