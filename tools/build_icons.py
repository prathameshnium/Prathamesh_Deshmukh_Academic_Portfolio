"""Build a trimmed, self-hosted Font Awesome icon set for this site.

The site uses ~70 of Font Awesome's 2,000+ icons. Loading the full library from
a CDN costs ~360 KB per page; this script writes only the icons the site uses
(fonts + CSS) to _assets/vendor/fontawesome/.

Re-run it whenever you add or change an icon class (fa-...) in any page or
in _assets/js/*.js, otherwise the new icon will not show.

Usage (needs Python 3 and fontTools: `pip install fonttools`):

    python tools/build_icons.py <fa-dir>

<fa-dir> must contain these files from the official Font Awesome Free 6.6.0
npm package (@fortawesome/fontawesome-free):
    all.css             (package/css/all.css)
    fa-solid-900.ttf    (package/webfonts/fa-solid-900.ttf)
    fa-regular-400.ttf  (package/webfonts/fa-regular-400.ttf)
    fa-brands-400.ttf   (package/webfonts/fa-brands-400.ttf)
    LICENSE.txt         (package/LICENSE.txt)
Nothing from the package is executed: the fonts and CSS are only read as data.
"""

import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "_assets" / "vendor" / "fontawesome"
SOURCES = [*REPO.glob("*.html"), *REPO.glob("pages/**/*.html"), *REPO.glob("_assets/js/*.js")]
TOKEN = re.compile(r"\bfa-[a-z0-9]+(?:-[a-z0-9]+)*\b")
FONTS = {  # family/weight in all.css -> (source ttf, output file)
    ("Font Awesome 6 Free", "900"): ("fa-solid-900.ttf", "fa-solid-900.woff"),
    ("Font Awesome 6 Free", "400"): ("fa-regular-400.ttf", "fa-regular-400.woff"),
    ("Font Awesome 6 Brands", "400"): ("fa-brands-400.ttf", "fa-brands-400.woff"),
}


def used_tokens():
    found = set()
    for path in SOURCES:
        found.update(TOKEN.findall(path.read_text(encoding="utf-8")))
    return found


def top_level_blocks(css):
    """Split CSS into (prelude, body) pairs, honouring nested braces."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    blocks, i = [], 0
    while True:
        start = css.find("{", i)
        if start == -1:
            return blocks
        depth, j = 1, start + 1
        while depth:
            depth += {"{": 1, "}": -1}.get(css[j], 0)
            j += 1
        blocks.append((css[i:start].strip(), css[start + 1:j - 1].strip()))
        i = j


def keep_selector(selector, used):
    return all(t in used for t in TOKEN.findall(selector))


def filter_rules(css, used, icons, section):
    out = []
    for prelude, body in top_level_blocks(css):
        if prelude.startswith("@keyframes"):
            if prelude.split()[1] in used:
                out.append(f"{prelude}{{{body}}}")
        elif prelude.startswith("@media"):
            inner = filter_rules(body, used, icons, section)
            if inner:
                out.append(f"{prelude}{{{''.join(inner)}}}")
        elif prelude.startswith("@font-face"):
            family = re.search(r"font-family:\s*['\"]([^'\"]+)", body).group(1)
            weight = (re.search(r"font-weight:\s*(\d+)", body) or [None, None])[1]
            if (family, weight) in FONTS:
                section[0] = "brands" if "Brands" in family else "classic"
                woff = FONTS[(family, weight)][1]
                body = re.sub(r"src:[^;]+", f'src: url("{woff}") format("woff")', body)
                out.append(f"@font-face{{{body}}}")
        else:
            selectors = [s.strip() for s in prelude.split(",")]
            icon = re.fullmatch(r'content:\s*"\\([0-9a-f]+)";?', body)
            if icon and all(re.fullmatch(r"\.fa-[a-z0-9-]+::?before", s) for s in selectors):
                names = [s.split(":")[0][1:] for s in selectors if s.split(":")[0][1:] in used]
                if names:
                    for n in names:
                        icons[n] = (section[0], int(icon.group(1), 16))
                    out.append(",".join(f".{n}::before" for n in names) + f"{{{body}}}")
                continue
            kept = [s for s in selectors if keep_selector(s, used)]
            if kept:
                out.append(f"{','.join(kept)}{{{body}}}")
    return out


def minify(css):
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};:,>])\s*", r"\1", css)
    return css.replace(";}", "}")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    used = used_tokens()
    icons, section = {}, ["classic"]
    rules = filter_rules((src / "all.css").read_text(encoding="utf-8"), used, icons, section)

    OUT.mkdir(parents=True, exist_ok=True)
    report = []
    for (family, weight), (ttf, woff) in FONTS.items():
        kind = "brands" if "Brands" in family else "classic"
        cmap = TTFont(src / ttf).getBestCmap()
        codes = sorted({cp for k, cp in icons.values() if k == kind and cp in cmap})
        opts = subset.Options()
        opts.flavor = "woff"
        opts.layout_features = []
        opts.name_IDs = ["*"]          # keep the copyright/licence entries
        opts.notdef_outline = True
        font = subset.load_font(str(src / ttf), opts)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=codes)
        sub.subset(font)
        subset.save_font(font, str(OUT / woff), opts)
        report.append(f"{woff}: {len(codes)} icons, {(OUT / woff).stat().st_size / 1024:.1f} KB")

    banner = (src / "all.css").read_text(encoding="utf-8").split("*/", 1)[0] + "*/\n"
    note = "/* Trimmed to the icons this site uses by tools/build_icons.py - re-run after adding icons. */\n"
    (OUT / "icons.css").write_text(banner + note + minify("".join(rules)) + "\n", encoding="utf-8", newline="\n")
    (OUT / "LICENSE.txt").write_bytes((src / "LICENSE.txt").read_bytes())

    # Every icon used on the site must exist in the font it is drawn from.
    missing = []
    for name, (kind, cp) in sorted(icons.items()):
        fonts = ["fa-brands-400.woff"] if kind == "brands" else ["fa-solid-900.woff", "fa-regular-400.woff"]
        if not any(cp in TTFont(OUT / f).getBestCmap() for f in fonts):
            missing.append(name)
    unknown = sorted(t for t in used if t not in icons and f".{t}" not in "".join(rules))

    print("\n".join(report))
    print(f"icons.css: {(OUT / 'icons.css').stat().st_size / 1024:.1f} KB, {len(icons)} icons")
    print("icons missing from fonts:", missing or "none")
    print("fa-* classes in the site with no Font Awesome rule:", unknown or "none")
    if missing:
        sys.exit(1)


if __name__ == "__main__":
    main()
