// Renders index.html frame by frame to PNG (1920x1080, frames 000-899).
// Usage: node render.js <outDir> [frame,frame,...]   (frame list = spot-check only)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TOTAL = 900, WORKERS = 4;
const out = path.resolve(process.argv[2] || 'frames');
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const url = 'file://' + path.join(__dirname, 'index.html') + '#render';
  const frames = only || [...Array(TOTAL).keys()];
  let next = 0;
  await Promise.all([...Array(WORKERS)].map(async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all(['Geist Pixel','Geist Mono','Figtree'].map(f => document.fonts.load('40px "' + f + '"'))));
    while (next < frames.length) {
      const f = frames[next++];
      await page.evaluate(n => window.renderFrame(n), f);
      await page.screenshot({ path: path.join(out, `f_${String(f).padStart(4, '0')}.png`) });
    }
    await page.close();
  }));
  await browser.close();
  // The end card holds from frame 810. Copy that frame so the hold is pixel-identical
  // (parallel pages can differ by a few antialiasing pixels).
  if (!only) {
    const hold = path.join(out, 'f_0810.png');
    for (let f = 811; f < TOTAL; f++) fs.copyFileSync(hold, path.join(out, `f_${String(f).padStart(4, '0')}.png`));
  }
  console.log('rendered', frames.length, 'frames to', out);
})();
