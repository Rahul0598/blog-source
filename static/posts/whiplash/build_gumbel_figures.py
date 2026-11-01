"""Static figures for the snip-snap post:
- October 2026 reversal up close (KBMG data)
- Full historical record: seasonality (by month) and timeline (1895–2026)
- Gumbel distribution for rarity and return periods (IU long-term record)

Usage: python3 build_gumbel_figures.py [path/to/USC00120784.dly] [path/to/USW00003893.dly]
"""
import calendar
import collections
import datetime as dt
import json
import pathlib
import sys
import urllib.request

import numpy as np
from scipy import stats

POST = pathlib.Path(__file__).resolve().parent  # static/posts/whiplash
FIGURES, DATA = POST / "figures", POST / "data"
WINDOW = 3  # maximum days for each change
COVERAGE = 0.95
FORCED = {2019, 2026}
ERAS = ((1896, 1960), (1961, 2026))
LEVELS = (35, 40, 44)

# Palette and geometry
INK, MUTED, RULE, PAPER, ACCENT = "#444", "#888", "#ddd", "#fff", "#c46b6b"
W, M = 720, {"left": 70, "right": 18, "bottom": 48}


def load_dly(path):
    highs = {}
    for line in open(path):
        if line[17:21] != "TMAX":
            continue
        y, m = int(line[11:15]), int(line[15:17])
        for d in range(1, calendar.monthrange(y, m)[1] + 1):
            o = 21 + (d - 1) * 8
            val, qflag = int(line[o:o + 5]), line[o + 6]
            if val != -9999 and not qflag.strip():
                highs[dt.date(y, m, d)] = round(val / 10 * 9 / 5 + 32)
    start, end = min(highs), max(highs)
    days = [start + dt.timedelta(i) for i in range((end - start).days + 1)]
    return days, [highs.get(d) for d in days], highs


def reversals(days, v, window=WINDOW, cutoff=20):
    n = len(v)
    for b in range(1, n - 1):
        if v[b] is None:
            continue
        for left in range(1, window + 1):
            a = b - left
            if a < 0 or None in v[a:b]:
                continue
            first = v[b] - v[a]
            for right in range(1, window + 1):
                c = b + right
                if c >= n or None in v[b:c + 1]:
                    continue
                second = v[c] - v[b]
                if first * second < 0:
                    strength = min(abs(first), abs(second))
                    if strength >= cutoff:
                        yield strength, abs(first) + abs(second), a, b, c


def consolidate(cands, n):
    cands.sort(key=lambda x: (-x[0], -x[1], x[4] - x[2]))
    used = [False] * n
    filtered = []
    for c in cands:
        if any(used[i] for i in range(c[2], c[4])):
            continue
        for i in range(c[2], c[4]):
            used[i] = True
        filtered.append(c)
    return sorted(filtered, key=lambda x: x[3])


def gumbel_sf(level, loc, scale):
    return float(stats.gumbel_r.sf(level, loc, scale))


def fmt_period(p):
    return f"1 in {1 / p:.0f}"


# ---------- SVG helpers ----------
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, anchor="start", cls="", extra=""):
    lines = s.split("\n")
    spans = "".join(
        f'<tspan x="{x:.1f}" dy="{0 if i == 0 else 15}">{esc(t)}</tspan>' for i, t in enumerate(lines))
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" class="{cls}" {extra}>{spans}</text>'


def svg(height, title, body):
    style = (f"text{{fill:{INK};font:13px sans-serif}}"
             f".c{{paint-order:stroke;stroke:{PAPER};stroke-width:4px;stroke-linejoin:round}}"
             f".m{{fill:{MUTED}}}.a{{fill:{ACCENT}}}")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {height}" '
            f'width="{W}" height="{height}" role="img"><title>{esc(title)}</title>'
            f'<style>{style}</style><rect width="{W}" height="{height}" fill="{PAPER}"/>'
            + "".join(body) + "</svg>\n")


def frame(height, top, x, y, xticks, yticks, xtitle, ytitle, xfmt=str, yfmt=str):
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    out = []
    for t in yticks:
        out.append(f'<line x1="{left}" x2="{right}" y1="{y(t):.1f}" y2="{y(t):.1f}" '
                   f'stroke="{RULE}" stroke-opacity=".55"/>')
    out.append(f'<line x1="{left}" x2="{right}" y1="{bottom}" y2="{bottom}" stroke="{RULE}"/>')
    out.append(f'<line x1="{left}" x2="{left}" y1="{top}" y2="{bottom}" stroke="{RULE}"/>')
    for t in xticks:
        out.append(f'<line x1="{x(t):.1f}" x2="{x(t):.1f}" y1="{bottom}" y2="{bottom + 6}" stroke="{RULE}"/>')
        out.append(text(x(t), bottom + 20, xfmt(t), "middle"))
    for t in yticks:
        out.append(f'<line x1="{left - 6}" x2="{left}" y1="{y(t):.1f}" y2="{y(t):.1f}" stroke="{RULE}"/>')
        out.append(text(left - 9, y(t) + 4, yfmt(t), "end"))
    out.append(text((left + right) / 2, height - 7, xtitle, "middle"))
    out.append(f'<text transform="translate(17,{(top + bottom) / 2:.1f}) rotate(-90)" '
               f'text-anchor="middle">{esc(ytitle)}</text>')
    return out


def linear(d0, d1, r0, r1):
    return lambda val: r0 + (val - d0) / (d1 - d0) * (r1 - r0)


def path(points):
    return "M" + "L".join(f"{px:.1f},{py:.1f}" for px, py in points)


# ---------- Figure 1: October 2026 Up Close ----------
def october_2026_figure(kbmg_map):
    height, top = 260, 60
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    oct_days = [dt.date(2026, 10, d) for d in range(10, 26)]
    x = linear(10, 25, left + 4, right - 4)
    y = linear(50, 95, bottom - 4, top + 4)

    out = frame(height, top, x, y, range(10, 26, 3), range(50, 96, 10),
                "Reporting date (October 2026)", "Daily high (°F)",
                lambda d: f"Oct {d}", lambda t: f"{t}")

    # Area highlight from Oct 13 to Oct 21
    out.append(f'<rect x="{x(13):.1f}" y="{top}" width="{x(21) - x(13):.1f}" height="{bottom - top}" '
               f'fill="{ACCENT}" fill-opacity=".05"/>')

    # Line of daily highs
    pts = [(x(d.day), y(kbmg_map[d])) for d in oct_days]
    out.append(f'<path d="{path(pts)}" fill="none" stroke="{MUTED}" stroke-width="1.4" opacity=".8"/>')
    for d in oct_days:
        out.append(f'<circle cx="{x(d.day):.1f}" cy="{y(kbmg_map[d]):.1f}" r="2.5" fill="{MUTED}" opacity=".7"/>')

    # Reversal segment (Oct 13 -> Oct 17 -> Oct 21)
    rev_days = [13, 14, 15, 16, 17, 18, 19, 20, 21]
    rev_pts = [(x(d), y(kbmg_map[dt.date(2026, 10, d)])) for d in rev_days]
    out.append(f'<path d="{path(rev_pts)}" fill="none" stroke="{ACCENT}" stroke-width="2"/>')

    callouts = [
        (13, "Oct 13\n87°F", "start", left + 5),
        (17, "Oct 17\n55°F", "middle", (left + right) / 2),
        (21, "Oct 21\n73°F", "end", right - 5)
    ]
    for d_num, lbl, anchor, lx in callouts:
        cx, cy = x(d_num), y(kbmg_map[dt.date(2026, 10, d_num)])
        out.append(f'<path d="M{lx:.1f},40L{cx:.1f},{top + 2}L{cx:.1f},{cy:.1f}" stroke="{RULE}" fill="none"/>')
        out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="3.5" fill="{ACCENT}"/>')
        out.append(text(lx, 18, lbl, anchor, "c"))

    return svg(height, "Daily highs in Bloomington, October 10–25, 2026", out)


# ---------- Figure 2: Seasonality of Reversals across the Historical Record ----------
def seasonality_figure(all_revs, days):
    height, top = 280, 40
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    x = linear(0.5, 12.5, left + 4, right - 4)
    y = linear(18, 48, bottom - 4, top + 4)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    out = frame(height, top, x, y, range(1, 13), range(20, 49, 10),
                "Month of turning point", "Reversal size (°F)",
                lambda m: month_names[m - 1], lambda t: f"{t}")

    # Shaded band for Fall (Sep–Nov)
    out.append(f'<rect x="{x(8.5):.1f}" y="{top}" width="{x(11.5) - x(8.5):.1f}" height="{bottom - top}" '
               f'fill="{ACCENT}" fill-opacity=".06"/>')
    out.append(text((x(9.5) + x(10.5)) / 2, top + 15, "Fall", "middle", "c a"))

    rng = np.random.default_rng(42)
    for r in all_revs:
        strength, _, _, b, _ = r
        m = days[b].month
        jx = x(m) + (rng.uniform(-0.3, 0.3) * (x(2) - x(1)))
        cy = y(strength)
        is_oct = (m == 10)
        color = ACCENT if is_oct else MUTED
        opacity = 0.85 if is_oct else 0.35
        radius = 3.5 if is_oct else 2
        out.append(f'<circle cx="{jx:.1f}" cy="{cy:.1f}" r="{radius}" fill="{color}" opacity="{opacity}"/>')

    out.append(text(x(3), y(44) - 8, "Record swings (44°F)\nWinter & Spring", "middle", "c"))
    out.append(text(x(10), y(36) - 8, "Oct 1975 (36°F)", "middle", "c a"))
    out.append(text(x(7), y(30), "Summer: virtually none", "middle", "c m"))

    return svg(height, "Historical temperature reversals by month in Bloomington (1895–2026)", out)


# ---------- Figure 3: Full 130-Year Timeline ----------
def timeline_figure(all_revs, days):
    height, top = 280, 40
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    x = linear(1895, 2026, left + 4, right - 4)
    y = linear(18, 48, bottom - 4, top + 4)

    out = frame(height, top, x, y, range(1900, 2027, 20), range(20, 49, 10),
                "Year (1895–2026)", "Reversal size (°F)", lambda yr: f"{yr}", lambda t: f"{t}")

    for r in all_revs:
        strength, _, _, b, _ = r
        d = days[b]
        cx = x(d.year + (d.month - 1) / 12)
        cy = y(strength)
        is_oct = (d.month == 10)
        is_fall = (d.month in (9, 10, 11))
        color = ACCENT if is_oct else (MUTED if not is_fall else "#e09090")
        opacity = 0.85 if is_oct else (0.25 if not is_fall else 0.5)
        radius = 3.5 if is_oct else 2
        out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{radius}" fill="{color}" opacity="{opacity}"/>')

    # Legend
    out.append(f'<circle cx="{left + 15}" cy="{top + 12}" r="3.5" fill="{ACCENT}"/>')
    out.append(text(left + 25, top + 16, "October reversals", "start", "c a"))
    out.append(f'<circle cx="{left + 160}" cy="{top + 12}" r="2" fill="{MUTED}" opacity=".5"/>')
    out.append(text(left + 170, top + 16, "Other months (mostly Winter/Spring)", "start", "c m"))

    return svg(height, "Bloomington temperature reversals over time (1895–2026)", out)


# ---------- Gumbel Rarity & Eras Figures ----------
def density_axes(height, top, ymax):
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    x = linear(15, 55, left + 4, right - 4)
    y = linear(0, ymax, bottom, top + 4)
    out = frame(height, top, x, y, range(15, 56, 5), np.arange(0, ymax + 1e-9, 4),
                "Biggest reversal of the year (°F)", "Share of years (% per °F)",
                lambda t: f"{t}", lambda t: f"{t:.0f}%")
    return x, y, out, bottom


def curve(loc, scale, lo=15, hi=55):
    xs = np.arange(lo, hi + 0.001, 0.25)
    return xs, stats.gumbel_r.pdf(xs, loc, scale) * 100


def area(x, y, xs, ys, bottom):
    pts = [(x(xs[0]), bottom)] + [(x(a), y(b)) for a, b in zip(xs, ys)] + [(x(xs[-1]), bottom)]
    return path(pts) + "Z"


def rarity_figure(maxima, fit, labelled):
    loc, scale = fit
    height, top = 300, 24
    x, y, out, bottom = density_axes(height, top, 12)
    counts = collections.Counter(int(m // 2 * 2) for m in maxima)
    for lo, k in counts.items():
        h = k / len(maxima) / 2 * 100
        out.append(f'<rect x="{x(lo) + 1:.1f}" y="{y(h):.1f}" width="{x(lo + 2) - x(lo) - 2:.1f}" '
                   f'height="{bottom - y(h):.1f}" fill="{MUTED}" fill-opacity=".22"/>')
    xs, ys = curve(loc, scale)
    tail = xs >= 44
    out.append(f'<path d="{area(x, y, xs[tail], ys[tail], bottom)}" fill="{ACCENT}" fill-opacity=".45"/>')
    out.append(f'<path d="{path([(x(a), y(b)) for a, b in zip(xs, ys)])}" fill="none" stroke="{INK}" stroke-width="1.5"/>')
    heights = {35: 11, 40: 8, 44: 5}
    for lv in LEVELS:
        p = gumbel_sf(lv, loc, scale)
        out.append(f'<line x1="{x(lv):.1f}" x2="{x(lv):.1f}" y1="{top}" y2="{bottom}" '
                   f'stroke="{ACCENT if lv == 44 else MUTED}" stroke-dasharray="3 3"/>')
        label = f"{lv}°F or more\n{fmt_period(p)} years"
        if lv == 44:
            label = f"{lv}°F or more ({', '.join(map(str, labelled))})\n{fmt_period(p)} years"
        out.append(text(x(lv) + 5, y(heights[lv]), label, "start", "c" + (" a" if lv == 44 else "")))
    out.append(text(x(23), y(9.6), "Gumbel curve", "end", "c"))
    out.append(text(x(23), y(9.6) + 15, "Bars: observed years", "end", "c m"))
    return svg(height, "Distribution of each year's biggest temperature reversal with a fitted Gumbel curve", out)


def eras_figure(era_fits):
    height, top = 300, 24
    x, y, out, bottom = density_axes(height, top, 12)
    colors = (MUTED, ACCENT)
    for (label, (loc, scale)), color in zip(era_fits.items(), colors):
        xs, ys = curve(loc, scale)
        tail = xs >= 40
        out.append(f'<path d="{area(x, y, xs[tail], ys[tail], bottom)}" fill="{color}" fill-opacity=".3"/>')
        out.append(f'<path d="{path([(x(a), y(b)) for a, b in zip(xs, ys)])}" fill="none" '
                   f'stroke="{color}" stroke-width="{1.5 if color == MUTED else 2}"/>')
        peak = loc
        out.append(text(x(peak) + (-8 if color == MUTED else 8), y(stats.gumbel_r.pdf(peak, loc, scale) * 100) - 8,
                        label, "end" if color == MUTED else "start", "c " + ("m" if color == MUTED else "a")))
    out.append(f'<line x1="{x(40):.1f}" x2="{x(40):.1f}" y1="{top}" y2="{bottom}" stroke="{MUTED}" stroke-dasharray="3 3"/>')
    lines = [f"{lab}: {fmt_period(gumbel_sf(40, *f))} years" for lab, f in era_fits.items()]
    out.append(text(x(40) + 6, y(7.2), "40°F or more\n" + "\n".join(lines), "start", "c"))
    return svg(height, "Gumbel curves of each year's biggest reversal, early and recent record", out)


def main():
    iu_src = sys.argv[1] if len(sys.argv) > 1 else "/Users/rdevajji/.gemini/antigravity/brain/cfd48f46-1b3f-4027-9d1e-5632a63bfa2b/scratch/USC00120784.dly"
    kbmg_src = sys.argv[2] if len(sys.argv) > 2 else "/Users/rdevajji/.gemini/antigravity/brain/cfd48f46-1b3f-4027-9d1e-5632a63bfa2b/scratch/USW00003893.dly"

    days, v, iu_highs = load_dly(iu_src)
    _, _, kbmg_highs = load_dly(kbmg_src)

    all_cands = list(reversals(days, v, window=WINDOW, cutoff=20))
    all_revs = consolidate(all_cands, len(v))

    best = collections.defaultdict(lambda: None)
    for cand in reversals(days, v, window=WINDOW, cutoff=5):
        yr = days[cand[3]].year
        if best[yr] is None or cand[:2] > best[yr][:2]:
            best[yr] = cand

    valid = collections.Counter(d.year for d, t in zip(days, v) if t is not None)
    first, last = days[0].year, days[-1].year
    years = sorted(y for y in valid if first < y < last and
                   valid[y] / (366 if calendar.isleap(y) else 365) >= COVERAGE)
    years = sorted(set(years) | FORCED)
    maxima = np.array([best[y][0] for y in years], float)
    fit = stats.gumbel_r.fit(maxima)

    era_fits, era_info = {}, {}
    for lo, hi in ERAS:
        sub = np.array([best[y][0] for y in years if lo <= y <= hi], float)
        f = stats.gumbel_r.fit(sub)
        era_fits[f"{lo}–{hi}"] = f
        era_info[f"{lo}-{hi}"] = {
            "years": len(sub), "mean": round(sub.mean(), 1),
            "loc": round(f[0], 2), "scale": round(f[1], 2),
            "return_period": {lv: round(1 / gumbel_sf(lv, *f), 1) for lv in LEVELS}
        }

    FIGURES.mkdir(exist_ok=True)
    (FIGURES / "october-2026.svg").write_text(october_2026_figure(kbmg_highs))
    (FIGURES / "seasonality.svg").write_text(seasonality_figure(all_revs, days))
    (FIGURES / "timeline.svg").write_text(timeline_figure(all_revs, days))
    labelled = [y for y in years if best[y][0] >= 44]
    (FIGURES / "gumbel-rarity.svg").write_text(rarity_figure(maxima, fit, labelled))
    (FIGURES / "gumbel-eras.svg").write_text(eras_figure(era_fits))

    print("Generated all SVGs in:", FIGURES)


if __name__ == "__main__":
    main()
