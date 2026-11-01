"""Static figures for the snip-snap post: one reversal up close and Gumbel curves.

Usage: python3 build_gumbel_figures.py [path/to/USC00120784.dly]
Without a path, the latest NOAA GHCN-Daily file is downloaded to a temp dir.
Writes SVGs to static/posts/whiplash/figures/ and a numeric summary to
static/posts/whiplash/data/gumbel-summary.json. Requires numpy and scipy.
"""
import calendar
import collections
import datetime as dt
import json
import pathlib
import sys
import tempfile
import urllib.request

import numpy as np
from scipy import stats

URL = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USC00120784.dly"
POST = pathlib.Path(__file__).resolve().parent  # static/posts/whiplash
FIGURES, DATA = POST / "figures", POST / "data"
WINDOW = 3  # maximum days for each change, as in the original post
COVERAGE = 0.95
# Partial years kept in the fit: their biggest reversal (44°F) already ties the
# record, and missing days can only hide a larger one. See the post's methods.
FORCED = {2019, 2026}
ERAS = ((1896, 1960), (1961, 2026))
LEVELS = (35, 40, 44)

# Palette and geometry from whiplash.css / whiplash.js.
INK, MUTED, RULE, PAPER, ACCENT = "#444", "#888", "#ddd", "#fff", "#c46b6b"
W, M = 720, {"left": 70, "right": 18, "bottom": 48}


def load(path):
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
    return days, [highs.get(d) for d in days]


def reversals(days, v):
    """All warm-cold-warm / cold-warm-cold candidates with both changes complete."""
    n = len(v)
    for b in range(1, n - 1):
        if v[b] is None:
            continue
        for left in range(1, WINDOW + 1):
            a = b - left
            if a < 0 or None in v[a:b]:
                continue
            first = v[b] - v[a]
            for right in range(1, WINDOW + 1):
                c = b + right
                if c >= n or None in v[b:c + 1]:
                    continue
                second = v[c] - v[b]
                if first * second < 0:
                    yield min(abs(first), abs(second)), abs(first) + abs(second), a, b, c


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
    for t in yticks:  # light grid, as in .bw-grid
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
    return lambda v: r0 + (v - d0) / (d1 - d0) * (r1 - r0)


def path(points):
    return "M" + "L".join(f"{px:.1f},{py:.1f}" for px, py in points)


# ---------- figures ----------
def event_figure(days, v, event):
    _, _, a, b, c = event
    lo, hi = a - 7, c + 7
    shown = list(range(lo, hi + 1))
    height, top = 260, 60
    left, right, bottom = M["left"], W - M["right"], height - M["bottom"]
    x = linear(lo, hi, left + 4, right - 4)
    vals = [v[i] for i in shown if v[i] is not None]
    y0, y1 = 10 * (min(vals) // 10), 10 * (max(vals) // 10 + 1)
    y = linear(y0, y1, bottom - 4, top + 4)
    xt = [i for i in shown if days[i].day % 5 == 0]
    out = frame(height, top, x, y, xt, range(int(y0), int(y1) + 1, 20), "Reporting date",
                "Daily high (°F)", lambda i: days[i].strftime("%b %-d"), lambda t: f"{t}")
    out.append(f'<rect x="{x(a):.1f}" y="{top}" width="{x(c) - x(a):.1f}" height="{bottom - top}" '
               f'fill="{ACCENT}" fill-opacity=".05"/>')
    runs, run = [], []
    for i in shown:
        if v[i] is None:
            runs, run = runs + [run], []
        else:
            run.append((x(i), y(v[i])))
    for r in runs + [run]:
        if len(r) > 1:
            out.append(f'<path d="{path(r)}" fill="none" stroke="{MUTED}" stroke-width="1.4" opacity=".8"/>')
    out += [f'<circle cx="{x(i):.1f}" cy="{y(v[i]):.1f}" r="2" fill="{MUTED}" opacity=".6"/>'
            for i in shown if v[i] is not None]
    out.append(f'<path d="{path([(x(i), y(v[i])) for i in range(a, c + 1)])}" fill="none" '
               f'stroke="{ACCENT}" stroke-width="2"/>')
    for j, i in enumerate((a, b, c)):
        lx = left + 5 if j == 0 else right - 5 if j == 2 else (left + right) / 2
        out.insert(0, f'<path d="M{lx:.1f},40L{x(i):.1f},{top + 2}L{x(i):.1f},{y(v[i]):.1f}" '
                      f'stroke="{RULE}" fill="none"/>')
        out.append(f'<circle cx="{x(i):.1f}" cy="{y(v[i]):.1f}" r="3.5" fill="{ACCENT}"/>')
        out.append(text(lx, 18, f"{days[i]:%b %-d}\n{v[i]}°F", ("start", "middle", "end")[j], "c"))
    return svg(height, f"Daily highs around the {days[b]:%B %Y} reversal", out)


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
    for lo, k in counts.items():  # 2°F bins, scaled to % per °F
        h = k / len(maxima) / 2 * 100
        out.append(f'<rect x="{x(lo) + 1:.1f}" y="{y(h):.1f}" width="{x(lo + 2) - x(lo) - 2:.1f}" '
                   f'height="{bottom - y(h):.1f}" fill="{MUTED}" fill-opacity=".22"/>')
    xs, ys = curve(loc, scale)
    tail = xs >= 44
    out.append(f'<path d="{area(x, y, xs[tail], ys[tail], bottom)}" fill="{ACCENT}" fill-opacity=".45"/>')
    out.append(f'<path d="{path([(x(a), y(b)) for a, b in zip(xs, ys)])}" fill="none" stroke="{INK}" stroke-width="1.5"/>')
    heights = {35: 11, 40: 8, 44: 5}  # staggered so labels clear each other
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
        peak = loc  # Gumbel mode
        out.append(text(x(peak) + (-8 if color == MUTED else 8), y(stats.gumbel_r.pdf(peak, loc, scale) * 100) - 8,
                        label, "end" if color == MUTED else "start", "c " + ("m" if color == MUTED else "a")))
    out.append(f'<line x1="{x(40):.1f}" x2="{x(40):.1f}" y1="{top}" y2="{bottom}" stroke="{MUTED}" stroke-dasharray="3 3"/>')
    lines = [f"{lab}: {fmt_period(gumbel_sf(40, *f))} years" for lab, f in era_fits.items()]
    out.append(text(x(40) + 6, y(7.2), "40°F or more\n" + "\n".join(lines), "start", "c"))
    return svg(height, "Gumbel curves of each year's biggest reversal, early and recent record", out)


def main():
    if len(sys.argv) > 1:
        src = sys.argv[1]
    else:
        src = pathlib.Path(tempfile.gettempdir()) / "USC00120784.dly"
        urllib.request.urlretrieve(URL, src)
    days, v = load(src)
    best = collections.defaultdict(lambda: None)
    for cand in reversals(days, v):
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

    rng = np.random.default_rng(1895)
    boot = np.array([stats.gumbel_r.fit(rng.choice(maxima, len(maxima))) for _ in range(1000)])
    era_fits, era_info = {}, {}
    for lo, hi in ERAS:
        sub = np.array([best[y][0] for y in years if lo <= y <= hi], float)
        f = stats.gumbel_r.fit(sub)
        era_fits[f"{lo}–{hi}"] = f
        era_info[f"{lo}-{hi}"] = {"years": len(sub), "mean": round(sub.mean(), 1),
                                  "loc": round(f[0], 2), "scale": round(f[1], 2),
                                  "return_period": {lv: round(1 / gumbel_sf(lv, *f), 1) for lv in LEVELS}}
    ks = stats.kstest(maxima, stats.gumbel_r.cdf, args=fit).pvalue
    last_valid = max(d for d, t in zip(days, v) if t is not None)

    FIGURES.mkdir(exist_ok=True)  # March 2026 cycle (ties 2019 at 44°F)
    (FIGURES / "march-2026.svg").write_text(event_figure(days, v, best[2026]))
    labelled = [y for y in years if best[y][0] >= 44]
    (FIGURES / "gumbel-rarity.svg").write_text(rarity_figure(maxima, fit, labelled))
    (FIGURES / "gumbel-eras.svg").write_text(eras_figure(era_fits))

    summary = {
        "source": URL, "downloaded": dt.date.today().isoformat(), "last_valid_day": last_valid.isoformat(),
        "window_days": WINDOW, "years": len(years), "forced_partial_years": sorted(FORCED),
        "partial_year_coverage": {y: valid[y] for y in sorted(FORCED)},
        "gumbel": {"loc": round(fit[0], 2), "scale": round(fit[1], 2), "ks_p": round(ks, 2)},
        "return_period": {lv: {"gumbel": round(1 / gumbel_sf(lv, *fit), 1),
                               "observed": round(len(maxima) / max((maxima >= lv).sum(), 1), 1),
                               "observed_years": int((maxima >= lv).sum()),
                               "bootstrap_90": [round(float(q), 0) for q in np.percentile(
                                   [1 / gumbel_sf(lv, *b) for b in boot], [5, 95])]}
                          for lv in LEVELS},
        "eras": era_info,
        "top_years": [{"year": y, "intensity": best[y][0],
                       "temps": [v[best[y][i]] for i in (2, 3, 4)],
                       "dates": [days[best[y][i]].isoformat() for i in (2, 3, 4)]}
                      for y in sorted(years, key=lambda y: -best[y][0])[:5]],
    }
    (DATA / "gumbel-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
