// PHOSPHENE — motion reel.
// One full-screen fragment shader, Shadertoy style (iTime in seconds).
// It writes linear HDR colour; bloom, chromatic aberration, vignette and the
// AgX tonemap happen in the post chain (src/PostFx.tsx).
//
// Chapter start times T_* are prepended by scripts/build-shader.mjs from
// src/timeline.json, so the HUD and the picture share one timeline.
//
//   SIGNAL     two dashes fuse into a hot horizontal line
//   IRIS       the line opens into an almond eye wrapped in neon contours
//   PUPIL      the camera dives into the pupil, which turns into a mandala
//   ECHO       a log-polar tunnel built from rings of small eyes
//   VORTEX     a rainbow log-spiral checkerboard around a glowing orb
//   FLARE      the checkerboard tears into rotating rainbow rays
//   MERCURY    a raymarched iridescent chrome blob
//   AFTERIMAGE the blob collapses to a point, the point back into the line

#define DEBUG_MODE 0 // 0 final, 1 chapter id colours

// ---- Art controls -----------------------------------------------------------
const float EYE_HALF_WIDTH = 1.0;   // eye tip-to-centre distance (screen height = 2)
const float EYE_HALF_HEIGHT = 0.38; // fully open lid height
const float IRIS_RADIUS = 0.34;
const float PUPIL_RATIO = 0.34;     // pupil radius / iris radius
const float CONTOURS = 16.0;        // neon lines around the eye
const float GRAIN = 0.07;
const float SCANLINES = 0.03;
const float FLASH = 2.2;            // white flash strength at hard cuts

float px; // one pixel in uv units, set in mainImage

vec3 hex(float r, float g, float b) { return srgbToLinear(vec3(r, g, b) / 255.0); }

float easeOutExpo(float x) {
    x = clamp(x, 0.0, 1.0);
    return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x);
}

float easeInOut(float x) { return smoothstep(0.0, 1.0, x); }

// HDR stroke: an antialiased core of half-width w plus an exponential halo.
float stroke(float d, float w, float halo, float pix) {
    float core = 1.0 - smoothstep(w, w + 1.5 * pix, abs(d));
    return core + 0.35 * exp(-abs(d) / halo);
}

vec3 rainbow(float t) {
    return srgbToLinear(clamp(cosinePalette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67)), 0.0, 1.0));
}

vec3 plumBackground(vec2 uv) {
    float r = length(uv * vec2(0.62, 1.0));
    return mix(hex(52.0, 36.0, 66.0), hex(14.0, 9.0, 20.0), smoothstep(0.0, 1.6, r));
}

// Almond eye with its tips on the x axis. sdVesica points along y, so the
// axes are swapped: r - d is the half height, r^2 - d^2 the squared half width.
float sdEyeShape(vec2 p, float halfW, float halfH) {
    halfH = max(halfH, 0.0005);
    float r = 0.5 * (halfW * halfW / halfH + halfH);
    return sdVesica(p.yx, r, r - halfH);
}

// ---- SIGNAL -------------------------------------------------------------------

// The hot horizontal line shared by SIGNAL (opening) and AFTERIMAGE (closing).
vec3 signalLine(vec2 uv, float inner, float outer, float intensity, float w) {
    float ax = abs(uv.x);
    float dx = max(max(inner - ax, ax - outer), 0.0);
    float d = length(vec2(dx, uv.y));
    vec3 tint = mix(vec3(1.0), rainbow(uv.x * 0.7 + 0.15), 0.35);
    return tint * intensity * stroke(d, w, 0.012, px);
}

vec3 anamorphicStreaks(vec2 uv, float amount) {
    float ax = abs(uv.x);
    vec3 col = hex(255.0, 236.0, 250.0) * 1.6 * exp(-abs(uv.y) / 0.0035) * exp(-ax * 0.55);
    for (int i = 1; i <= 7; i++) {
        float fi = float(i);
        float y = 0.028 * pow(fi, 1.45);
        float line = exp(-abs(abs(uv.y) - y) / 0.0022) * exp(-ax * (0.35 + 0.08 * fi));
        col += mix(hex(190.0, 120.0, 255.0), hex(90.0, 120.0, 255.0), fi / 7.0) * 0.45 * exp(-fi * 0.32) * line;
    }
    col += hex(120.0, 70.0, 200.0) * 0.35 * exp(-abs(uv.y) / 0.09);
    return col * amount;
}

vec3 signalScene(vec2 uv, float t) {
    vec3 col = plumBackground(uv) * smoothstep(0.0, 0.5, t);
    float appear = smoothstep(0.2, 0.45, t);
    float grow = easeOutExpo((t - 0.8) / 0.65);
    float inner = mix(0.075, 0.0, grow);
    float outer = mix(0.235, EYE_HALF_WIDTH, grow);
    float intensity = mix(0.22, 3.4, grow) * appear;
    col += signalLine(uv, inner, outer, intensity, mix(0.0016, 0.0042, grow));
    col += anamorphicStreaks(uv, grow);
    return col;
}

// ---- IRIS / PUPIL -------------------------------------------------------------

vec3 eyeContours(vec2 p, float open, float t, float pix) {
    vec3 c1 = hex(255.0, 242.0, 238.0);
    vec3 c2 = hex(255.0, 172.0, 140.0);
    vec3 c3 = hex(255.0, 78.0, 140.0);
    vec3 c4 = hex(160.0, 70.0, 255.0);
    vec3 col = vec3(0.0);
    for (int i = 1; i <= int(CONTOURS); i++) {
        float fi = float(i);
        float k = fi / CONTOURS;
        float breathe = 1.0 + 0.012 * sin(t * 1.7 + fi * 0.9);
        // Lines bunch up near the lid and spread outwards; the tips run off
        // screen before the tops do, so every contour stays an almond.
        float sx = (1.0 + 1.9 * pow(k, 1.15)) * breathe;
        float sy = (1.0 + 2.3 * pow(k, 1.35)) * breathe;
        float d = sdEyeShape(p, EYE_HALF_WIDTH * sx, EYE_HALF_HEIGHT * sy * open);
        vec3 c = k < 0.33 ? mix(c1, c2, k / 0.33) : (k < 0.66 ? mix(c2, c3, (k - 0.33) / 0.33) : mix(c3, c4, (k - 0.66) / 0.34));
        if (i % 4 == 2) c = mix(c, hex(120.0, 255.0, 220.0), 0.45);
        col += c * 2.3 * exp(-k * 1.7) * stroke(d, 0.0014 + 0.0045 * k, 0.006, pix);
    }
    float rim = sdEyeShape(p, EYE_HALF_WIDTH, EYE_HALF_HEIGHT * open);
    col += hex(255.0, 236.0, 246.0) * 3.0 * stroke(rim, 0.0055, 0.02, pix);
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

    vec3 base = mix(hex(110.0, 8.0, 46.0), hex(70.0, 6.0, 60.0), odd) * 0.7;
    vec3 fill = mix(hex(225.0, 22.0, 72.0), hex(230.0, 40.0, 165.0), odd) * (0.9 + 0.5 * (0.5 - c.y));
    vec3 col = mix(base, fill, 1.0 - smoothstep(-pc, pc, petal));
    col += hex(255.0, 100.0, 175.0) * 1.9 * stroke(petal, 0.012, 0.03, pc);
    col = mix(col, hex(255.0, 226.0, 192.0) * 2.8, 1.0 - smoothstep(-pc, pc, seed));
    col = mix(col, hex(140.0, 20.0, 40.0), 1.0 - smoothstep(-pc, pc, eyeDot));

    // Tiny rings near the centre alias; let the orb swallow them.
    col *= smoothstep(0.015, 0.2, r);
    col += hex(220.0, 230.0, 255.0) * 4.0 * exp(-r / 0.06);
    col += hex(80.0, 120.0, 255.0) * 1.6 * exp(-abs(r - 0.13) / 0.015);
    return col;
}

// q is in iris units (|q| = 1 at the limbus).
vec3 irisColor(vec2 q, float t, float mandalaMix, float pix, out float mask) {
    float r = length(q);
    vec2 dir = q / max(r, 1e-5);
    float fib = fbm(vec3(dir * 9.0, r * 2.5 - t * 0.15), 4, 2.0, 0.5);
    float fib2 = fbm(vec3(dir * 24.0, r * 4.0 + 3.0), 3, 2.0, 0.5);

    vec3 col = mix(hex(255.0, 192.0, 172.0) * 2.0, hex(255.0, 248.0, 245.0) * 3.2, smoothstep(PUPIL_RATIO, 0.7, r));
    col *= 0.72 + 0.55 * fib2;
    float strand = smoothstep(0.12, 0.42, fib) * smoothstep(0.5, 0.95, r);
    col = mix(col, hex(130.0, 90.0, 210.0) * 1.3, strand * 0.6);
    float limb = smoothstep(0.84, 1.0, r);
    col = mix(col, mix(hex(70.0, 140.0, 255.0), hex(205.0, 60.0, 255.0), 0.5 + 0.5 * dir.y) * 2.2, limb);

    float pd = r - PUPIL_RATIO;
    vec3 pupil = mix(hex(255.0, 112.0, 52.0) * 1.7, hex(205.0, 34.0, 22.0), smoothstep(0.0, PUPIL_RATIO, r));
    if (mandalaMix > 0.0) pupil = mix(pupil, mandala(q / PUPIL_RATIO, t, pix / PUPIL_RATIO), mandalaMix);
    col = mix(col, pupil, 1.0 - smoothstep(-pix, pix, pd));
    col += hex(255.0, 150.0, 120.0) * 1.4 * exp(-abs(pd) / 0.03);

    mask = 1.0 - smoothstep(1.0 - pix, 1.0 + pix, r);
    return col;
}

// Camera zoom into the pupil: still, then an accelerating dive that eases
// out once PUPIL starts (the mandala keeps flowing on its own).
float diveZoom(float t) {
    float x = t - (T_PUPIL - 0.6);
    if (x <= 0.0) return 1.0;
    if (x <= 0.6) return exp(5.4 * x * x);
    return exp(1.944 + 0.12 * (1.0 - exp(-3.0 * (x - 0.6))));
}

vec3 eyeScene(vec2 uv, float t) {
    float open = mix(0.003, 1.0, easeOutExpo((t - T_IRIS) / 1.0));
    float zoom = diveZoom(t);
    vec2 p = uv / zoom;
    float pix = px / zoom;

    vec3 col = plumBackground(uv) + eyeContours(p, open, t, pix);

    float lid = sdEyeShape(p, EYE_HALF_WIDTH, EYE_HALF_HEIGHT * open);
    float inside = 1.0 - smoothstep(-pix, pix, lid);
    vec3 interior = hex(58.0, 46.0, 88.0) * 0.8 + hex(120.0, 80.0, 210.0) * 0.5 * exp(-length(p) / 0.3);

    float irisMask;
    float mandalaMix = smoothstep(T_PUPIL - 1.0, T_PUPIL - 0.3, t);
    vec3 iris = irisColor(p / IRIS_RADIUS, t, mandalaMix, pix / IRIS_RADIUS, irisMask);
    float halo = exp(-max(length(p) / IRIS_RADIUS - 1.0, 0.0) * 7.0);
    interior += mix(hex(80.0, 130.0, 255.0), hex(210.0, 70.0, 255.0), 0.5) * 0.9 * halo;
    interior = mix(interior, iris, irisMask);

    col = mix(col, interior, inside);
    col += hex(255.0, 236.0, 246.0) * 3.0 * stroke(lid, 0.0055, 0.02, pix) * (1.0 - smoothstep(4.0, 7.0, zoom));
    return col;
}

// ---- ECHO ---------------------------------------------------------------------

vec3 echoScene(vec2 uv, float t) {
    const float N = 16.0;
    const float H = TAU / (N * 1.6); // cells 1.6x wider than tall
    float lt = t - T_ECHO;
    float r = max(length(uv), 1e-4);
    float a = atan(uv.y, uv.x);
    float u = log(r) / H - lt * 2.2;
    float ring = floor(u);
    float odd = mod(ring, 2.0);
    float sa = a / TAU * N + 0.5 * odd + lt * 0.12 * (odd * 2.0 - 1.0);
    float cell = floor(sa + 0.5);
    vec2 c = vec2((sa - cell) * 1.6, fract(u) - 0.5);
    float pc = px / (r * H);

    float h = hash12(vec2(mod(cell, N), ring + 1000.0));
    vec3 outline = h < 0.22 ? hex(255.0, 70.0, 120.0) : mix(hex(60.0, 150.0, 255.0), hex(120.0, 240.0, 255.0), h);
    float eye = sdEyeShape(c, 0.66, 0.31);
    float iris = sdCircle(c, 0.16);
    float corner = sdCircle(vec2(0.8 - abs(c.x), 0.5 - abs(c.y)), 0.07);

    vec3 col = mix(hex(8.0, 12.0, 40.0), hex(20.0, 28.0, 80.0), smoothstep(1.4, 0.0, r));
    col += hex(255.0, 60.0, 120.0) * 1.1 * (1.0 - smoothstep(-pc, pc, corner));
    col = mix(col, hex(14.0, 26.0, 74.0), 1.0 - smoothstep(-pc, pc, eye));
    col = mix(col, mix(hex(255.0, 120.0, 160.0) * 2.0, hex(255.0, 255.0, 255.0) * 2.6, smoothstep(0.16, 0.0, length(c))),
              1.0 - smoothstep(-pc, pc, iris));
    col += outline * 2.0 * stroke(eye, 0.03, 0.07, pc);

    col *= smoothstep(0.02, 0.22, r);
    col += hex(235.0, 240.0, 255.0) * 3.6 * exp(-r / 0.09);
    col += hex(140.0, 170.0, 255.0) * 0.9 * exp(-r / 0.35);
    return col;
}

// ---- VORTEX / FLARE -------------------------------------------------------------

// The glowing orb at the heart of VORTEX and FLARE.
vec3 orb(vec2 uv, float radius, float t) {
    float r = length(uv);
    float d = r - radius;
    float z = sqrt(max(1.0 - (r / radius) * (r / radius), 0.0));
    vec3 film = rainbow(z * 1.2 + atan(uv.y, uv.x + 1e-6) / TAU + t * 0.25);
    vec3 inner = hex(255.0, 250.0, 255.0) * (1.6 + 1.6 * z) + film * 2.4 * pow(1.0 - z, 2.0);
    // A darker crescent reads as a sphere inside the glass.
    float crescent = sdCircle(uv - vec2(radius * 0.18, radius * 0.12), radius * 0.62);
    inner *= mix(0.55, 1.0, smoothstep(-0.02, 0.03, crescent));
    vec3 col = inner * (1.0 - smoothstep(-px, px, d));
    col += hex(255.0, 255.0, 255.0) * 2.2 * exp(-abs(d) / 0.012);
    col += hex(230.0, 210.0, 255.0) * 1.5 * exp(-max(d, 0.0) / 0.12);
    return col;
}

vec3 vortexScene(vec2 uv, float t) {
    float lt = t - T_VORTEX;
    float r = max(length(uv), 1e-4);
    float v = atan(uv.y, uv.x) / TAU;
    float lr = log(r);
    // Integer multiples of v keep both families seamless across the atan cut.
    float s1 = lr * 2.6 + v * 6.0 - lt * 2.0;
    float s2 = v * 24.0 - lr * 1.2 + lt * 0.4;
    float g1 = length(vec2(2.6, 6.0 / TAU)) / r;
    float g2 = length(vec2(1.2, 24.0 / TAU)) / r;
    float m = sin(PI * s1) * sin(PI * s2);
    float check = 0.5 + 0.5 * clamp(m / (PI * (g1 + g2) * px * 0.6), -1.0, 1.0);

    vec3 col = mix(hex(12.0, 10.0, 32.0), rainbow(v * 2.0 + lr * 0.15 - lt * 0.5) * 1.35, check);
    col *= 0.75 + 0.35 * smoothstep(1.6, 0.25, r);
    col += orb(uv, 0.2, t);
    return col;
}

vec3 flareScene(vec2 uv, float t) {
    const float N = 36.0;
    float lt = t - T_FLARE;
    float r = max(length(uv), 1e-4);
    float v = atan(uv.y, uv.x) / TAU;
    float sv = v * N + lt * 1.1;
    float id = floor(sv);
    float f = fract(sv);
    float soft = clamp(px * N / (TAU * r) * 1.5, 0.02, 0.2);
    float ray = smoothstep(0.12 - soft, 0.12 + soft, f) * (1.0 - smoothstep(0.7 - soft, 0.7 + soft, f));

    float reach = mix(0.15, 3.0, easeOutExpo(lt / 0.55));
    ray *= 1.0 - smoothstep(reach - 0.4, reach, r);

    vec3 c = rainbow(id / N * 3.0 + lt * 0.35);
    vec3 pink = mix(hex(255.0, 60.0, 190.0), hex(150.0, 70.0, 255.0), fract(id * 0.5));
    c = mix(c, pink, smoothstep(T_FLARE + 0.7, T_MERCURY, t) * 0.55);
    if (mod(id, 6.0) == 0.0) c = hex(255.0, 245.0, 255.0);

    vec3 col = hex(14.0, 10.0, 34.0);
    col = mix(col, c * 1.4 * (0.75 + 0.5 * exp(-r * 0.7)), ray);
    col += orb(uv, mix(0.2, 0.25, easeInOut(lt / 1.6)), t);
    return col;
}

// ---- MERCURY ------------------------------------------------------------------

float gMercuryTime;
float gCollapse;

vec2 map(vec3 p) {
    float t = gMercuryTime;
    float s = mix(1.0, 0.015, gCollapse);
    p /= s;
    p.xz = rot2(t * 0.55) * p.xz;
    p.xy = rot2(0.18 * sin(t * 0.8)) * p.xy;
    vec3 tp = domTwist(p, 0.55);

    float d = sdSphere(tp - vec3(0.08 + 0.07 * sin(t * 1.3), 0.78, 0.0), 0.3);
    d = smin(d, sdTorus((tp - vec3(-0.1, 0.26 + 0.05 * sin(t * 1.1), 0.0)).xzy, vec2(0.34, 0.17)), 0.26);
    d = smin(d, sdSphere(tp - vec3(0.13, -0.28 + 0.06 * sin(t * 0.9 + 1.0), 0.08), 0.4), 0.3);
    d = smin(d, sdSphere(tp - vec3(-0.05, -0.84, 0.0), 0.29 + 0.025 * sin(t * 1.7)), 0.26);
    d += 0.012 * sin(9.0 * p.y + t * 3.0) * sin(7.0 * p.x - t * 2.0);
    // Twist and ripples push the gradient above 1; the march uses stepScale < 1.
    return vec2(d * s, 1.0);
}

vec3 studio(vec3 rd) {
    vec3 col = hex(30.0, 24.0, 60.0) * 0.6;
    col += hex(255.0, 255.0, 255.0) * 2.6 * smoothstep(0.55, 0.85, rd.y);
    col += hex(255.0, 120.0, 200.0) * 1.6 * exp(-abs(rd.y) * 7.0);
    col += hex(120.0, 200.0, 255.0) * 1.8 * exp(-length(rd.xy - vec2(-0.75, 0.2)) * 6.0);
    return col;
}

vec3 mercuryScene(vec2 uv, float t) {
    gMercuryTime = t - T_MERCURY + 2.0;
    gCollapse = easeInOut((t - T_AFTERIMAGE) / 0.45);

    float r = length(uv);
    vec3 col = hex(16.0, 12.0, 36.0) * (1.0 - 0.4 * smoothstep(0.0, 1.8, r));
    col += hex(70.0, 50.0, 150.0) * 0.28 * (0.5 + 0.5 * cos(r * 22.0 - gMercuryTime * 3.0)) * exp(-r * 0.7);

    vec3 ro = vec3(0.0, 0.0, 3.4);
    vec3 rd = normalize(vec3(uv, -1.9));
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
    col += hex(255.0, 70.0, 140.0) * 1.9 * exp(-md * 14.0) * (1.0 - 0.6 * gCollapse);

    if (hit.x > 0.0) {
        vec3 p = ro + rd * hit.x;
        vec3 n = calcNormal(p, 0.0005 * hit.x);
        float ndv = clamp(dot(n, -rd), 0.0, 1.0);
        vec3 film = rainbow(ndv * 1.6 + n.y * 0.35 + gMercuryTime * 0.15);
        vec3 refl = reflect(rd, n);
        vec3 surf = film * (0.9 + 0.7 * studio(refl));
        surf += vec3(6.0) * pow(max(dot(refl, normalize(vec3(0.5, 0.8, 0.6))), 0.0), 40.0);
        surf += hex(255.0, 60.0, 110.0) * 3.4 * pow(1.0 - ndv, 2.5);
        col = surf;
    }
    col += hex(255.0, 245.0, 255.0) * 5.0 * exp(-r / 0.03) * gCollapse;
    return col;
}

// ---- AFTERIMAGE -----------------------------------------------------------------

vec3 afterimageScene(vec2 uv, float t) {
    float lt = t - T_AFTERIMAGE;
    float fade = 1.0 - smoothstep(1.2, 2.05, lt);
    float grow = easeOutExpo((lt - 0.4) / 0.6);
    vec3 col = plumBackground(uv) * 0.8 * fade;
    float intensity = mix(6.0, 3.2, grow) * fade;
    col += signalLine(uv, 0.0, EYE_HALF_WIDTH * grow, intensity, mix(0.004, 0.0012, smoothstep(0.9, 1.9, lt)));
    col += anamorphicStreaks(uv, grow * fade * 0.8);
    col += hex(255.0, 245.0, 255.0) * 5.0 * exp(-length(uv) / 0.03) * (1.0 - grow) * fade;
    // A phosphene: the eye lingers as a faint, complementary-coloured ghost.
    float ghost = smoothstep(0.35, 0.9, lt) * (1.0 - smoothstep(1.1, 1.9, lt));
    col += eyeContours(uv, 0.75, t, px).gbr * 0.1 * ghost;
    return col;
}

// ---- Timeline -------------------------------------------------------------------

vec3 chapter(int id, vec2 uv, float t) {
    if (id == 0) return signalScene(uv, t);
    if (id <= 2) return eyeScene(uv, t); // IRIS and PUPIL are one continuous shot
    if (id == 3) return echoScene(uv, t);
    if (id == 4) return vortexScene(uv, t);
    if (id == 5) return flareScene(uv, t);
    if (id == 6) return mercuryScene(uv, t);
    return afterimageScene(uv, t);
}

float chapterStart(int id) {
    if (id == 0) return T_SIGNAL;
    if (id == 1) return T_IRIS;
    if (id == 2) return T_PUPIL;
    if (id == 3) return T_ECHO;
    if (id == 4) return T_VORTEX;
    if (id == 5) return T_FLARE;
    if (id == 6) return T_MERCURY;
    return T_AFTERIMAGE;
}

// Crossfade into chapter id, in seconds (0 = hard cut or continuous shot).
float chapterFade(int id) {
    if (id == 1) return 0.15;
    if (id == 3) return 0.35;
    if (id == 4) return 0.3;
    if (id == 5) return 0.35;
    if (id == 6) return 0.2;
    if (id == 7) return 0.45;
    return 0.0;
}

// Hard white flashes on the cuts that leave the eye.
float flash(float t) {
    float f = 0.0;
    f += exp(-pow((t - T_ECHO) / 0.05, 2.0));
    f += 0.7 * exp(-pow((t - T_VORTEX) / 0.05, 2.0));
    f += 0.7 * exp(-pow((t - T_FLARE) / 0.05, 2.0));
    f += exp(-pow((t - T_MERCURY) / 0.06, 2.0));
    return f;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    px = 2.0 / iResolution.y;
    float t = min(iTime, T_END);

    int id = 0;
    for (int i = 1; i < 8; i++) {
        if (t >= chapterStart(i)) id = i;
    }

    vec3 col = chapter(id, uv, t);
    float fade = chapterFade(id);
    float into = t - chapterStart(id);
    if (fade > 0.0 && into < fade) {
        col = mix(chapter(id - 1, uv, t), col, easeInOut(into / fade));
    }
    col += vec3(1.0, 0.97, 1.0) * FLASH * flash(t) * (0.4 + 0.6 * exp(-length(uv) * 1.2));

#if DEBUG_MODE == 1
    col = rainbow(float(id) / 8.0);
#endif

    col = max(col, 0.0);
    float n = hash13(vec3(floor(fragCoord), float(iFrame))) * 2.0 - 1.0;
    col = filmGrain(col, GRAIN, n) + 0.004 * n;
    col *= 1.0 - SCANLINES * (0.5 + 0.5 * cos(fragCoord.y * PI));
    fragColor = vec4(max(col, 0.0), 1.0);
}
