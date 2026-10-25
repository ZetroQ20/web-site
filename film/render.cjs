#!/usr/bin/env node
/*
 * Render the film with Playwright.
 *
 *   node render.cjs                    full film → out/film.mp4 (60 fps, 4 subframes blended)
 *   node render.cjs --stills           one frame per beat → out/beats/ + contact sheet
 *   node render.cjs --at 8,11.25,23.75 stills at given seconds → out/at/
 *   node render.cjs --from 7 --to 9    render a section
 *   node render.cjs --sub 1 --fps 30   quick preview
 *
 * If assets/audio.mp3 exists, tools/audio.py builds the mix and it is muxed in.
 */
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const FPS = Number(arg('fps', 60));
const SUB = Number(arg('sub', 4));
const DPR = Number(arg('dpr', 1));
const FROM = Number(arg('from', 0));
const DUR = 27;
const TO = Number(arg('to', DUR));
const STILLS = arg('stills', false);
const AT = arg('at', false);
const OUTFILE = arg('out', path.join(OUT, 'film.mp4'));

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${cmd} failed`);
}


function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webm': 'video/webm', '.mp4': 'video/mp4', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage() {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1440 }, deviceScaleFactor: DPR });
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
  page.on('pageerror', e => { console.error('[page error]', e.message); });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.evaluate(() => window.filmReady);
  return { server, browser, page };
}

const shot = (page, type = 'png') => page.screenshot({ type, clip: { x: 0, y: 0, width: 1440, height: 1440 } });

async function stills(page, times, dir, names) {
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < times.length; i++) {
    await page.evaluate(t => window.seek(t), times[i]);
    fs.writeFileSync(path.join(dir, names[i]), await shot(page));
    process.stdout.write(`\r${names[i]}   `);
  }
  process.stdout.write('\n');
}

async function video(page) {
  fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
  const silent = OUTFILE.replace(/\.mp4$/, '.silent.mp4');
  const frames = Math.round((TO - FROM) * FPS);
  // tmix averages the last SUB subframes; select keeps one per output frame.
  const vf = SUB > 1
    ? `tmix=frames=${SUB}:weights='${Array(SUB).fill(1).join(' ')}',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`
    : `setpts=N/(${FPS}*TB)`;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', silent],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg encode failed')))));
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    for (let j = 0; j < SUB; j++) {
      // subframes sit inside the frame interval, ending on the frame time
      const t = FROM + (f + (j - (SUB - 1)) / SUB) / FPS;
      await page.evaluate(x => window.seek(x), t);
      const buf = await shot(page);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (f % 15 === 0) {
      const el = (Date.now() - t0) / 1000, eta = el / (f + 1) * (frames - f - 1);
      process.stdout.write(`\rframe ${f + 1}/${frames}  ${(el).toFixed(0)}s elapsed, ~${eta.toFixed(0)}s left   `);
    }
  }
  ff.stdin.end();
  await done;
  process.stdout.write('\n');
  return silent;
}

(async () => {
  const { server, browser, page } = await openPage();
  try {
    if (STILLS) {
      const beats = Array.from({ length: 54 }, (_, i) => i * 0.5);
      const off = Number(arg('offset', 0));
      await stills(page, beats.map(b => b + off), path.join(OUT, 'beats'), beats.map((_, i) => `beat-${String(i + 1).padStart(2, '0')}.png`));
      run('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(OUT, 'beats/beat-%02d.png'),
        '-vf', 'scale=320:320,tile=9x6:padding=4:color=0x777777', '-frames:v', '1', path.join(OUT, 'beats/contact-sheet.png')]);
      console.log('stills → out/beats/');
    } else if (AT) {
      const times = String(AT).split(',').map(Number);
      await stills(page, times, path.join(OUT, 'at'), times.map(t => `t-${t.toFixed(3)}.png`));
      console.log('stills → out/at/');
    } else {
      const silent = await video(page);
      const audio = path.join(ROOT, 'assets/audio.mp3');
      if (fs.existsSync(audio) && FROM === 0 && TO === DUR) {
        run('python3', ['-I', path.join(ROOT, 'tools/audio.py')]);
        run('ffmpeg', ['-v', 'error', '-y', '-i', silent, '-i', path.join(OUT, 'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-shortest', OUTFILE]);
        fs.unlinkSync(silent);
      } else {
        fs.renameSync(silent, OUTFILE);
        if (!fs.existsSync(audio)) console.log('no assets/audio.mp3 — rendered silent');
      }
      console.log(`→ ${path.relative(process.cwd(), OUTFILE)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
