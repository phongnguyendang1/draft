// Renders index.html frame by frame to PNG (1920x1080). Frame count and fps come from the page.
// Usage: node render.js <outDir> [frame,frame,...]   (frame list = spot-check only)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WORKERS = 4;
const out = path.resolve(process.argv[2] || 'frames');
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
fs.mkdirSync(out, { recursive: true });
const name = f => path.join(out, `f_${String(f).padStart(5, '0')}.png`);

(async () => {
  const browser = await chromium.launch();
  const url = 'file://' + path.join(__dirname, 'index.html') + '#render';
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.goto(url);
    await page.evaluate(() => Promise.all(['Geist Pixel', 'Geist Mono', 'Figtree'].map(f => document.fonts.load('40px "' + f + '"'))));
    return page;
  };
  const first = await open();
  const film = await first.evaluate(() => window.FILM);
  // Frames after holdFrom are identical by design; render one and copy it.
  const frames = only || [...Array(film.holdFrom + 1).keys()];
  let next = 0;
  const work = async page => {
    while (next < frames.length) {
      const f = frames[next++];
      await page.evaluate(n => window.renderFrame(n), f);
      await page.screenshot({ path: name(f) });
    }
    await page.close();
  };
  await Promise.all([work(first), ...[...Array(WORKERS - 1)].map(async () => work(await open()))]);
  await browser.close();
  if (!only) for (let f = film.holdFrom + 1; f < film.total; f++) fs.copyFileSync(name(film.holdFrom), name(f));
  console.log('rendered', only ? frames.length : film.total, 'frames at', film.fps, 'fps to', out);
})();
