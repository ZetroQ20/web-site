/* Run with: npm run build:standalone — reads the webpack build output (.next/server/app/ajans.html + .next/static/css). */
// Standalone ajans/index.html: prerendered /ajans markup + build CSS (fonts inlined) + vanilla behaviour.
const fs = require("fs"), path = require("path");
const repo = process.cwd(), next = path.join(repo, ".next");
const ts = require(path.join(repo, "node_modules/typescript"));
const asset = (p) => path.join(next, p.replace(/^\/_next\//, ""));
const mime = { woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf" };
const T = (code, jsx) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, jsx: jsx ? ts.JsxEmit.React : undefined } }).outputText.replace(/^"use strict";\s*/, "");
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

let html = fs.readFileSync(path.join(next, "server/app/ajans.html"), "utf8");
html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*\/>/g, (_, href) => {
  let css = fs.readFileSync(asset(href), "utf8");
  css = css.replace(/@font-face\{[^}]*?(cyrillic|greek|vietnamese)[^}]*\}/g, "");
  css = css.replace(/url\((["']?)(\/_next\/static\/media\/[^)"']+)\1\)/g, (m, q, u) => `url(data:${mime[u.split(".").pop()] || "application/octet-stream"};base64,${fs.readFileSync(asset(u)).toString("base64")})`);
  return `<style>${css}</style>`;
});
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
html = html.replace(/<link rel="(preload|preconnect|canonical)"[^>]*\/>/g, (m) => (m.includes('as="image"') ? m : ""));
if (/\/_next\//.test(html)) console.warn("WARN leftover /_next refs:", [...new Set(html.match(/\/_next\/[^"' )]+/g))].slice(0, 5));

// Liquid sculpture engine (same cut as before)
const hero = fs.readFileSync(path.join(repo, "components/ui/liquid-sculpture-hero.tsx"), "utf8");
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error("marker " + a); return s.slice(i, j); };
const engine = T([
  cut(hero, "type Rect =", "/* ────────────────────────────────────────────────────────────────────\n   Public API"),
  cut(hero, "function computeRect(", "/* ────────────────────────────────────────────────────────────────────\n   Styles"),
].join("\n"));

// ContributionSkyline, wrapped so its helpers stay out of the global scope
let sky = fs.readFileSync(path.join(repo, "components/ui/contribution-skyline.tsx"), "utf8");
sky = sky.replace(/^"use client"\s*/, "").replace(/^import \* as React from "react"\s*$/m, "")
  .replace(/^export default function /m, "function ").replace(/^export /gm, "");
const skyJs = `window.ContributionSkyline = (function () {\n${T(sky, true)}\nreturn ContributionSkyline;\n})();`;

const behaviour = fs.readFileSync(path.join(__dirname, "behaviour.js"), "utf8");
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
];
const tail = CDN.map((u) => `<script src="${u}"></script>`).join("\n") +
  `\n<script>\n/* Liquid sculpture engine — compiled from components/ui/liquid-sculpture-hero.tsx (Sculpture Hero by guglielmogiannattasio.it) */\n${safe(engine)}\n</script>` +
  `\n<script>\n/* ContributionSkyline — compiled from components/ui/contribution-skyline.tsx */\n${safe(skyJs)}\n</script>` +
  `\n<script>\n${safe(behaviour)}\n</script>\n`;
html = html.replace("</body>", () => tail + "</body>");
html = html.replace("<head>", () => "<head>\n<!-- ÜÇDAĞ — standalone build of /ajans. Generated from the Next.js app; edit the app, not this file. -->");
fs.writeFileSync(path.join(repo, process.argv[2] || "ajans/index.html"), html);
console.log("wrote", (html.length / 1024).toFixed(0) + " KB");
