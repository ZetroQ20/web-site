// PHOSPHENE — motion reel (10 s cut).
// One full-screen fragment shader, Shadertoy style (iTime in seconds).
// It writes linear colour, display-referred: the colours are sampled from
// clean stills of the reference, so there is no tonemap.
// Bloom, chromatic aberration and vignette happen in src/PostFx.tsx.
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
//   RETURN   a white-out, and the eye from the start opens again

#define DEBUG_MODE 0 // 0 final, 1 chapter id colours

// ---- Art controls -----------------------------------------------------------
const float EYE_HALF_WIDTH = 1.07;  // eye tip-to-centre distance (screen height = 2)
const float EYE_HALF_HEIGHT = 0.485; // fully open lid height
const float IRIS_RADIUS = 0.445;
const float PUPIL_RATIO = 0.37;     // pupil radius / iris radius before it dilates
const float CONTOURS = 15.0;        // fine lines around the eye
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

vec3 maroonBackground(vec2 uv) {
    float r = length(uv * vec2(0.62, 1.0));
    return mix(hex(24.0, 10.0, 19.0), hex(13.0, 4.0, 13.0), smoothstep(0.3, 1.5, r));
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
    col = max(col, hex(150.0, 136.0, 140.0) * stroke(d, 0.0014, 0.004, px));
    return col;
}

// ---- IRIS / PUPIL -------------------------------------------------------------
// Colours in this section are display sRGB values sampled from clean stills
// of the reference. The eye is not tonemapped, so they land on screen as is.

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
    vec3 col = hex(240.0, 226.0, 222.0) * 1.6 * exp(-abs(uv.y) / 0.0035) * exp(-ax * 0.5);
    for (int i = 1; i <= 12; i++) {
        float fi = float(i);
        float y = 0.032 * pow(fi, 1.3);
        float h = hash11(fi * 7.31);
        float line = exp(-abs(abs(uv.y) - y) / (0.0016 + 0.0016 * h)) * (0.5 + 0.5 * sin(uv.x * (3.0 + 4.0 * h) + fi));
        col += mix(hex(150.0, 60.0, 100.0), hex(80.0, 90.0, 150.0), h) * 0.35 * exp(-fi * 0.15) * line;
    }
    col += hex(90.0, 30.0, 60.0) * 0.2 * exp(-abs(uv.y) / 0.2);
    return col * amount;
}

// Muted rose-grey at the lid, deepening to plum and maroon outwards. During
// the dive the inner lines turn teal-grey and gold-grey.
vec3 contourColor(float k, float cool, float i) {
    vec3 c;
    if (k < 0.2) c = mix(hex(140.0, 112.0, 118.0), hex(122.0, 76.0, 98.0), k / 0.2);
    else if (k < 0.5) c = mix(hex(122.0, 76.0, 98.0), hex(98.0, 40.0, 74.0), (k - 0.2) / 0.3);
    else c = mix(hex(98.0, 40.0, 74.0), hex(60.0, 16.0, 46.0), (k - 0.5) / 0.5);
    float pick = mod(i, 3.0);
    vec3 diveC = pick < 1.0 ? hex(110.0, 126.0, 132.0) : (pick < 2.0 ? hex(156.0, 132.0, 106.0) : hex(150.0, 122.0, 122.0));
    return mix(c, diveC * mix(1.15, 0.7, k), cool * (1.0 - smoothstep(0.35, 0.8, k)));
}

vec3 eyeContours(vec2 p, float open, float lt, float cool, float pix) {
    vec3 col = vec3(0.0);
    for (int i = 1; i <= int(CONTOURS); i++) {
        float fi = float(i);
        float k = fi / CONTOURS;
        float breathe = 1.0 + 0.006 * sin(lt * 1.7 + fi * 0.9);
        // Lines bunch up near the lid and spread outwards; the tips run off
        // screen before the tops do, so every contour stays an almond.
        float sx = (1.06 + 1.45 * pow(k, 1.3)) * breathe;
        float sy = (1.12 + 2.0 * pow(k, 1.45)) * breathe;
        float d = sdEyeShape(p, EYE_HALF_WIDTH * sx, EYE_HALF_HEIGHT * sy * open);
        float line = 1.0 - smoothstep(0.0008, 0.0008 + 1.5 * pix, abs(d));
        col = max(col, contourColor(k, cool, fi) * mix(0.42, 0.62, cool) * (line + 0.18 * exp(-abs(d) / 0.004)));
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

    vec3 strand = mix(hex(170.0, 44.0, 70.0), hex(196.0, 150.0, 96.0), odd);
    vec3 col = strand * 0.7 * (stroke(s1, 0.011, 0.014, pc) + stroke(s2, 0.011, 0.014, pc));
    col = mix(col, hex(60.0, 24.0, 36.0), 1.0 - smoothstep(-pc, pc, eye));
    col += mix(hex(200.0, 168.0, 110.0), hex(110.0, 180.0, 176.0), odd) * 0.65 * stroke(eye, 0.01, 0.014, pc);
    col = mix(col, hex(96.0, 176.0, 186.0), 1.0 - smoothstep(-pc, pc, iris));
    return col;
}

// A pod: a glowing magenta bead with a red-orange double rim, holding an
// upright cream eye striped with red.
vec3 podCell(vec2 c, float pc, float odd) {
    float d = length(c) - 0.34;
    vec3 col = mix(hex(40.0, 16.0, 30.0), hex(30.0, 12.0, 26.0), odd);
    vec3 bead = mix(hex(210.0, 50.0, 150.0), hex(130.0, 26.0, 96.0), smoothstep(-0.34, 0.0, d));
    col = mix(col, bead, 1.0 - smoothstep(-pc, pc, d));
    col += hex(214.0, 84.0, 74.0) * (1.0 - smoothstep(0.008, 0.008 + 1.5 * pc, abs(d)));
    col += hex(214.0, 120.0, 80.0) * 0.7 * (1.0 - smoothstep(0.006, 0.006 + 1.5 * pc, abs(d - 0.04)));
    col += hex(220.0, 60.0, 150.0) * 0.35 * exp(-max(d, 0.0) / 0.06);
    float eye = sdVesica(c, 0.3, 0.22);
    float stripes = 0.5 + 0.5 * sin(c.y * 70.0);
    vec3 cream = mix(hex(236.0, 216.0, 178.0), hex(196.0, 70.0, 70.0), smoothstep(0.55, 0.9, stripes) * 0.8);
    col = mix(col, cream, 1.0 - smoothstep(-pc, pc, eye));
    col += hex(255.0, 220.0, 200.0) * 0.6 * (1.0 - smoothstep(0.006, 0.006 + 1.5 * pc, abs(eye)));
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

    vec3 col = mix(hex(70.0, 30.0, 38.0), hex(58.0, 24.0, 34.0), odd);
    // The chains of small eyes swell into magenta pods as the dive starts.
    float pods = smoothstep(4.3, 4.7, t);
    if (pods < 1.0) col += chainCell(c, pc, odd) * (1.0 - pods);
    if (pods > 0.0) {
        // Pods sit on their own, coarser grid: a ring of 14 big ones, a ring
        // of smaller ones inside it, and so on in.
        const float NP = 14.0;
        const float HP = 0.55;
        float up = log(r) / HP - max(t - 4.45, 0.0) * 0.9;
        float pr = floor(up);
        float podd = mod(pr, 2.0);
        float sp = a / TAU * NP + 0.5 * podd + t * 0.08;
        vec2 cp = vec2((sp - floor(sp + 0.5)) * TAU / (NP * HP), fract(up) - 0.5);
        col = mix(col, podCell(cp, pix / (r * HP), podd), pods);
    }

    // Glossy plum sphere in the middle swallows the rings that would alias.
    float core = 0.3;
    col *= smoothstep(core * 0.8, core * 1.25, r);
    float z = sqrt(max(1.0 - (r / core) * (r / core), 0.0));
    vec3 n = normalize(vec3(q / core, z + 1e-4));
    vec3 sphere = hex(96.0, 66.0, 104.0) * (0.35 + 0.75 * z) + hex(255.0, 240.0, 255.0) * 0.9 * pow(max(dot(n, normalize(vec3(-0.4, 0.5, 0.8))), 0.0), 30.0);
    col = mix(col, sphere, 1.0 - smoothstep(core - pix * 2.0, core, r));
    return col;
}

// Radial colour of the iris, sampled from the reference (sRGB, decoded):
// dark brown pupil, pale peach, a white-ish seam, pale teal, lavender, a
// plum limbus. x is the reference's normalised radius.
vec3 irisRamp(float x, float dive) {
    const int N = 13;
    const float P[13] = float[13](0.0, 0.3, 0.37, 0.395, 0.47, 0.56, 0.6, 0.65, 0.72, 0.8, 0.86, 0.92, 1.0);
    const vec3 C[13] = vec3[13](
        vec3(53.0, 36.0, 40.0), vec3(71.0, 49.0, 51.0), vec3(110.0, 72.0, 70.0), vec3(222.0, 172.0, 138.0),
        vec3(250.0, 206.0, 166.0), vec3(255.0, 212.0, 186.0), vec3(230.0, 226.0, 226.0), vec3(190.0, 230.0, 234.0),
        vec3(172.0, 212.0, 218.0), vec3(170.0, 204.0, 212.0), vec3(186.0, 178.0, 206.0), vec3(188.0, 140.0, 202.0),
        vec3(92.0, 58.0, 104.0));
    // Mid-dive the bands cycle: peach to grey-cream, teal to lavender,
    // lavender to periwinkle and steel blue.
    const vec3 D[13] = vec3[13](
        vec3(53.0, 36.0, 40.0), vec3(71.0, 49.0, 51.0), vec3(110.0, 72.0, 70.0), vec3(186.0, 180.0, 180.0),
        vec3(170.0, 170.0, 154.0), vec3(210.0, 205.0, 178.0), vec3(206.0, 186.0, 214.0), vec3(182.0, 156.0, 208.0),
        vec3(168.0, 176.0, 228.0), vec3(110.0, 140.0, 198.0), vec3(80.0, 126.0, 172.0), vec3(104.0, 132.0, 172.0),
        vec3(66.0, 84.0, 98.0));
    vec3 c = mix(C[N - 1], D[N - 1], dive);
    for (int i = 0; i < N - 1; i++) {
        if (x >= P[i] && x < P[i + 1]) {
            float k = smoothstep(P[i], P[i + 1], x);
            c = mix(mix(C[i], C[i + 1], k), mix(D[i], D[i + 1], k), dive);
            break;
        }
    }
    return srgbToLinear(c / 255.0);
}

// q is in iris units (|q| = 1 at the limbus).
vec3 irisColor(vec2 q, float t, float pupilR, float ornament, float pix, out float mask) {
    float r = length(q);
    vec2 dir = q / max(r, 1e-5);
    float a = atan(q.y, q.x + 1e-6);

    // Map the radius so the pupil edge lands on the reference's 0.37, and let
    // the band edges wander so peach, teal and lavender bleed together.
    float x = r < pupilR ? r / pupilR * 0.37 : 0.37 + (r - pupilR) / (1.0 - pupilR) * 0.63;
    x += 0.07 * fbm(vec3(dir * 2.5, r * 1.5 + 7.0), 3, 2.0, 0.5) * smoothstep(pupilR + 0.05, pupilR + 0.14, r);
    vec3 col = irisRamp(x, smoothstep(4.4, 4.85, t));

    // Fibres: soft, broad bundles of hair that curl clockwise as they leave
    // the pupil (nearly radial in the peach, about 50 deg in the teal),
    // pushed around by a slow flow field so they wave like feathers. Thin
    // dark partings separate the bundles, and a sparse second layer adds
    // stray dark hairs. Detail fades where it would alias.
    float flow = 1.8 * fbm(vec3(dir * 1.6, r * 2.2 + 1.0), 3, 2.0, 0.5);
    float twist = -14.0 * pow(r, 2.5);
    const float N = 62.0;
    float phase = a * N / TAU + twist + flow;
    float id = floor(phase);
    float f = fract(phase);
    float bundle = (0.55 + 0.45 * smoothstep(0.0, 0.35, f) * smoothstep(1.0, 0.65, f)) * (0.8 + 0.4 * hash11(mod(id, N) + 17.0));
    bundle *= 0.9 + 0.2 * sin(TAU * phase * 2.0 + 4.0 * fbm(vec3(dir * 5.0, r * 6.0), 2, 2.0, 0.5));
    const float NH = 150.0;
    float hairPhase = a * NH / TAU + twist * NH / N + flow * 2.4 + 2.0 * fbm(vec3(dir * 4.0, r * 4.0), 2, 2.0, 0.5);
    float hair = pow(abs(cos(PI * hairPhase)), 30.0) * smoothstep(0.15, 0.45, fbm(vec3(dir * 7.0, r * 3.0 + 3.0), 2, 2.0, 0.5));
    float foot = (N / TAU / max(r, 0.2) + 35.0 * pow(r, 1.5)) * pix;
    float footH = (NH / TAU / max(r, 0.2) + 85.0 * pow(r, 1.5)) * pix;
    float inBand = smoothstep(pupilR + 0.005, pupilR + 0.04, r);
    float contrast = mix(0.6, 1.0, smoothstep(0.45, 0.9, r));
    float shade = 1.0 + contrast * (bundle - 0.88);
    col *= mix(1.0, shade, (1.0 - smoothstep(0.3, 0.6, foot)) * inBand);
    col *= 1.0 - 0.3 * hair * (1.0 - smoothstep(0.2, 0.45, footH)) * inBand;

    // A dark wavy collarette ring in the lavender.
    float w1 = abs(r - 0.92 - 0.016 * sin(a * 9.0 + 1.0)) - 0.004;
    float w2 = abs(r - 0.8 - 0.02 * sin(a * 7.0 - 2.0 + 2.0 * fbm(vec3(dir * 2.0, 5.0), 2, 2.0, 0.5))) - 0.003;
    col = mix(col, hex(84.0, 50.0, 116.0), 0.55 * (1.0 - smoothstep(0.0, 2.0 * pix, w1)));
    col = mix(col, hex(80.0, 70.0, 120.0), 0.4 * (1.0 - smoothstep(0.0, 2.0 * pix, w2)));

    float pd = r - pupilR;
    if (ornament > 0.0) {
        vec3 orn = pupilOrnament(q / pupilR, t, pix / pupilR);
        col = mix(col, orn, ornament * (1.0 - smoothstep(-pix * 1.5, pix * 1.5, pd)));
    }

    // Catchlights: a thin ring up-left and a dot down-right, both on the
    // cornea; the camera passes through the cornea early in the dive.
    float glint = 1.0 - smoothstep(4.95, 5.15, t);
    float ring = abs(length(q - vec2(-0.48, 0.49)) - 0.2) - 0.006;
    col += vec3(1.0) * 0.9 * glint * (1.0 - smoothstep(0.0, 1.5 * pix, ring));
    col += vec3(1.0) * 0.12 * glint * exp(-max(ring, 0.0) / 0.03);
    float dot1 = length(q - vec2(0.44, -0.35)) - 0.026;
    col += vec3(1.0) * 0.8 * glint * (1.0 - smoothstep(-pix, pix * 2.0, dot1));

    mask = 1.0 - smoothstep(1.0 - pix, 1.0 + pix, r);
    return col;
}

// Camera dive into the pupil: still, a slow push, then an accelerating dive
// that keeps creeping once the ornament fills the frame.
float diveZoom(float t) {
    // A slow push-in while the ornament blooms, then the dive proper.
    float creep = 1.0 + 0.17 * smoothstep(3.9, 4.45, t);
    float x = t - 4.45;
    if (x <= 0.0) return creep;
    if (x <= 0.55) return creep * exp(4.6 * pow(x, 1.7));
    return creep * exp(1.67 + 0.35 * (x - 0.55));
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
    // A dusky lift just outside the lid.
    col += hex(64.0, 40.0, 52.0) * exp(-max(lid, 0.0) / 0.02) * smoothstep(0.03, 0.4, open);
    // Contours spring out of the line ahead of the lid, as flat lenses.
    float contourOpen = mix(0.02, 0.24, smoothstep(0.0, 0.25, lt)) + 0.76 * (open - 0.07) / 0.93 * step(0.07, open);
    col = max(col, eyeContours(p, max(contourOpen, open), lt, cool, pix));
    col += ignitionStreaks(uv, (1.0 - smoothstep(0.35, 1.0, lt)) * smoothstep(0.0, 0.04, lt));

    float inside = 1.0 - smoothstep(-pix, pix, lid);
    vec2 ip = p - g;
    float il = length(ip) / IRIS_RADIUS;
    // Near-black at the corners, dusky violet towards the iris, then a
    // teal-blue glow hugging the limbus.
    vec3 interior = mix(hex(40.0, 31.0, 54.0), hex(4.0, 2.0, 12.0), smoothstep(1.05, 2.3, il));
    interior *= mix(0.6, 1.0, smoothstep(0.0, 0.06, -lid));
    interior = mix(interior, hex(46.0, 44.0, 76.0), exp(-max(il - 1.0, 0.0) * 9.0));
    interior = mix(interior, hex(44.0, 76.0, 112.0), exp(-max(il - 1.0, 0.0) * 28.0));

    float ornament = smoothstep(3.95, 4.3, t);
    float pupilR = mix(PUPIL_RATIO, 0.44, smoothstep(3.95, 4.35, t)) * (1.0 + 0.03 * sin(t * 2.3));
    float irisMask;
    vec3 iris = irisColor(ip / IRIS_RADIUS, t, pupilR, ornament, pix / IRIS_RADIUS, irisMask);
    interior = mix(interior, iris, irisMask);
    // The lid casts a soft shadow over the top of the iris.
    interior *= mix(0.7, 1.0, smoothstep(0.0, 0.07, -lid));

    col = mix(col, interior, inside);
    // The lid line: a muted cream, brighter while diving.
    vec3 rimCol = mix(hex(196.0, 182.0, 180.0), hex(222.0, 214.0, 222.0), cool);
    col = mix(col, rimCol, 1.0 - smoothstep(0.0034, 0.0034 + 1.5 * pix, abs(lid)));
    col += rimCol * 0.12 * exp(-abs(lid) / 0.006);
    return col;
}

// ---- FUNNEL (ECHO + VORTEX) ---------------------------------------------------
// One continuous rush down a funnel: a tunnel of eyes, then a checkerboard
// tunnel that keeps tearing into rays. Display-referred colours sampled from
// clean stills of the reference; the post chain adds the zoom blur.

// Muted hue wheel around the funnel: two cycles per turn, olive on the right,
// rose, violet at the top and bottom, then blue, teal, green.
vec3 funnelHue(float a, float L, float C) {
    return max(oklchToLinearSrgb(vec3(L, C, 1.8 - 2.0 * a)), 0.0);
}

// Chroma along the wheel, as measured: soft in the warm and green rays,
// strongest through magenta, violet and blue.
float funnelChroma(float a) {
    float h = 1.8 - 2.0 * a;
    return 0.085 + 0.08 * smoothstep(0.2, 0.9, 0.5 + 0.5 * cos(h - 5.2));
}

// The funnel's centre: a glowing ring around a misty plum sphere, with an
// optional thin inner ring.
vec3 funnelCore(vec3 col, vec2 uv, float ringR, float ringW, vec3 ringCol, float innerR, vec3 sphereCol, float t) {
    float r = length(uv);
    float inside = 1.0 - smoothstep(ringR - ringW, ringR, r);
    float z = sqrt(max(1.0 - (r / ringR) * (r / ringR), 0.0));
    float mist = 0.5 + 0.5 * fbm(vec3(uv * 6.0 + t * 0.15, t * 0.4), 3, 2.0, 0.5);
    vec3 sphere = sphereCol * (0.55 + 0.35 * z + 0.3 * mist);
    col = mix(col, sphere, inside * 0.92);
    float dr = abs(r - ringR);
    col += ringCol * (1.0 - smoothstep(ringW, ringW + 1.5 * px, dr));
    col += ringCol * 0.45 * exp(-dr / (ringW * 3.0));
    if (innerR > 0.0) col += vec3(0.85) * (1.0 - smoothstep(0.0016, 0.0016 + 1.5 * px, abs(r - innerR)));
    return col;
}

// One eye of the tunnel, in cell coordinates c (x tangential, y radial).
// Returns rgb and coverage.
vec4 tunnelEye(vec2 c, float pc, float h, float fog) {
    float eye = sdEyeShape(c, 0.6, 0.23);
    float inside = 1.0 - smoothstep(-pc, pc, eye);
    vec3 col = mix(hex(76.0, 30.0, 66.0), hex(44.0, 24.0, 58.0), c.y + 0.5);

    // Magenta irises, a few blue ones, each with a white slash of light.
    bool blue = h < 0.24;
    float ir = length(c - vec2(0.0, -0.01));
    vec3 irisIn = blue ? hex(80.0, 90.0, 170.0) : hex(120.0, 20.0, 84.0);
    vec3 irisMid = blue ? hex(150.0, 196.0, 240.0) : hex(232.0, 56.0, 168.0);
    vec3 iris = mix(irisIn, irisMid, smoothstep(0.02, 0.12, ir));
    col = mix(col, iris, 1.0 - smoothstep(0.15 - pc, 0.15 + pc, ir));
    col += irisMid * 0.5 * exp(-max(ir - 0.15, 0.0) / 0.06) * inside;
    float slash = sdSegment(c, vec2(0.025, 0.035), vec2(0.115, 0.06)) - 0.012;
    col = mix(col, hex(250.0, 236.0, 245.0), 1.0 - smoothstep(-pc, pc, slash));

    // Two or three parallel outlines.
    vec3 line1 = h > 0.8 ? hex(150.0, 186.0, 180.0) : hex(92.0, 176.0, 216.0);
    vec3 line2 = hex(126.0, 204.0, 226.0);
    vec3 line3 = hex(70.0, 118.0, 170.0);
    float lines = 0.0;
    vec3 outline = vec3(0.0);
    for (int k = 0; k < 3; k++) {
        float fk = float(k);
        float s = 1.0 - smoothstep(0.009, 0.009 + 1.5 * pc, abs(eye - fk * 0.035));
        vec3 lc = k == 0 ? line1 : (k == 1 ? line2 : line3);
        outline = max(outline, lc * s * (1.0 - 0.28 * fk));
        lines = max(lines, s);
    }
    outline += line1 * 0.35 * exp(-abs(eye) / 0.05);
    // Deep in the funnel everything fogs to lavender-white.
    col = mix(col, hex(170.0, 168.0, 214.0), fog * 0.7);
    outline = mix(outline, hex(214.0, 210.0, 240.0) * 0.8, fog);
    col = mix(col, outline, lines);
    return vec4(col + outline * (1.0 - lines) * 0.5, max(inside, max(lines, 0.35 * exp(-abs(eye) / 0.05))));
}

vec3 tunnelOfEyes(vec2 uv, float lt, out float coverage) {
    const float N = 18.0;
    const float H = 0.26; // log-radius step between rings
    float r = max(length(uv), 1e-4);
    float a = atan(uv.y, uv.x);
    float u = log(r) / H - lt * 2.4;
    float ring = floor(u);
    float odd = mod(ring, 2.0);
    float sa = a / TAU * N + 0.5 * odd + lt * 0.05 * (odd * 2.0 - 1.0);
    float cell = floor(sa + 0.5);
    vec2 c = vec2((sa - cell) * TAU / (N * H), fract(u) - 0.5);
    float pc = px / (r * H);
    float h = hash12(vec2(mod(cell, N), ring + 1000.0));
    float fog = smoothstep(0.62, 0.14, r);
    vec4 e = tunnelEye(c, pc, h, fog);
    float fade = smoothstep(0.17, 0.3, r);
    coverage = e.a * fade;
    return e.rgb;
}

vec3 echoScene(vec2 uv, float t) {
    float lt = t - T_ECHO;
    float r = length(uv);
    vec3 col = mix(hex(30.0, 36.0, 62.0), hex(46.0, 24.0, 44.0), smoothstep(0.7, 1.4, r));
    col += hex(170.0, 170.0, 222.0) * 0.85 * exp(-r / 0.24);
    float cov;
    vec3 eyes = tunnelOfEyes(uv, lt, cov);
    col = mix(col, eyes, cov);
    col = funnelCore(col, uv, 0.17, 0.0035, hex(250.0, 206.0, 244.0), 0.0, hex(124.0, 126.0, 170.0), t);
    return col;
}

vec3 checkerTunnel(vec2 uv, float lt) {
    const float N = 32.0;
    const float H = 0.2;
    float r = max(length(uv), 1e-4);
    float a = atan(uv.y, uv.x);
    float u = log(r) / H - lt * 3.0;
    float v = a / TAU * N;
    float gu = 1.0 / (H * r);
    float gv = N / (TAU * r);
    float m = sin(PI * u) * sin(PI * v);
    float check = 0.5 + 0.5 * clamp(m / (PI * (gu + gv) * px * 0.7), -1.0, 1.0);
    // Near the core the cells stretch into rays.
    float ray = 0.5 + 0.5 * clamp(sin(PI * v) / (PI * gv * px * 0.7), -1.0, 1.0);
    float toRays = smoothstep(0.46, 0.3, r);
    check = mix(check, ray, toRays);
    vec3 lit = funnelHue(a, 0.64, funnelChroma(a)) * (0.9 + 0.15 * sin(floor(u) * 1.7));
    lit = mix(lit, funnelHue(a, 0.58, funnelChroma(a)), toRays);
    return mix(hex(22.0, 14.0, 30.0), lit, check);
}

vec3 rayBurst(vec2 uv, float lt, float violet) {
    const float N = 28.0;
    float r = max(length(uv), 1e-4);
    float a = atan(uv.y, uv.x);
    float v = a / TAU * N + lt * 0.25;
    float f = fract(v);
    float soft = clamp(px * N / (TAU * r) * 1.5, 0.01, 0.2) + violet * 0.12;
    float ray = smoothstep(0.06 - soft, 0.06 + soft, f) * (1.0 - smoothstep(0.62 - soft, 0.62 + soft, f));
    float ar = a + lt * 0.25 * TAU / N;
    vec3 c = funnelHue(ar, 0.52, funnelChroma(ar));
    c = mix(c, mix(hex(150.0, 70.0, 190.0), hex(90.0, 70.0, 180.0), 0.5 + 0.5 * sin(a * 2.0)), violet * 0.7);
    // Rays start just outside the core; inside the ring only faint wedges.
    float reach = smoothstep(0.28, 0.5, r);
    return mix(hex(12.0, 6.0, 18.0), c, ray * mix(0.18, 1.0, reach));
}

vec3 vortexScene(vec2 uv, float t) {
    float lt = t - T_VORTEX;
    // The checkerboard keeps tearing into rays and snapping back.
    float rayMix = smoothstep(7.6, 7.74, t) * (1.0 - smoothstep(8.54, 8.64, t)) + smoothstep(8.86, 8.96, t);
    float violet = smoothstep(8.9, 9.1, t);
    vec3 col = mix(checkerTunnel(uv, lt), rayBurst(uv, lt, violet), rayMix);

    // Eyes from the tunnel linger as ghostly bubbles for a moment.
    float ghost = 0.26 * (1.0 - smoothstep(7.4, 7.85, t)) * smoothstep(0.45, 0.7, length(uv));
    if (ghost > 0.0) {
        float cov;
        vec3 eyes = tunnelOfEyes(uv, t - T_ECHO, cov);
        col = mix(col, eyes, cov * ghost);
    }

    // The core grows from the checker's pink ring to the rays' white one.
    float ringR = mix(0.23, 0.27, rayMix);
    vec3 ringCol = mix(hex(255.0, 196.0, 240.0), hex(250.0, 248.0, 255.0), rayMix);
    vec3 sphere = mix(hex(150.0, 110.0, 160.0), hex(112.0, 82.0, 126.0), rayMix);
    col += mix(hex(255.0, 190.0, 240.0), hex(240.0, 240.0, 255.0), rayMix) * 0.35 * exp(-max(length(uv) - ringR, 0.0) / 0.08);
    col = funnelCore(col, uv, ringR, mix(0.009, 0.014, rayMix), ringCol, mix(0.14, 0.17, rayMix), sphere, t);
    // Faint dark wedges carry the rays on inside the sphere.
    float wedge = 0.5 + 0.5 * sin(atan(uv.y, uv.x) * 28.0 + lt * 1.6);
    col *= 1.0 - 0.3 * rayMix * smoothstep(0.4, 0.9, wedge) * (1.0 - smoothstep(ringR * 0.6, ringR, length(uv))) * smoothstep(0.03, 0.08, length(uv));
    return col;
}

// ---- Timeline -------------------------------------------------------------------

vec3 chapter(int id, vec2 uv, float t) {
    if (id == 0) return signalScene(uv, t);
    if (id <= 2) return eyeScene(uv, t); // IRIS and PUPIL are one continuous shot
    if (id == 3) return echoScene(uv, t);
    if (id == 4) return vortexScene(uv, t);
    // Back where we started: the eye replays from just before its lid
    // snaps open, so it opens again and glances around.
    return eyeScene(uv, T_IRIS + 0.4 + (t - T_RETURN));
}

float chapterStart(int id) {
    if (id == 0) return T_SIGNAL;
    if (id == 1) return T_IRIS;
    if (id == 2) return T_PUPIL;
    if (id == 3) return T_ECHO;
    if (id == 4) return T_VORTEX;
    return T_RETURN;
}

// Crossfade into chapter id, in seconds (0 = hard cut or continuous shot).
float chapterFade(int id) {
    if (id == 1) return 0.05;
    if (id == 3) return 0.22;
    if (id == 4) return 0.12;
    return 0.0;
}

// Flashes: the line igniting, the blur out of the pupil, the cut into the
// vortex, and the long white-out that takes us back to the eye.
float flash(float t, vec2 uv) {
    float f = 0.5 * exp(-pow((t - T_IRIS) / 0.04, 2.0));
    f += 0.9 * exp(-pow((t - (T_ECHO - 0.05)) / 0.09, 2.0));
    f += 0.5 * exp(-pow((t - T_VORTEX) / 0.04, 2.0));
    float whiteout = smoothstep(T_RETURN - 0.06, T_RETURN, t) * (1.0 - smoothstep(T_RETURN + 0.12, T_RETURN + 0.26, t));
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
