// Renders poster.html → the-grace-poster.png (2400×3000). Usage: node poster/render.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 2 });
await page.goto("file://" + path.join(dir, "poster.html"), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.locator(".poster").screenshot({ path: path.join(dir, "the-grace-poster.png") });
await browser.close();
