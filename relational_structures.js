// relational_structures.js — NYC Subway demo (no CSV, runs immediately)

(function () {
    const container = d3.select("#relational-structures");
    if (!container.node()) return;

    // Header & legend
    const header = container.append("div").attr("class", "viz-header");
    header.append("div").attr("class", "viz-title").text("Relational Structures — NYC Subway Network");
    const legend = header.append("div").attr("class", "viz-legend");
    const typeColor = { station: "#1A73E8", line: "#E8710A", borough: "#34A853" };
    Object.entries(typeColor).forEach(([k, c]) => {
        const it = legend.append("div").attr("class", "legend-item");
        it.append("span").attr("class", "legend-swatch").style("background", c);
        it.append("span").text(k[0].toUpperCase() + k.slice(1));
    });

    // Controls
    const controls = container.append("div").attr("class", "rs-controls");
    const search = controls.append("input").attr("type", "search").attr("placeholder", "Search stations/lines/boroughs…");
    controls.append("button").attr("class", "btn").text("Reset view").on("click", resetView);
    container.append("div").attr("class", "viz-caption").text("Drag nodes • Scroll to zoom • Hover/focus for details.");

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // SVG
    const W = Math.min(760, container.node().getBoundingClientRect().width - 32);
    const H = 560;
    const svg = container.append("svg").attr("width", W).attr("height", H).attr("viewBox", [0, 0, W, H]);
    const g = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.5, 3]).on("zoom", (e) => g.attr("transform", e.transform)));

    // -------- demo data: 7 line + A line segment + boroughs --------
    const boroughs = [
        { id: "b_manhattan", name: "Manhattan", short: "Manhattan", type: "borough" },
        { id: "b_queens", name: "Queens", short: "Queens", type: "borough" },
        { id: "b_brooklyn", name: "Brooklyn", short: "Brooklyn", type: "borough" }
    ];
    const lines = [
        { id: "L7", name: "Line 7", short: "7", type: "line" },
        { id: "LA", name: "Line A", short: "A", type: "line" }
    ];
    const s7 = [
        "Flushing–Main St", "Mets–Willets Pt", "111 St", "103 St–Corona Plaza", "Junction Blvd",
        "90 St–Elmhurst Av", "82 St–Jackson Hts", "74 St–Broadway", "69 St", "61 St–Woodside",
        "52 St", "46 St–Bliss St", "40 St–Lowery St", "33 St–Rawson St", "Queensboro Plaza",
        "Court Sq", "Hunters Point Av", "Vernon Blvd–Jackson Av", "Grand Central–42 St",
        "5 Av–Bryant Pk", "Times Sq–42 St"
    ];
    const s7_nodes = s7.map((n, i) => ({
        id: `S7_${i}`, name: n, short: n.split("–")[0], type: "station",
        borough: i >= 18 ? "Manhattan" : (i >= 14 ? "Queens/Manhattan" : "Queens")
    }));
    const sa = ["Inwood–207 St", "Dyckman St", "190 St", "181 St", "175 St", "168 St", "145 St", "135 St", "125 St"];
    const sa_nodes = sa.map((n, i) => ({ id: `SA_${i}`, name: n, short: n, type: "station", borough: "Manhattan" }));

    const nodes = [...boroughs, ...lines, ...s7_nodes, ...sa_nodes];
    const links = [];
    for (let i = 0; i < s7_nodes.length - 1; i++) links.push({ source: s7_nodes[i].id, target: s7_nodes[i + 1].id, rel: "adj" });
    for (let i = 0; i < sa_nodes.length - 1; i++) links.push({ source: sa_nodes[i].id, target: sa_nodes[i + 1].id, rel: "adj" });
    s7_nodes.forEach(s => links.push({ source: s.id, target: "L7", rel: "member" }));
    sa_nodes.forEach(s => links.push({ source: s.id, target: "LA", rel: "member" }));
    s7_nodes.forEach(s => {
        if (s.borough === "Manhattan") links.push({ source: s.id, target: "b_manhattan", rel: "boro" });
        else if (s.borough === "Queens") links.push({ source: s.id, target: "b_queens", rel: "boro" });
        else { links.push({ source: s.id, target: "b_queens", rel: "boro" }); links.push({ source: s.id, target: "b_manhattan", rel: "boro" }); }
    });
    sa_nodes.forEach(s => links.push({ source: s.id, target: "b_manhattan", rel: "boro" }));

    // -------- build graph --------
    const idMap = new Map(nodes.map(d => [d.id, d]));
    const edges = links.map(l => ({ ...l, source: idMap.get(l.source), target: idMap.get(l.target) }))
        .filter(l => l.source && l.target);

    const deg = {}; edges.forEach(l => { deg[l.source.id] = (deg[l.source.id] || 0) + 1; deg[l.target.id] = (deg[l.target.id] || 0) + 1; });
    nodes.forEach(n => n.size = 6 + 2 * Math.sqrt(deg[n.id] || 1));

    const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id).distance(ldist).strength(0.85))
        .force("charge", d3.forceManyBody().strength(-180))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force("collide", d3.forceCollide().radius(d => d.size + 6).iterations(2));

    const link = g.append("g").attr("stroke-linecap", "round").selectAll("line")
        .data(edges).enter().append("line")
        .attr("class", d => "link " + clsRel(d.rel))
        .attr("stroke-width", d => d.rel === "adj" ? 2 : 1.5)
        .attr("opacity", .9);

    const node = g.append("g").selectAll("g")
        .data(nodes).enter().append("g")
        .attr("tabindex", 0)
        .on("mousemove", (e, d) => showTip(e, d)).on("mouseleave", hideTip)
        .on("focus", (e, d) => showTip(e, d)).on("blur", hideTip)
        .call(d3.drag()
            .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
        );

    node.append("circle").attr("r", d => d.size).attr("fill", d => typeColor[d.type] || "#888");
    node.append("text").attr("class", "label").text(d => d.short || d.name).attr("x", d => d.size + 4).attr("y", 4);

    sim.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Search + reset
    search.on("input", function () {
        const q = this.value.trim().toLowerCase();
        if (!q) { node.style("opacity", 1); link.style("opacity", 0.9); return; }
        node.style("opacity", d => match(d, q) ? 1 : 0.15);
        link.style("opacity", d => match(d.source, q) || match(d.target, q) ? 0.9 : 0.05);
    });
    function resetView() {
        svg.transition().duration(350).call(d3.zoom().transform, d3.zoomIdentity.translate(0, 0).scale(1));
        search.property("value", ""); node.style("opacity", 1); link.style("opacity", 0.9);
    }

    // helpers
    function ldist(l) { if (l.rel === "member") return 70; if (l.rel === "boro") return 110; return 60; }
    function clsRel(r) { return r === "member" ? "member" : r === "boro" ? "boro" : "adj"; }
    function showTip(event, d) {
        tooltip.style("opacity", 1).style("left", (event.pageX + 14) + "px").style("top", (event.pageY - 10) + "px")
            .html(`<div style="font-weight:700;margin-bottom:4px">${d.name}</div>
             <div>Type: ${d.type[0].toUpperCase() + d.type.slice(1)}</div>
             ${d.borough ? `<div>Borough: ${d.borough}</div>` : ""}`);
    }
    function hideTip() { tooltip.style("opacity", 0).style("transform", "translateY(-4px)"); }
    function match(d, q) {
        return (d.name || "").toLowerCase().includes(q)
            || (d.short || "").toLowerCase().includes(q)
            || (d.type || "").toLowerCase().includes(q)
            || (d.borough || "").toLowerCase().includes(q);
    }
})();
