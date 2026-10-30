/* Paired annual station differences; aggregate data preserve identical samples. */
(() => {
  "use strict";
  for (const root of document.querySelectorAll("[data-station-comparison]")) {
    const q = (name) => root.querySelector(`[data-comparison="${name}"]`);
    fetch(root.dataset.source)
      .then((response) => {
        if (!response.ok)
          throw new Error("Unable to load paired observations.");
        return response.json();
      })
      .then((data) => {
        const f = d3.format(".2f"),
          signed = d3.format("+.2f");
        const describe = (s, units) =>
          `${f(Math.abs(s.difference))}°F ${s.difference >= 0 ? units[0] : units[1]}`;
        function plot(container, records, label, lag) {
          const width = Math.max(260, root.clientWidth),
            height = 205;
          const margin = { left: 52, right: 12, top: 22, bottom: 30 };
          const full = d3
            .range(data.years[0], data.years.at(-1) + 1)
            .map(
              (year) =>
                records.find((p) => p.year === year) || {
                  year,
                  difference: null,
                },
            );
          const bound = Math.max(
            0.25,
            d3.max(records, (p) => Math.abs(p.difference)) * 1.2,
          );
          const x = d3
            .scaleLinear()
            .domain([data.years[0] - 0.5, data.years.at(-1) + 0.5])
            .range([margin.left, width - margin.right]);
          const y = d3
            .scaleLinear()
            .domain([-bound, bound])
            .nice()
            .range([height - margin.bottom, margin.top]);
          const svg = d3
            .select(container)
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("role", "img")
            .attr("aria-label", label);
          svg.selectAll("*").remove();
          svg.append("title").text(label);
          svg
            .append("text")
            .attr("x", margin.left)
            .attr("y", 12)
            .text("Annual mean difference (°F)");
          svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format("+.1f")));
          svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
              d3
                .axisBottom(x)
                .ticks(width < 450 ? 4 : 6)
                .tickFormat(d3.format("d")),
            );
          svg
            .append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .attr("stroke", "#aaa")
            .attr("stroke-dasharray", "3,4");
          svg
            .append("path")
            .datum(full)
            .attr("fill", "none")
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1)
            .attr(
              "d",
              d3
                .line()
                .defined((p) => p.difference !== null)
                .x((p) => x(p.year))
                .y((p) => y(p.difference)),
            );
          function detail(p) {
            return `${p.year} · ${lag ? `Mean absolute ${lag}-day change` : "Mean daily high"}: IU ${f(p.iu)}°F · KBMG ${f(p.airport)}°F · IU − KBMG ${signed(p.difference)}°F · ${p.n.toLocaleString()} paired ${lag ? "changes" : "days"}`;
          }
          svg
            .selectAll("circle")
            .data(records)
            .join("circle")
            .attr("cx", (p) => x(p.year))
            .attr("cy", (p) => y(p.difference))
            .attr("r", 4)
            .attr("fill", (p) => (p.difference >= 0 ? "#c46b6b" : "#777"))
            .attr("tabindex", 0)
            .attr("aria-label", detail)
            .on("pointerenter focus click", (_, p) => {
              q("inspect").textContent = detail(p);
            })
            .append("title")
            .text(detail);
        }
        function render() {
          const lag = +q("lag").value,
            changes = data.changes[String(lag)];
          q("summary").textContent =
            `Across ${data.summary.n.toLocaleString()} paired days, IU highs averaged ${describe(data.summary, ["warmer", "cooler"])} than KBMG.`;
          q("change-summary").textContent =
            `The average ${lag}-day change was ${describe(changes.summary, ["larger", "smaller"])} at IU (${changes.summary.n.toLocaleString()} paired changes).`;
          plot(
            q("temperature"),
            data.annual,
            "Annual daily high difference, IU minus KBMG",
            0,
          );
          plot(
            q("changes"),
            changes.annual,
            `Annual mean absolute ${lag}-day temperature change difference, IU minus KBMG`,
            lag,
          );
        }
        q("lag").addEventListener("change", () => {
          q("inspect").textContent =
            "Hover, tap or focus a point for both station values.";
          render();
        });
        let lastWidth = 0;
        new ResizeObserver(() => {
          if (Math.abs(root.clientWidth - lastWidth) > 1) {
            lastWidth = root.clientWidth;
            render();
          }
        }).observe(root);
        render();
      })
      .catch((error) => {
        q("summary").textContent =
          "The station comparison could not load. Please reload to try again.";
        q("change-summary").textContent = "";
        console.error(error);
      });
  }
})();
