#!/usr/bin/env python3
"""Build hm-portal-fast-fix.html from src-hm/portal.html (inlines src-hm/sprite.svg).
  python3 build_hm.py                      build
  python3 build_hm.py --refresh-icons DIR  regenerate src-hm/sprite.svg from an unpacked remixicon package (.../package/icons)
"""
import glob, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src-hm")
def read(n): return open(os.path.join(SRC, n), encoding="utf-8").read()
def names(): return sorted(set(re.findall(r"""(?:#|['"])ri-([a-z0-9]+(?:-[a-z0-9]+)*)""", read("portal.html"))) | set(re.findall(r"""['"]([a-z0-9]+(?:-[a-z0-9]+)*-(?:line|fill))['"]""", read("portal.html"))))
if len(sys.argv) == 3 and sys.argv[1] == "--refresh-icons":
    idx = {os.path.basename(p)[:-4]: p for p in glob.glob(os.path.join(sys.argv[2], "*", "*.svg"))}
    sym, miss = [], []
    for n in names():
        if n not in idx: miss.append(n); continue
        d = re.sub(r"\s+", " ", re.search(r' d="([^"]+)"', open(idx[n], encoding="utf-8").read()).group(1)).strip()
        sym.append('<symbol id="ri-%s" viewBox="0 0 24 24"><path d="%s"/></symbol>' % (n, d))
    open(os.path.join(SRC, "sprite.svg"), "w", encoding="utf-8").write('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' + "".join(sym) + "</svg>\n")
    print("sprite: %d icons%s" % (len(sym), (" | MISSING: " + ", ".join(miss)) if miss else "")); sys.exit(1 if miss else 0)
html = read("portal.html").replace("<!--SPRITE-->", read("sprite.svg").strip())
open(os.path.join(HERE, "hm-portal-fast-fix.html"), "w", encoding="utf-8").write(html)
print("built hm-portal-fast-fix.html (%d bytes)" % len(html))
