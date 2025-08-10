// Temporal Structures — D3 Gantt for low-vision navigation project

const container = d3.select("#temporal-structures");
if (!container.node()) {
  console.warn("Temporal Structures container not found");
}

// Header (title + legend)
const header = container.append("div").attr("class", "viz-header");
header.append("div").attr("class", "viz-title").text("Temporal Structures — Project Timeline");
const legend = header.append("div").attr("class", "viz-legend");

const categoryColors = {
  research: "#1A73E8",
  design:   "#E8710A",
  hardware: "#34A853",
  software: "#A142F4",
  testing:  "#EA4335",
  outreach: "#00ACC1"
};
Object.entries(categoryColors).forEach(([k,c])=>{
  const item = legend.append("div").attr("class","legend-item");
  item.append("span").attr("class","legend-swatch").style("background",c);
  item.append("span").text(k[0].toUpperCase()+k.slice(1));
});

container.append("div")
  .attr("class","viz-caption")
  .text("Tab to focus bars • Hover/focus to see details • Colors indicate categories.");

const tooltip = d3.select("body").append("div").attr("class","tooltip");

// ---- Data ----
const tasks = [
  { name:"Problem Framing & Literature Review", start:"2025-01-20", end:"2025-02-20", category:"research", progress:1.0,
    notes:"Survey on low-vision mobility; benchmarks for haptic/audio nav." },
  { name:"Stakeholder Interviews (Lighthouse Guild, MTA)", start:"2025-02-05", end:"2025-03-10", category:"research", progress:0.9,
    notes:"Pain points near subway nodes; crossing and wayfinding." },
  { name:"Haptic Belt Prototype v1", start:"2025-03-01", end:"2025-04-05", category:"hardware", progress:1.0,
    notes:"ESP32 + vibromotors; heading cues via compass." },
  { name:"Audio Cue Engine", start:"2025-03-15", end:"2025-04-25", category:"software", progress:0.8,
    notes:"Earcons with low cognitive load; dual-channel with haptics." },
  { name:"Field Trials — Morningside Heights", start:"2025-04-20", end:"2025-05-10", category:"testing", progress:1.0,
    notes:"Route segments around Broadway/116 St; safety escort." },
  { name:"Iteration v2 (turn grammar + intersections)", start:"2025-05-05", end:"2025-06-05", category:"design", progress:1.0,
    notes:"Cadence/intensity mapping; crosswalk timing hints." },
  { name:"IRB & Risk Protocols", start:"2025-06-10", end:"2025-07-05", category:"research", progress:0.7,
    notes:"Consent forms (plain language); safety checklist." },
  { name:"Usability Testing v2 — Midtown", start:"2025-07-12", end:"2025-08-05", category:"testing", progress:0.6,
    notes:"Crowd density stress test; prioritizing signals in noise." },
  { name:"Outreach & Community Workshops", start:"2025-08-06", end:"2025-08-25", category:"outreach", progress:0.2,
    notes:"Co-design sessions; route diaries and feedback." }
];

tasks.forEach(d => {
  d.start = new Date(d.start);
  d.end = new Date(d.end);
  d.progress = +d.progress || 0;
});

// ---- Layout / scales ----
const MARGIN = { top: 8, right: 24, bottom: 36, left: 180 };
let width = Math.min(760, container.node().getBoundingClientRect().width - 32);
let height = 32 + tasks.length * 48;

const svg = container.append("svg")
  .attr("width", width + MARGIN.left + MARGIN.right)
  .attr("height", height + MARGIN.top + MARGIN.bottom);

const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

const timeExtent = [ d3.min(tasks, d=>d.start), d3.max(tasks, d=>d.end) ];
const x = d3.scaleTime().domain(timeExtent).range([0, width]);
const y = d3.scaleBand().domain(tasks.map(d=>d.name)).range([0, height]).padding(0.35);

// grid
g.append("g").attr("class","grid")
  .call(d3.axisBottom(x).ticks(6).tickSize(height).tickFormat(()=> "" ))
  .selectAll("text").remove();

// y axis
g.append("g").attr("class","axis")
  .call(d3.axisLeft(y).tickSize(0))
  .selectAll("text").style("font-size","12px").style("fill","#444");

// x axis
g.append("g").attr("class","axis")
  .attr("transform",`translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")))
  .selectAll("text").style("font-size","12px").style("fill","#666");

// bars
const bars = g.selectAll(".task").data(tasks).enter().append("rect")
  .attr("class","task")
  .attr("x", d=>x(d.start))
  .attr("y", d=>y(d.name))
  .attr("width", d=>Math.max(2, x(d.end)-x(d.start)))
  .attr("height", y.bandwidth())
  .attr("fill", d=>categoryColors[d.category] || "#999")
  .attr("tabindex", 0)
  .attr("role","img")
  .attr("aria-label", d => `${d.name}, ${fmt(d.start)} to ${fmt(d.end)}, ${d.category}, ${Math.round(d.progress*100)} percent`)
  .on("mousemove", (e,d)=> {
    tooltip.style("opacity",1)
      .style("left", (e.pageX+14)+"px")
      .style("top", (e.pageY-10)+"px")
      .html(tip(d));
  })
  .on("mouseleave", ()=> tooltip.style("opacity",0).style("transform","translateY(-4px)"))
  .on("focus", (e,d)=>{
    const [mx,my] = d3.pointer(e, document.body);
    tooltip.style("opacity",1)
      .style("left", (mx+14)+"px")
      .style("top", (my-10)+"px")
      .html(tip(d));
  })
  .on("blur", ()=> tooltip.style("opacity",0).style("transform","translateY(-4px)"));

// progress overlay
g.selectAll(".progress").data(tasks).enter().append("rect")
  .attr("class","progress")
  .attr("x", d=>x(d.start))
  .attr("y", d=>y(d.name)+2)
  .attr("height", Math.max(2, y.bandwidth()-4))
  .attr("width", d=>(x(d.end)-x(d.start))*d.progress)
  .attr("fill", "#fff");

// responsive
window.addEventListener("resize", ()=>{
  const newW = Math.min(760, container.node().getBoundingClientRect().width - 32);
  if (newW === width) return;
  width = newW;
  svg.attr("width", width + MARGIN.left + MARGIN.right);
  x.range([0,width]);

  g.select(".grid")
   .call(d3.axisBottom(x).ticks(6).tickSize(height).tickFormat(()=> "" ))
   .selectAll("text").remove();

  g.selectAll(".axis").filter((d,i,nodes)=> nodes[i] === nodes[nodes.length-1])
   .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")))
   .selectAll("text").style("font-size","12px").style("fill","#666");

  bars.attr("x", d=>x(d.start)).attr("width", d=>Math.max(2, x(d.end)-x(d.start)));
  g.selectAll(".progress")
    .attr("x", d=>x(d.start))
    .attr("width", d=>(x(d.end)-x(d.start))*d.progress);
});

function fmt(dt){ return d3.timeFormat("%b %d, %Y")(dt); }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function tip(d){
  return `
    <div style="font-weight:700;margin-bottom:4px">${d.name}</div>
    <div>${fmt(d.start)} — ${fmt(d.end)}</div>
    <div>Category: ${cap(d.category)}</div>
    <div>Progress: ${Math.round(d.progress*100)}%</div>
    <div style="margin-top:6px;color:#bbb">${d.notes||""}</div>
  `;
}
