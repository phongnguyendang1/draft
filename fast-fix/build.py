#!/usr/bin/env python3
"""Assemble the standalone HomeHub Request-flow prototypes.

Source of truth lives in src/:
  font-face.css  DM Sans (variable, woff2, base64) - copied from desktop_4.html
  base.css       design tokens + shared components   - VERBATIM from desktop_4.html
  chrome.css     frames, payment banner, top bar     - VERBATIM from desktop_4.html
  flow.css       everything new for the Request flow (built only from base tokens)
  body.html      markup, with {{SPRITE}} placeholder
  app.js         prototype interactions
  sprite.svg     Remix Icon symbols used by the markup (generated, see --refresh-icons)

Outputs (repo root of fast-fix/): one file per frame, same CSS, different body class.
  request-flow-desktop.html  (frame-desktop, 1280)
  request-flow-mobile.html   (frame-mobile, 390)

Usage:
  python3 build.py                       build both frames
  python3 build.py --refresh-icons DIR   regenerate src/sprite.svg from an unpacked remixicon package
                                         (DIR = .../package/icons) for every ri-* name used in body.html/app.js/flow.css
"""
import glob
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")


def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()


def used_icons():
    names = set()
    for n in ("body.html", "app.js", "flow.css"):
        names |= set(re.findall(r"ri-([a-z0-9]+(?:-[a-z0-9]+)*)", read(n)))
    return sorted(names)


def refresh_icons(icon_dir):
    index = {os.path.basename(p)[:-4]: p for p in glob.glob(os.path.join(icon_dir, "*", "*.svg"))}
    symbols, missing = [], []
    for name in used_icons():
        if name not in index:
            missing.append(name)
            continue
        svg = open(index[name], encoding="utf-8").read()
        d = re.search(r' d="([^"]+)"', svg).group(1)
        d = re.sub(r"\s+", " ", d).strip()
        symbols.append('<symbol id="ri-%s" viewBox="0 0 24 24"><path d="%s"/></symbol>' % (name, d))
    sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' + "".join(symbols) + "</svg>\n"
    with open(os.path.join(SRC, "sprite.svg"), "w", encoding="utf-8") as f:
        f.write(sprite)
    print("sprite: %d icons%s" % (len(symbols), (" | MISSING: " + ", ".join(missing)) if missing else ""))
    if missing:
        sys.exit(1)


def build():
    font = read("font-face.css")
    css = "\n".join([font, read("base.css"), read("chrome.css"), read("flow.css")])
    sprite = read("sprite.svg")
    body = read("body.html").replace("{{SPRITE}}", sprite)
    js = read("app.js")
    for frame, out, title in (
        ("desktop", "request-flow-desktop.html", "HomeHub · Request service · Desktop"),
        ("mobile", "request-flow-mobile.html", "HomeHub · Request service · Mobile"),
    ):
        html = (
            '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            "<title>%s</title>\n<style>\n%s\n</style>\n</head>\n"
            '<body class="frame-%s">\n%s\n<script>\n%s\n</script>\n</body>\n</html>\n'
        ) % (title, css, frame, body, js)
        path = os.path.join(HERE, out)
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print("wrote %s (%d KB)" % (out, len(html) // 1024))


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--refresh-icons":
        refresh_icons(sys.argv[2])
    else:
        build()
