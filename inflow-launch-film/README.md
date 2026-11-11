# InFlow launch film (45 s)

1920x1080, 60 fps, 2,700 frames. Output: `out/inflow-launch-film.mp4`.

The film is a single HTML page drawn frame by frame, so every change is a text edit.

- `index.html` – the animation. `render(f)` draws frame `f`; open the file in a browser to preview and scrub.
- `render.js` – renders every frame to PNG with Playwright (frame count and fps are read from the page).
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
ffmpeg -y -framerate 60 -i /tmp/frames/f_%05d.png -i /tmp/soundtrack.wav -frames:v 2700 -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -c:a aac -b:a 192k -t 45 -movflags +faststart out/inflow-launch-film.mp4
```

Copy is drawn from the launch post. Interface panels are illustrative: providers are generic (Provider A-E) and prices are shown as tiers, not real figures.
