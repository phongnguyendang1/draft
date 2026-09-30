#!/usr/bin/env python3
"""Build self-contained HomeHub prototype pages.

Each option has one template (src/<option>/dashboard.html) and one layout stylesheet.
The build inlines the DM Sans font, shared CSS, the option CSS, the Remix icons the
template references, and the shared script, then writes desktop.html and mobile.html.

Photos for promo cards live in src/shared/photos/<name>.jpg (or .webp, .png) and are
referenced as src="{{PHOTO:name}}". A missing photo leaves the card's tinted placeholder.

Usage: python3 prototypes/build.py [option-slug ...]
"""

import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
SHARED = SRC / "shared"

OPTIONS = [
    {
        "slug": "option-1-action-center",
        "name": "Option 1 · Action Center",
    },
    {
        "slug": "option-2-membership-at-work",
        "name": "Option 2 · Membership at Work",
    },
    {
        "slug": "option-3-home-health",
        "name": "Option 3 · Home Health",
    },
    {
        "slug": "option-4-timeline",
        "name": "Option 4 · Timeline",
    },
    {
        "slug": "option-5-adaptive-stack",
        "name": "Option 5 · Adaptive Stack",
    },
]

FRAMES = {
    "desktop": "frame-desktop",
    "mobile": "frame-mobile",
}


def icon_symbol(name):
    svg = (SHARED / "icons" / f"{name}.svg").read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    return f'<symbol id="ri-{name}" viewBox="0 0 24 24">{inner}</symbol>'


INCLUDE = re.compile(r"^[ ]*<!-- @include ([a-z0-9-]+) -->\n", re.M)


def resolve_includes(html, depth=0):
    """Replace <!-- @include name --> lines with src/shared/partials/name.html."""
    if depth > 5:
        sys.exit("Includes nested too deeply")

    def sub(match):
        path = SHARED / "partials" / f"{match.group(1)}.html"
        if not path.exists():
            sys.exit(f"Missing partial: {path.relative_to(ROOT)}")
        return resolve_includes(path.read_text(), depth + 1)

    return INCLUDE.sub(sub, html)


PHOTO_TYPES = {".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png"}
PHOTO_IMG = re.compile(r'[ ]*<img [^>]*src="\{\{PHOTO:([a-z0-9-]+)\}\}"[^>]*>\n?')


def inline_photos(html):
    """Inline src="{{PHOTO:name}}" as a data URI, or drop the <img> if the photo is missing."""

    def sub(match):
        name = match.group(1)
        for ext, mime in PHOTO_TYPES.items():
            path = SHARED / "photos" / f"{name}{ext}"
            if path.exists():
                data = base64.b64encode(path.read_bytes()).decode()
                return match.group(0).replace(f"{{{{PHOTO:{name}}}}}", f"data:{mime};base64,{data}")
        print(f"  no photo for {name}, using the placeholder")
        return ""

    return PHOTO_IMG.sub(sub, html)


def build_page(option, frame_key):
    template = inline_photos(resolve_includes((SRC / option["slug"] / "dashboard.html").read_text()))

    names = sorted(set(re.findall(r'href="#ri-([a-z0-9-]+)"', template)))
    missing = [n for n in names if not (SHARED / "icons" / f"{n}.svg").exists()]
    if missing:
        sys.exit(f"Missing icons in src/shared/icons: {', '.join(missing)}")
    sprite = (
        '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
        + "".join(icon_symbol(n) for n in names)
        + "</svg>"
    )

    font = base64.b64encode((SHARED / "fonts" / "dm-sans-latin-opsz-normal.woff2").read_bytes()).decode()
    css = "\n".join(
        [
            (SHARED / "tokens.css").read_text().replace("{{FONT_DM_SANS}}", f"data:font/woff2;base64,{font}"),
            (SHARED / "components.css").read_text(),
            (SHARED / "modules.css").read_text(),
            (SRC / option["slug"] / "layout.css").read_text(),
        ]
    )
    js = (SHARED / "prototype.js").read_text()

    title = f"HomeHub · {option['name']} · {frame_key.capitalize()}"
    return (
        template.replace("{{TITLE}}", title)
        .replace("{{FRAME}}", FRAMES[frame_key])
        .replace("{{STYLES}}", f"<style>\n{css}\n</style>")
        .replace("{{ICONS}}", sprite)
        .replace("{{SCRIPTS}}", f"<script>\n{js}\n</script>")
    )


def build_index():
    font = base64.b64encode((SHARED / "fonts" / "dm-sans-latin-opsz-normal.woff2").read_bytes()).decode()
    css = "\n".join(
        [
            (SHARED / "tokens.css").read_text().replace("{{FONT_DM_SANS}}", f"data:font/woff2;base64,{font}"),
            (SHARED / "components.css").read_text(),
        ]
    )
    rows = "".join(
        f"""
      <li class="card index__row">
        <p class="t-title">{o['name']}</p>
        <div class="index__links">
          <a class="btn btn--secondary" href="{o['slug']}/desktop.html">Desktop · 1280</a>
          <a class="btn btn--secondary" href="{o['slug']}/mobile.html">Mobile · 390</a>
        </div>
      </li>"""
        for o in OPTIONS
    )
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HomeHub dashboard prototypes</title>
<style>
{css}
.index {{ max-width: 720px; margin: 0 auto; padding: 48px 16px; }}
.index__list {{ display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }}
.index__row {{ display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }}
.index__links {{ display: flex; gap: 12px; flex-wrap: wrap; }}
</style>
</head>
<body>
  <main class="index">
    <h1 class="t-display">HomeHub dashboard prototypes</h1>
    <p class="t-desc">Member Portal redesign. Each option has a desktop and a mobile screen.</p>
    <ul class="index__list">{rows}
    </ul>
  </main>
</body>
</html>
"""


def main():
    only = set(sys.argv[1:])
    index = ROOT / "index.html"
    index.write_text(build_index())
    print(f"wrote {index.relative_to(ROOT.parent)}")
    for option in OPTIONS:
        if only and option["slug"] not in only:
            continue
        out_dir = ROOT / option["slug"]
        out_dir.mkdir(exist_ok=True)
        for frame_key in FRAMES:
            out = out_dir / f"{frame_key}.html"
            out.write_text(build_page(option, frame_key))
            print(f"wrote {out.relative_to(ROOT.parent)} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
