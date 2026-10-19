/* Bloomington temperature reversals. NOAA data snapshot: 2026-10-18. */
(() => {
  "use strict";
  function mount(root, raw) {
    const DAY = 86400000;
    const q = (role) => root.querySelector(`[data-role="${role}"]`);
    const controls = {
      threshold: root.querySelector('[data-control="threshold"]'),
      window: root.querySelector('[data-control="window"]'),
    };
    const dateFmt = d3.utcFormat("%b %d, %Y"),
      shortFmt = d3.utcFormat("%Y-%m-%d");
    const colors = {
      weather: "var(--bw-muted)",
      events: "var(--bw-accent)",
      annual: "var(--bw-muted)",
      fit: "var(--bw-ink)",
    };
    const visible = { weather: true, events: true, annual: true, fit: true };
    const station = "iu";
    let windowDays = 3,
      threshold = +controls.threshold.value,
      dataset,
      baseEvents = [],
      events = [],
      annual = [],
      fits = {},
      selected = null,
      range = null;
    let pending = 0,
      brushing = false,
      lastWidth = 0,
      pinned = false;
    const priorFitPaths = new Map(),
      reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    const cache = new Map();

    function prepare(key) {
      const s = raw[key],
        start = Date.parse(s.start + "T00:00:00Z");
      const points = s.values.map((v, i) => ({ i, t: start + i * DAY, v }));
      const missing = [0];
      for (const p of points)
        missing.push(missing[missing.length - 1] + (p.v === null ? 1 : 0));
      const years = new Map();
      for (const p of points) {
        const year = new Date(p.t).getUTCFullYear();
        if (!years.has(year))
          years.set(year, { year, t: Date.UTC(year, 6, 1), valid: 0, sum: 0 });
        if (p.v !== null) {
          years.get(year).valid++;
          years.get(year).sum += p.v;
        }
      }
      const firstYear = new Date(start).getUTCFullYear(),
        lastYear = new Date(points.at(-1).t).getUTCFullYear();
      for (const y of years.values()) {
        y.days = (Date.UTC(y.year + 1, 0, 1) - Date.UTC(y.year, 0, 1)) / DAY;
        y.coverage = y.valid / y.days;
        y.eligible =
          y.year > firstYear && y.year < lastYear && y.coverage >= 0.95;
        y.temperature = y.valid ? y.sum / y.valid : null;
      }
      return {
        key,
        name: s.name,
        windowLabel: s.windowLabel,
        start,
        points,
        values: s.values,
        missing,
        years,
        domain: [start, points.at(-1).t],
      };
    }
    const prepared = { iu: prepare("iu") };

    function detect(s, w, cutoff = 5) {
      const candidates = [],
        v = s.values,
        n = v.length,
        m = s.missing;
      for (let left = 1; left <= w; left++)
        for (let right = 1; right <= w; right++) {
          for (let b = left; b < n - right; b++) {
            const a = b - left,
              c = b + right;
            if (m[c + 1] !== m[a]) continue;
            const first = v[b] - v[a],
              second = v[c] - v[b];
            const strength = Math.min(Math.abs(first), Math.abs(second));
            if (first * second < 0 && strength >= cutoff - 1e-9)
              candidates.push({
                a,
                b,
                c,
                first,
                second,
                strength,
                total: Math.abs(first) + Math.abs(second),
              });
          }
        }
      candidates.sort(
        (x, y) =>
          y.strength - x.strength ||
          y.total - x.total ||
          x.c - x.a - (y.c - y.a) ||
          x.a - y.a ||
          x.b - y.b ||
          x.c - y.c,
      );
      const used = new Uint8Array(n - 1),
        result = [];
      for (const e of candidates) {
        let blocked = false;
        for (let i = e.a; i < e.c; i++)
          if (used[i]) {
            blocked = true;
            break;
          }
        if (blocked) continue;
        used.fill(1, e.a, e.c);
        e.t = s.start + e.b * DAY;
        e.start = s.start + e.a * DAY;
        e.end = s.start + e.c * DAY;
        e.year = new Date(e.t).getUTCFullYear();
        e.id = `${s.key}-${w}-${e.a}-${e.b}-${e.c}`;
        result.push(e);
      }
      return result.sort((a, b) => a.b - b.b);
    }

    function invert(matrix) {
      const n = matrix.length,
        a = matrix.map((r, i) => [
          ...r,
          ...Array.from({ length: n }, (_, j) => Number(i === j)),
        ]);
      for (let i = 0; i < n; i++) {
        let pivot = i;
        for (let k = i + 1; k < n; k++)
          if (Math.abs(a[k][i]) > Math.abs(a[pivot][i])) pivot = k;
        if (Math.abs(a[pivot][i]) < 1e-12) return null;
        [a[i], a[pivot]] = [a[pivot], a[i]];
        const scale = a[i][i];
        a[i] = a[i].map((x) => x / scale);
        for (let k = 0; k < n; k++)
          if (k !== i) {
            const f = a[k][i];
            a[k] = a[k].map((x, j) => x - f * a[i][j]);
          }
      }
      return a.map((r) => r.slice(n));
    }
    const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
    function regress(rows) {
      const z = rows.filter((r) => Number.isFinite(r.value)),
        n = z.length,
        p = 2;
      if (n <= p + 2) return null;
      const center = d3.mean(z, (r) => r.year),
        X = z.map((r) =>
          Array.from({ length: p }, (_, j) => ((r.year - center) / 10) ** j),
        ),
        y = z.map((r) => r.value);
      const xtx = Array.from({ length: p }, (_, i) =>
          Array.from({ length: p }, (_, j) => d3.sum(X, (r) => r[i] * r[j])),
        ),
        inv = invert(xtx);
      if (!inv) return null;
      const beta = inv.map((r) =>
        dot(
          r,
          Array.from({ length: p }, (_, j) => d3.sum(X, (v, i) => v[j] * y[i])),
        ),
      );
      const residual = y.map((v, i) => v - dot(X[i], beta)),
        scores = X.map((r, i) => r.map((v) => v * residual[i]));
      const meat = Array.from({ length: p }, () => Array(p).fill(0));
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const lag = Math.abs(z[i].year - z[j].year);
          if (lag > 3) continue;
          const weight = 1 - lag / 4;
          for (let a = 0; a < p; a++)
            for (let b = 0; b < p; b++)
              meat[a][b] += weight * scores[i][a] * scores[j][b];
        }
      const cov = Array.from({ length: p }, (_, i) =>
        Array.from({ length: p }, (_, j) => {
          let sum = 0;
          for (let a = 0; a < p; a++)
            for (let b = 0; b < p; b++)
              sum += inv[i][a] * meat[a][b] * inv[b][j];
          return (sum * n) / (n - p);
        }),
      );
      const mean = d3.mean(y),
        ss = d3.sum(y, (v) => (v - mean) ** 2),
        r2 = ss ? 1 - d3.sum(residual, (v) => v * v) / ss : 0;
      function at(year) {
        const x = Array.from(
          { length: p },
          (_, j) => ((year - center) / 10) ** j,
        );
        let variance = 0;
        for (let i = 0; i < p; i++)
          for (let j = 0; j < p; j++) variance += x[i] * cov[i][j] * x[j];
        const value = dot(x, beta),
          se = Math.sqrt(Math.max(0, variance));
        return {
          year,
          t: Date.UTC(year, 6, 1),
          value,
          low: value - 1.96 * se,
          high: value + 1.96 * se,
        };
      }
      const extent = d3.extent(z, (r) => r.year),
        curve = d3
          .range(241)
          .map((i) => at(extent[0] + (i / 240) * (extent[1] - extent[0])));
      // Fractional years need fractional dates rather than Date.UTC's integer year.
      for (const r of curve) {
        const y0 = Math.floor(r.year);
        r.t =
          Date.UTC(y0, 6, 1) +
          (r.year - y0) * (Date.UTC(y0 + 1, 6, 1) - Date.UTC(y0, 6, 1));
      }
      return {
        n,
        power: 1,
        beta,
        cov,
        r2,
        center,
        curve,
        extent,
        at,
        slope: beta[1],
        slopeLow: beta[1] - 1.96 * Math.sqrt(Math.max(0, cov[1][1])),
        slopeHigh: beta[1] + 1.96 * Math.sqrt(Math.max(0, cov[1][1])),
      };
    }

    function updateData() {
      dataset = prepared[station];
      const key = station + "-" + windowDays;
      if (!cache.has(key)) cache.set(key, detect(dataset, windowDays));
      baseEvents = cache.get(key);
      // Detection is ordered by decreasing weaker-leg magnitude. Raising the
      // threshold only removes its tail; weaker candidates cannot block stronger ones.
      events = baseEvents.filter((e) => e.strength >= threshold - 1e-9);
      const groups = d3.group(events, (e) => e.year);
      annual = [...dataset.years.values()].map((y) => ({
        ...y,
        count: (groups.get(y.year) || []).length,
        intensity: d3.mean(groups.get(y.year) || [], (e) => e.strength),
      }));
      fits = {
        frequency: regress(
          annual
            .filter((y) => y.eligible)
            .map((y) => ({ year: y.year, value: y.count })),
        ),
        intensity: regress(
          annual
            .filter((y) => y.eligible)
            .map((y) => ({ year: y.year, value: y.intensity })),
        ),
      };
      if (!range) range = [...dataset.domain];
      range = [
        Math.max(range[0], dataset.domain[0]),
        Math.min(range[1], dataset.domain[1]),
      ];
      if (range[0] >= range[1]) range = [...dataset.domain];
      if (
        !selected ||
        !events.some((e) => e.id === selected.id) ||
        selected.t < range[0] ||
        selected.t > range[1]
      )
        selected =
          events
            .filter((e) => e.t >= range[0] && e.t <= range[1])
            .sort((a, b) => b.strength - a.strength || b.total - a.total)[0] ||
          null;
      render();
    }

    function fitText(fit, kind) {
      if (!fit) return "Too few qualifying years to fit a regression.";
      const decades = (fit.extent[1] - fit.extent[0]) / 10,
        label = kind === "frequency" ? "annual count" : "mean intensity",
        unit = kind === "frequency" ? "cycles" : "°F",
        fmt = d3.format("+.1f");
      return `Fitted ${label} change, ${fit.extent[0]}-${fit.extent[1]}: ${fmt(fit.slope * decades)} ${unit} · 95% interval ${fmt(fit.slopeLow * decades)} to ${fmt(fit.slopeHigh * decades)} ${unit} · R² ${fit.r2.toFixed(3)}`;
    }
    function selectionText(e) {
      if (!e) return "No complete cycles meet this threshold.";
      const v = dataset.values,
        fmt = d3.format(".0f");
      return `${dateFmt(new Date(e.start))} → ${dateFmt(new Date(e.t))} → ${dateFmt(new Date(e.end))} · ${fmt(v[e.a])} → ${fmt(v[e.b])} → ${fmt(v[e.c])}°F · ${d3.format("+.1f")(e.first)}° / ${d3.format("+.1f")(e.second)}° · ${e.b - e.a} + ${e.c - e.b} days`;
    }
    function hideTip() {
      q("tooltip").hidden = true;
      root
        .querySelectorAll("[data-chart-hover-guide],[data-chart-hover-marker]")
        .forEach((n) => (n.style.display = "none"));
    }
    function showTip(event, rows) {
      const tip = q("tooltip");
      tip.replaceChildren();
      for (const row of rows) {
        const div = document.createElement("div");
        div.textContent = row;
        tip.append(div);
      }
      tip.hidden = false;
      const rect = root.getBoundingClientRect(),
        tw = tip.offsetWidth,
        th = tip.offsetHeight;
      tip.style.left =
        Math.max(0, Math.min(rect.width - tw, event.clientX - rect.left + 14)) +
        "px";
      tip.style.top = Math.max(0, event.clientY - rect.top - th - 12) + "px";
    }
    function formatDateAxis(g, scale, width) {
      const ticks = width < 420 ? 3 : Math.max(4, Math.floor(width / 125));
      const span = (scale.domain()[1] - scale.domain()[0]) / DAY;
      g.call(
        d3
          .axisBottom(scale)
          .ticks(ticks)
          .tickFormat(
            d3.utcFormat(span <= 60 ? "%b %d" : span < 500 ? "%b %Y" : "%Y"),
          )
          .tickSizeOuter(0),
      );
    }
    function frame(
      role,
      height,
      yDomain,
      yTitle,
      { top = 24, xDomain = range } = {},
    ) {
      const el = q(role),
        width = Math.max(280, el.getBoundingClientRect().width),
        m = { left: 70, right: 18, top, bottom: 48 };
      const svg = d3
        .select(el)
        .selectAll("svg")
        .data([0])
        .join("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height)
        .attr("role", "img")
        .attr("aria-label", yTitle + " across the historical record");
      svg.selectAll("*").remove();
      svg.append("title").text(yTitle + " across the historical record");
      const extent = d3.extent(yDomain.filter(Number.isFinite)),
        padding = Math.max((extent[1] - extent[0]) * 0.09, 1),
        domain = [extent[0] - padding, extent[1] + padding];
      if (!Number.isFinite(domain[0])) domain.splice(0, 2, 0, 1);
      const x = d3
        .scaleUtc()
        .domain(xDomain.map((t) => new Date(t)))
        .range([m.left + 4, width - m.right - 4]);
      const y = d3
        .scaleLinear()
        .domain(domain)
        .nice()
        .range([height - m.bottom - 4, m.top + 4]);
      const left = m.left,
        right = width - m.right,
        bottom = height - m.bottom;
      const id = root.id + "-clip-" + role;
      svg
        .append("defs")
        .append("clipPath")
        .attr("id", id)
        .append("rect")
        .attr("x", left)
        .attr("y", top)
        .attr("width", right - left)
        .attr("height", bottom - top);
      svg
        .append("g")
        .attr("class", "bw-grid")
        .attr("transform", `translate(${left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickSize(-(right - left))
            .tickFormat(""),
        );
      svg
        .append("rect")
        .attr("data-chart-frame", "")
        .attr("x", left)
        .attr("y", top)
        .attr("width", right - left)
        .attr("height", bottom - top)
        .attr("fill", "none")
        .attr("stroke", "var(--bw-rule)")
        .attr("stroke-width", 1);
      const xAxis = svg
        .append("g")
        .attr("class", "bw-x-axis")
        .attr("transform", `translate(0,${bottom})`);
      formatDateAxis(xAxis, x, width);
      svg
        .append("g")
        .attr("class", "bw-y-axis")
        .attr("transform", `translate(${left},0)`)
        .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));
      svg
        .append("text")
        .attr("class", "axis-title")
        .attr("data-axis", "x")
        .attr("x", (left + right) / 2)
        .attr("y", height - 7)
        .attr("text-anchor", "middle")
        .text("Reporting date");
      svg
        .append("text")
        .attr("class", "axis-title")
        .attr("data-axis", "y")
        .attr("transform", `translate(17,${(top + bottom) / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text(yTitle);
      const plot = svg.append("g").attr("clip-path", `url(#${id})`);
      const guide = svg
        .append("line")
        .attr("data-chart-hover-guide", "")
        .attr("y1", top)
        .attr("y2", bottom)
        .attr("stroke", "var(--bw-ink)")
        .attr("stroke-width", 1)
        .style("display", "none");
      return {
        el,
        svg,
        plot,
        x,
        y,
        width,
        height,
        m,
        left,
        right,
        top,
        bottom,
        guide,
      };
    }
    function seriesPath(
      plot,
      values,
      x,
      y,
      value,
      color,
      width = 1.5,
      opacity = 1,
    ) {
      return plot
        .append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", width)
        .attr("opacity", opacity)
        .attr(
          "d",
          d3
            .line()
            .defined((d) => Number.isFinite(value(d)))
            .x((d) => x(d.t))
            .y((d) => y(value(d))),
        );
    }
    function dots(plot, values, x, y, value, color, r = 3, opacity = 1) {
      return plot
        .selectAll(null)
        .data(values.filter((d) => Number.isFinite(value(d))))
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.t))
        .attr("cy", (d) => y(value(d)))
        .attr("r", r)
        .attr("fill", color)
        .attr("opacity", opacity);
    }
    function dateTemperature(t) {
      const i = (t - dataset.start) / DAY,
        a = Math.floor(i),
        b = Math.ceil(i),
        v = dataset.values;
      if (a < 0 || b >= v.length || v[a] === null || v[b] === null) return null;
      return a === b ? v[a] : v[a] + (v[b] - v[a]) * (i - a);
    }
    function eventAtPixel(f, px, py, values, value) {
      return (
        d3.least(
          values,
          (e) => (f.x(e.t) - px) ** 2 + (f.y(value(e)) - py) ** 2,
        ) || null
      );
    }
    function yearAt(t) {
      const year = new Date(t).getUTCFullYear();
      return (
        year +
        (t - Date.UTC(year, 6, 1)) /
          (Date.UTC(year + 1, 6, 1) - Date.UTC(year, 6, 1))
      );
    }
    function hoverOverlay(f, handler, onPick) {
      const overlay = f.svg
        .append("rect")
        .attr("data-chart-hit", "")
        .attr("data-chart-hover-overlay", "cross-series")
        .attr("x", f.left)
        .attr("y", f.top)
        .attr("width", f.right - f.left)
        .attr("height", f.bottom - f.top)
        .attr("fill", "transparent");
      const move = (event) => {
        const [px, py] = d3.pointer(event, f.svg.node()),
          t = +f.x.invert(px);
        f.guide.attr("x1", px).attr("x2", px).style("display", null);
        handler(event, t, px, py);
      };
      overlay
        .on("pointermove", (event) => {
          if (!pinned) move(event);
        })
        .on("pointerleave", () => {
          if (!pinned) hideTip();
        })
        .on("click", (event) => {
          if (onPick) {
            const [px, py] = d3.pointer(event, f.svg.node());
            onPick(+f.x.invert(px), px, py);
          }
          if (event.pointerType === "touch") {
            pinned = !pinned;
            move(event);
          }
        });
      return overlay;
    }
    function annotate(f, eventList, value, weather = false, limit = null) {
      const candidates = [
        ...(selected ? [selected] : []),
        ...[...eventList].sort(
          (a, b) => b.strength - a.strength || b.total - a.total,
        ),
      ];
      const seen = new Set(),
        placed = [];
      const max = limit ?? (f.width < 430 ? 1 : 3);
      for (const e of candidates) {
        if (seen.has(e.id) || e.t < range[0] || e.t > range[1]) continue;
        seen.add(e.id);
        const lines = weather
          ? [
              dateFmt(new Date(e.t)),
              [e.a, e.b, e.c]
                .map((i) => d3.format(".0f")(dataset.values[i]))
                .join(" → ") + "°F",
            ]
          : [
              dateFmt(new Date(e.t)),
              `${e.strength.toFixed(1)}°F smaller change`,
            ];
        const g = f.svg.append("g").attr("data-callout", e.id);
        const text = g
          .append("text")
          .attr("class", "bw-callout")
          .attr("y", 18)
          .attr("text-anchor", "start");
        lines.forEach((line, i) =>
          text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", i ? 15 : 0)
            .text(line),
        );
        const box = text.node().getBBox();
        const x0 = Math.max(
          f.left + 4,
          Math.min(f.right - box.width - 4, f.x(e.t) - box.width / 2),
        );
        if (
          placed.some((b) => x0 < b.right + 8 && x0 + box.width > b.left - 8)
        ) {
          g.remove();
          continue;
        }
        text.attr("transform", `translate(${x0},0)`);
        const y0 = f.y(value(e)),
          px = f.x(e.t);
        g.insert("path", "text")
          .attr("d", `M${px},${y0}L${px},${f.top + 2}L${x0 + box.width / 2},45`)
          .attr("stroke", "var(--bw-muted)")
          .attr("stroke-width", 1)
          .attr("fill", "none");
        placed.push({ left: x0, right: x0 + box.width });
        if (placed.length >= max) break;
      }
    }

    function drawEvents() {
      const viewEvents = events.filter(
        (e) => e.t >= range[0] && e.t <= range[1],
      );
      const f = frame(
        "weather-chart",
        260,
        [threshold, ...viewEvents.map((e) => e.strength)],
        "Reversal size (°F)",
        { top: 53 },
      );
      f.plot
        .append("line")
        .attr("x1", f.left)
        .attr("x2", f.right)
        .attr("y1", f.y(threshold))
        .attr("y2", f.y(threshold))
        .attr("stroke", "var(--bw-rule)")
        .attr("stroke-dasharray", "3,4");
      dots(
        f.plot,
        viewEvents,
        f.x,
        f.y,
        (e) => e.strength,
        colors.events,
        2.4,
        0.55,
      ).attr("data-event-point", (e) => e.id);
      if (selected && viewEvents.some((e) => e.id === selected.id)) {
        f.plot
          .append("circle")
          .attr("cx", f.x(selected.t))
          .attr("cy", f.y(selected.strength))
          .attr("r", 5)
          .attr("fill", "none")
          .attr("stroke", "var(--bw-ink)")
          .attr("stroke-width", 1.2);
        annotate(f, [selected], (e) => e.strength, false, 1);
      }
      if (!viewEvents.length)
        f.svg
          .append("text")
          .attr("x", (f.left + f.right) / 2)
          .attr("y", (f.top + f.bottom) / 2)
          .attr("text-anchor", "middle")
          .text("No cycles in this view");
      const marker = f.svg
        .append("circle")
        .attr("data-chart-hover-marker", "event")
        .attr("r", 5)
        .attr("fill", "none")
        .attr("stroke", "var(--bw-ink)")
        .style("display", "none");
      const overlay = hoverOverlay(
        f,
        (event, t, px, py) => {
          f.guide.style("display", "none");
          const e = eventAtPixel(f, px, py, viewEvents, (e) => e.strength);
          if (e) {
            marker
              .attr("cx", f.x(e.t))
              .attr("cy", f.y(e.strength))
              .style("display", null);
            showTip(event, [
              selectionText(e),
              `Cycle intensity: ${e.strength.toFixed(1)}°F (smaller of the two changes)`,
            ]);
          }
        },
        (t, px, py) => {
          const e = eventAtPixel(f, px, py, viewEvents, (e) => e.strength);
          if (e) {
            selected = e;
            render();
          }
        },
      );
      overlay.attr("data-chart-hover-overlay", "nearest-event");
    }

    function drawSelectedEvent() {
      q("event-detail").hidden = !selected;
      if (!selected) {
        d3.select(q("event-chart")).selectAll("*").remove();
        return;
      }
      const e = selected,
        a = Math.max(0, e.a - 7),
        c = Math.min(dataset.points.length - 1, e.c + 7),
        shown = dataset.points.slice(a, c + 1);
      const f = frame(
        "event-chart",
        260,
        shown.map((p) => (p.v === null ? NaN : p.v)),
        "Daily high (°F)",
        { top: 60, xDomain: [shown[0].t, shown.at(-1).t] },
      );
      f.plot
        .append("rect")
        .attr("x", f.x(e.start))
        .attr("width", f.x(e.end) - f.x(e.start))
        .attr("y", f.top)
        .attr("height", f.bottom - f.top)
        .attr("fill", colors.events)
        .attr("fill-opacity", 0.05);
      seriesPath(
        f.plot,
        shown,
        f.x,
        f.y,
        (p) => (p.v === null ? NaN : p.v),
        colors.weather,
        1.4,
        0.8,
      );
      dots(
        f.plot,
        shown,
        f.x,
        f.y,
        (p) => (p.v === null ? NaN : p.v),
        colors.weather,
        2,
        0.6,
      );
      const pivotPoints = [e.a, e.b, e.c].map((i) => dataset.points[i]);
      seriesPath(
        f.plot,
        dataset.points.slice(e.a, e.c + 1),
        f.x,
        f.y,
        (p) => p.v,
        colors.events,
        2,
      );
      dots(f.plot, pivotPoints, f.x, f.y, (p) => p.v, colors.events, 3.5);
      pivotPoints.forEach((p, j) => {
        const anchor = j === 0 ? "start" : j === 2 ? "end" : "middle",
          labelX =
            j === 0
              ? f.left + 5
              : j === 2
                ? f.right - 5
                : (f.left + f.right) / 2;
        const text = f.svg
          .append("text")
          .attr("class", "bw-callout")
          .attr("x", labelX)
          .attr("y", 18)
          .attr("text-anchor", anchor);
        text
          .append("tspan")
          .attr("x", labelX)
          .text(d3.utcFormat("%b %d")(new Date(p.t)));
        text
          .append("tspan")
          .attr("x", labelX)
          .attr("dy", 15)
          .text(`${d3.format(".0f")(p.v)}°F`);
        f.svg
          .insert("path", ":first-child")
          .attr(
            "d",
            `M${labelX},40L${f.x(p.t)},${f.top + 2}L${f.x(p.t)},${f.y(p.v)}`,
          )
          .attr("stroke", "var(--bw-rule)")
          .attr("fill", "none");
      });
      const marker = f.svg
        .append("circle")
        .attr("data-chart-hover-marker", "temperature")
        .attr("r", 4)
        .attr("fill", colors.weather)
        .style("display", "none");
      hoverOverlay(f, (event, t, px) => {
        const value = dateTemperature(t);
        if (value !== null)
          marker.attr("cx", px).attr("cy", f.y(value)).style("display", null);
        else marker.style("display", "none");
        showTip(event, [
          dateFmt(new Date(t)),
          value === null ? "Temperature missing" : `${value.toFixed(1)}°F`,
        ]);
      });
    }

    function fitLayer(f, fit, kind) {
      if (!visible.fit || !fit) return;
      const bandPath = d3
        .area()
        .x((d) => f.x(d.t))
        .y0((d) => f.y(d.low))
        .y1((d) => f.y(d.high))(fit.curve);
      const linePath = d3
        .line()
        .x((d) => f.x(d.t))
        .y((d) => f.y(d.value))(fit.curve);
      const band = f.plot
        .append("path")
        .attr("fill", colors.fit)
        .attr("fill-opacity", 0.07)
        .attr("d", bandPath);
      const line = f.plot
        .append("path")
        .attr("fill", "none")
        .attr("stroke", colors.fit)
        .attr("stroke-width", 1.5)
        .attr(
          "stroke-dasharray",
          fit.slopeLow <= 0 && fit.slopeHigh >= 0 ? "4,3" : null,
        )
        .attr("d", linePath);
      const old = priorFitPaths.get(kind);
      // All regression paths use the same 241 normalized samples for smooth updates.
      if (old && !reduceMotion) {
        band.attr("d", old.band).transition().duration(220).attr("d", bandPath);
        line.attr("d", old.line).transition().duration(220).attr("d", linePath);
      }
      priorFitPaths.set(kind, { band: bandPath, line: linePath });
    }
    function linearInterpolate(rows, t, key) {
      if (!rows.length || t < rows[0].t || t > rows.at(-1).t) return null;
      const j = d3.bisector((d) => d.t).left(rows, t),
        a = rows[Math.max(0, j - 1)],
        b = rows[Math.min(rows.length - 1, j)];
      if (
        !Number.isFinite(a[key]) ||
        !Number.isFinite(b[key]) ||
        b.year - a.year > 1
      )
        return null;
      return a.t === b.t
        ? a[key]
        : a[key] + ((b[key] - a[key]) * (t - a.t)) / (b.t - a.t);
    }
    function drawTrend(kind) {
      const fit = fits[kind],
        key = kind === "frequency" ? "count" : "intensity";
      const observed = annual.filter((y) => y.eligible),
        view = observed.filter((y) => y.t >= range[0] && y.t <= range[1]);
      const domain = view.map((y) => y[key]);
      if (fit && visible.fit) {
        for (const p of fit.curve)
          if (p.t >= range[0] && p.t <= range[1]) domain.push(p.low, p.high);
        for (const t of range) {
          const year = yearAt(t);
          if (year >= fit.extent[0] && year <= fit.extent[1]) {
            const p = fit.at(year);
            domain.push(p.low, p.high);
          }
        }
      }
      if (kind === "frequency") domain.push(0);
      const f = frame(
        kind + "-chart",
        210,
        domain,
        kind === "intensity" ? "Annual mean size (°F)" : "Cycles / year",
        { top: 18 },
      );
      fitLayer(f, fit, kind);
      if (visible.annual) {
        // Retain excluded years as null to break the line instead of bridging gaps.
        seriesPath(
          f.plot,
          annual,
          f.x,
          f.y,
          (y) => (y.eligible && Number.isFinite(y[key]) ? y[key] : NaN),
          colors.annual,
          1.2,
          0.8,
        );
        dots(f.plot, view, f.x, f.y, (y) => y[key], colors.annual, 3.2);
      }
      const markers = {};
      for (const name of ["annual", "fit"])
        markers[name] = f.svg
          .append("circle")
          .attr("data-chart-hover-marker", name)
          .attr("r", 4)
          .attr("fill", colors[name])
          .style("display", "none");
      hoverOverlay(f, (event, t, px) => {
        const rows = [dateFmt(new Date(t))];
        // The guide and markers stay at the cursor; each continuous series is interpolated there.
        const av = visible.annual
          ? linearInterpolate(
              annual.map((y) => ({ ...y, [key]: y.eligible ? y[key] : null })),
              t,
              key,
            )
          : null;
        const yearFraction = yearAt(t);
        const fv =
          visible.fit &&
          fit &&
          yearFraction >= fit.extent[0] &&
          yearFraction <= fit.extent[1]
            ? fit.at(yearFraction).value
            : null;
        for (const [name, value, label] of [
          [
            "annual",
            av,
            kind === "frequency" ? "Annual frequency" : "Annual mean intensity",
          ],
          ["fit", fv, "Regression"],
        ]) {
          if (value !== null && Number.isFinite(value)) {
            markers[name]
              .attr("cx", px)
              .attr("cy", f.y(value))
              .style("display", null);
            rows.push(
              `${label}: ${value.toFixed(2)} ${kind === "frequency" ? "cycles/year" : "°F"}`,
            );
          } else markers[name].style("display", "none");
        }
        if (rows.length === 1) rows.push("No qualifying annual value here.");
        showTip(event, rows);
      });
      return f;
    }

    function drawOverview() {
      const f = frame(
        "overview-chart",
        95,
        annual.map((y) => y.temperature),
        "°F high",
        { top: 6, xDomain: dataset.domain },
      );
      f.svg.select('.axis-title[data-axis="x"]').remove();
      f.svg.select('.axis-title[data-axis="y"]').remove();
      f.svg.select(".bw-y-axis").remove();
      f.svg.select(".bw-grid").remove();
      seriesPath(
        f.plot,
        annual,
        f.x,
        f.y,
        (y) => y.temperature,
        colors.weather,
        1.2,
        0.7,
      );
      const brush = d3
        .brushX()
        .handleSize(window.matchMedia("(pointer: coarse)").matches ? 44 : 10)
        .extent([
          [f.left, f.top],
          [f.right, f.bottom],
        ])
        .on("end", (event) => {
          if (!event.sourceEvent || brushing) return;
          const r = event.selection
            ? event.selection.map(f.x.invert).map(Number)
            : [...dataset.domain];
          if (r[1] - r[0] < 14 * DAY) {
            const mid = (r[0] + r[1]) / 2;
            r[0] = mid - 7 * DAY;
            r[1] = mid + 7 * DAY;
          }
          range = [
            Math.max(dataset.domain[0], r[0]),
            Math.min(dataset.domain[1], r[1]),
          ];
          if (!selected || selected.t < range[0] || selected.t > range[1])
            selected =
              [...events]
                .filter((e) => e.t >= range[0] && e.t <= range[1])
                .sort(
                  (a, b) => b.strength - a.strength || b.total - a.total,
                )[0] || null;
          hideTip();
          render();
        });
      const g = f.svg.append("g").attr("class", "bw-brush").call(brush);
      brushing = true;
      g.call(brush.move, range.map(f.x));
      brushing = false;
    }
    function declutter() {
      // Measure all text after drawing; first remove optional overlapping callouts.
      for (const svg of root.querySelectorAll(".bw-chart svg")) {
        const seen = [];
        for (const el of svg.querySelectorAll(".bw-x-axis .tick text")) {
          const b = el.getBoundingClientRect();
          if (seen.some((a) => b.left < a.right + 4 && b.right > a.left - 4))
            el.parentNode.remove();
          else seen.push(b);
        }
        const ticks = [...svg.querySelectorAll(".tick text,.axis-title")].map(
          (n) => n.getBoundingClientRect(),
        );
        for (const text of svg.querySelectorAll("[data-callout] text")) {
          const b = text.getBoundingClientRect();
          if (
            ticks.some(
              (a) =>
                b.left < a.right + 4 &&
                b.right > a.left - 4 &&
                b.top < a.bottom + 4 &&
                b.bottom > a.top - 4,
            )
          )
            text.parentNode.remove();
        }
      }
    }
    function render() {
      hideTip();
      q("record-label").textContent =
        `${dataset.name} · ${dateFmt(new Date(dataset.domain[0]))}-${dateFmt(new Date(dataset.domain[1]))}`;
      q("window-label").textContent = dataset.windowLabel;
      q("threshold-value").textContent =
        `${threshold}°F (${d3.format(".1~f")(threshold / 1.8)}°C)`;
      q("selection").textContent = selectionText(selected);
      const median = d3.median(events, (e) => e.c - e.a),
        inView = events.filter((e) => e.t >= range[0] && e.t <= range[1]);
      q("event-count").textContent =
        `${events.length.toLocaleString()} complete cycles${inView.length !== events.length ? ` · ${inView.length} in view` : ""}${median ? ` · median full-cycle span: ${median} days (both changes combined)` : ""}`;
      const index = selected
        ? inView.findIndex((e) => e.id === selected.id)
        : -1;
      q("event-prev").disabled = index <= 0;
      q("event-next").disabled = index < 0 || index >= inView.length - 1;
      q("period-label").textContent =
        `Visible period: ${shortFmt(new Date(range[0]))}-${shortFmt(new Date(range[1]))} · drag the brush handles to zoom`;
      q("intensity-fit").textContent = fitText(fits.intensity, "intensity");
      q("frequency-fit").textContent = fitText(fits.frequency, "frequency");
      const eligible = annual.filter((y) => y.eligible);
      q("fit-scope").textContent =
        `Linear fits use the full record: ${eligible.length} complete years have ≥95% valid temperatures. Frequency includes zero-cycle years; intensity uses the ${fits.intensity?.n || 0} years with qualifying cycles. Partial years and gaps are excluded. Reported change compares the first and last fitted years. Bands: approximate 95% uncertainty, autocorrelation robust through 3 calendar years. Intensity = smaller of the two absolute temperature changes. Regressions fit annual values, not individual events. The band represents uncertainty in the mean trend, not a prediction interval.`;
      root
        .querySelectorAll("[data-series]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", String(visible[el.dataset.series])),
        );
      drawEvents();
      drawOverview();
      drawSelectedEvent();
      drawTrend("intensity");
      drawTrend("frequency");
      declutter();
      q("status").textContent = "";
      root.dataset.ready = "true";
      root.dataset.events = events.length;
    }
    function schedule(rebuild = true) {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        if (rebuild) updateData();
        else render();
      });
    }
    controls.threshold.addEventListener("input", () => {
      threshold = +controls.threshold.value;
      schedule();
    });
    controls.window.addEventListener("change", () => {
      windowDays = +controls.window.value;
      selected = null;
      schedule();
    });
    for (const [role, step] of [
      ["event-prev", -1],
      ["event-next", 1],
    ])
      q(role).addEventListener("click", () => {
        const inView = events.filter((e) => e.t >= range[0] && e.t <= range[1]),
          index = inView.findIndex((e) => e.id === selected?.id);
        if (inView[index + step]) {
          selected = inView[index + step];
          render();
        }
      });
    root.querySelectorAll("[data-series]").forEach((el) => {
      el.classList.add("cursor-interaction");
      el.addEventListener("click", () => {
        visible[el.dataset.series] = !visible[el.dataset.series];
        schedule(false);
      });
    });

    new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (Math.abs(w - lastWidth) > 1) {
        lastWidth = w;
        if (dataset) schedule(false);
      }
    }).observe(root);

    // Small public read-only hooks support reproducibility checks without a server.
    root.whiplash = {
      detect,
      regress,
      prepared,
      getState: () => ({
        station,
        windowDays,
        threshold,
        events,
        annual,
        fits,
        range,
      }),
      selectEvent: (id) => {
        const e = events.find((e) => e.id === id);
        if (e) {
          selected = e;
          render();
        }
      },
    };
    updateData();
  }
  const data = new Map();
  for (const root of document.querySelectorAll("[data-whiplash]")) {
    if (root.dataset.initialized) continue;
    root.dataset.initialized = "true";
    const url = root.dataset.source;
    if (!data.has(url))
      data.set(
        url,
        fetch(url).then((response) => {
          if (!response.ok) throw new Error("Unable to load observations.");
          return response.json();
        }),
      );
    data
      .get(url)
      .then((raw) => mount(root, raw))
      .catch((error) => {
        const status = root.querySelector('[data-role="status"]');
        status.textContent =
          "The chart could not load. Please reload to try again.";
        status.classList.add("bw-error");
        console.error(error);
      });
  }
})();
