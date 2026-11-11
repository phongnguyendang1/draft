# InFlow launch film (30 s)

1920x1080, 30 fps, exactly 900 frames (000-899). Output: `out/inflow-launch-film.mp4`.

The film is a single HTML page drawn frame by frame, so every change is a text edit.

- `index.html` – the animation. `render(f)` draws frame `f`; open the file in a browser to preview and scrub.
- `render.js` – renders all 900 frames to PNG with Playwright.
- `audio.py` – synthesises the soundtrack (pulse, clicks, transitions) with numpy.
- `fonts/` – Geist Pixel, Geist Mono (SIL OFL, from the `geist` npm package) and Figtree (SIL OFL).
- `assets/` – InFlow wordmark and logomark SVGs.

## Rebuild

```bash
NODE_PATH=/opt/node-tools/node_modules node render.js /tmp/frames
```

```bash
python3 audio.py /tmp/soundtrack.wav
```

```bash
ffmpeg -y -framerate 30 -i /tmp/frames/f_%04d.png -i /tmp/soundtrack.wav -frames:v 900 -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -c:a aac -b:a 192k -t 30 -movflags +faststart out/inflow-launch-film.mp4
```

Interface panels are illustrative; offerings are generic and carry no real provider names or prices.
