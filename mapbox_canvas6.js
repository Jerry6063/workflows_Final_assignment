// maplibre_canvas6.js — Canvas 6: Geospatial Structures — Manhattan Sketch (No token)
// Uses MapLibre GL + OSM raster tiles. Works offline with demo GeoJSON.
// If you want to use your own manhattan.geojson, see the bottom "loadExternalGeoJSON" function.

(function(){
  const containerId = 'mapbox-container-6';

  // --- 1) Build a simple MapLibre style with OSM raster tiles ---
  const style = {
    version: 8,
    sources: {
      'osm-raster': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#f8f9fb' } },
      { id: 'osm', type: 'raster', source: 'osm-raster', minzoom: 0, maxzoom: 19 }
    ]
  };

  // --- 2) Init map ---
  const map = new maplibregl.Map({
    container: containerId,
    style,
    center: [-73.9712, 40.7831], // Manhattan
    zoom: 11.2,
    pitch: 0,
    bearing: 0
  });

  // Controls
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

  // --- 3) Demo GeoJSON (immediately visible) ---
  // A) Simplified borough polygon (very rough demo outline)
  const boroughFeature = {
    "type": "Feature",
    "properties": { "name": "Manhattan (demo)" },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0267,40.7003],[-73.9719,40.7066],[-73.9321,40.7422],[-73.9252,40.7835],
        [-73.9348,40.8122],[-73.9499,40.8429],[-73.9440,40.8709],[-73.9588,40.8787],
        [-73.9686,40.8762],[-73.9793,40.8650],[-74.0107,40.8518],[-74.0178,40.8423],
        [-74.0170,40.8292],[-74.0129,40.7990],[-74.0137,40.7680],[-74.0168,40.7429],
        [-74.0188,40.7245],[-74.0186,40.7096],[-74.0267,40.7003]
      ]]
    }
  };

  // B) Sample walking corridor polyline
  const corridorFeature = {
    "type": "Feature",
    "properties": { "name": "Riverside–Central Corridor" },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-73.9849,40.7737],[-73.9812,40.7775],[-73.9770,40.7805],[-73.9730,40.7826],
        [-73.9710,40.7858],[-73.9694,40.7891],[-73.9683,40.7928],[-73.9677,40.7960],
        [-73.9669,40.8000],[-73.9660,40.8030]
      ]
    }
  };

  // C) Landmarks points
  const landmarkFC = {
    "type":"FeatureCollection",
    "features":[
      pt(-73.9855,40.7580,"Times Square"),
      pt(-73.9654,40.7829,"Central Park"),
      pt(-73.9772,40.7527,"Grand Central Terminal"),
      pt(-73.9819,40.7681,"Columbus Circle")
    ]
  };
  function pt(lng,lat,name){
    return {"type":"Feature","properties":{"name":name},"geometry":{"type":"Point","coordinates":[lng,lat]}};
  }

  // --- 4) Add layers ---
  map.on('load', () => {
    // Borough polygon
    map.addSource('mb6-borough', { type:'geojson', data: boroughFeature });
    map.addLayer({ id:'mb6-borough-fill', type:'fill', source:'mb6-borough',
      paint:{ 'fill-color':'#4C8BF5', 'fill-opacity':0.12 }});
    map.addLayer({ id:'mb6-borough-line', type:'line', source:'mb6-borough',
      paint:{ 'line-color':'#4C8BF5', 'line-width':1.5, 'line-opacity':0.8 }});

    // Corridor line
    map.addSource('mb6-corridor', { type:'geojson', data: corridorFeature });
    map.addLayer({ id:'mb6-corridor-line', type:'line', source:'mb6-corridor',
      layout:{ 'line-join':'round', 'line-cap':'round' },
      paint:{ 'line-color':'#E8710A', 'line-width':3, 'line-opacity':0.9 }});

    // Landmarks
    map.addSource('mb6-landmarks', { type:'geojson', data: landmarkFC });
    map.addLayer({ id:'mb6-landmarks-circle', type:'circle', source:'mb6-landmarks',
      paint:{ 'circle-radius':6, 'circle-color':'#34A853', 'circle-stroke-color':'#fff', 'circle-stroke-width':1.5 }});
    map.addLayer({ id:'mb6-landmarks-label', type:'symbol', source:'mb6-landmarks',
      layout:{ 'text-field':['get','name'], 'text-size':11, 'text-offset':[0,1.1] },
      paint:{ 'text-color':'#333', 'text-halo-color':'#fff', 'text-halo-width':1 }});

    // Interactions
    map.on('click','mb6-landmarks-circle', (e) => {
      const f = e.features[0];
      new maplibregl.Popup()
        .setLngLat(f.geometry.coordinates)
        .setHTML(`<strong>${f.properties.name}</strong>`)
        .addTo(map);
    });
    map.on('mouseenter','mb6-landmarks-circle', ()=> map.getCanvas().style.cursor='pointer');
    map.on('mouseleave','mb6-landmarks-circle', ()=> map.getCanvas().style.cursor='');

    // Initial view + buttons
    fitToGeoJSON(boroughFeature);
    hookButtons();
    // 若要加载你自己的 manhattan.geojson，取消下一行注释并确保文件在同目录：
    // loadExternalGeoJSON('mb6-borough', 'mb6-borough-fill', 'mb6-borough-line', './manhattan.geojson');
  });

  // --- 5) UI helpers ---
  function hookButtons(){
    const $ = id => document.getElementById(id);
    const vis = id => map.getLayoutProperty(id,'visibility') ?? 'visible';
    const toggle = id => map.setLayoutProperty(id,'visibility', vis(id)==='none'?'visible':'none');

    $('mb6-toggle-borough').addEventListener('click', ()=>{
      toggle('mb6-borough-fill'); toggle('mb6-borough-line');
      $('mb6-toggle-borough').textContent =
        vis('mb6-borough-fill')==='none' ? 'Show Borough' : 'Hide Borough';
    });
    $('mb6-toggle-corridor').addEventListener('click', ()=>{
      toggle('mb6-corridor-line');
      $('mb6-toggle-corridor').textContent =
        vis('mb6-corridor-line')==='none' ? 'Show Corridor' : 'Hide Corridor';
    });
    $('mb6-toggle-landmarks').addEventListener('click', ()=>{
      toggle('mb6-landmarks-circle'); toggle('mb6-landmarks-label');
      $('mb6-toggle-landmarks').textContent =
        vis('mb6-landmarks-circle')==='none' ? 'Show Landmarks' : 'Hide Landmarks';
    });
    $('mb6-reset').addEventListener('click', ()=> fitToGeoJSON(boroughFeature));
  }

  // Fit to a GeoJSON (Polygon/MultiPolygon/LineString/Points)
  function fitToGeoJSON(geo){
    const [minX,minY,maxX,maxY] = bbox(geo);
    map.fitBounds([ [minX,minY],[maxX,maxY] ], { padding: 40, duration: 900 });
  }

  // Lightweight bbox (no turf dependency)
  function bbox(geo){
    const coords = extractCoords(geo);
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const [x,y] of coords){
      if (x<minX) minX=x; if (y<minY) minY=y;
      if (x>maxX) maxX=x; if (y>maxY) maxY=y;
    }
    return [minX,minY,maxX,maxY];
  }
  function extractCoords(g){
    const out=[];
    (function walk(obj){
      if (!obj) return;
      if (Array.isArray(obj) && typeof obj[0]==='number' && obj.length>=2){ out.push([obj[0],obj[1]]); return; }
      if (Array.isArray(obj)){ obj.forEach(walk); return; }
      if (typeof obj==='object'){ Object.values(obj).forEach(walk); }
    })(g.geometry || g);
    return out;
  }

  // Load external GeoJSON (e.g., ./manhattan.geojson)
  function loadExternalGeoJSON(sourceId, fillId, lineId, url){
    fetch(url).then(r=>r.json()).then(geo=>{
      // Replace source data
      map.getSource(sourceId).setData(geo);
      // Fit view
      fitToGeoJSON(geo);
    }).catch(err=> console.error('Failed to load GeoJSON:', err));
  }
})();
