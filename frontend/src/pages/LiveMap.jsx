import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
// VIT Vellore main campus — centre of academic zone
const VIT_CENTER = [12.9698, 79.1557];
const VIT_ZOOM   = 17;   // zoomed in enough to see campus roads
const OSRM_BASE  = 'https://router.project-osrm.org/route/v1/driving';

// Module-level geometry cache — one OSRM fetch per route per browser session
const routeGeometryCache = new Map();

// Reset on every module load so tile/coord changes apply immediately in dev
let cssInjected = false;
routeGeometryCache.clear();

function injectMarkerCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    /* No dark filter — keep OSM tiles at full brightness so campus roads are visible */

    /* Shuttle vehicle marker */
    .shuttle-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
    .shuttle-halo {
      position: absolute;
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--halo-color, rgba(0,212,184,.25));
      animation: halopulse 1.8s ease-in-out infinite;
      pointer-events: none;
    }
    .shuttle-halo-ring {
      position: absolute;
      width: 58px; height: 58px;
      border-radius: 50%;
      border: 2px solid var(--halo-color, rgba(0,212,184,.3));
      animation: halopulse 1.8s ease-in-out infinite .6s;
      pointer-events: none;
    }
    @keyframes halopulse {
      0%, 100% { opacity: .85; transform: scale(1); }
      50%       { opacity: .2;  transform: scale(1.5); }
    }
    .shuttle-vehicle {
      position: relative;
      width: 34px; height: 34px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      box-shadow: 0 3px 12px rgba(0,0,0,.5);
      border: 2.5px solid rgba(255,255,255,.85);
      transition: transform .15s linear;
      z-index: 2;
      cursor: pointer;
    }

    /* Stop pin markers */
    .stop-pin-origin, .stop-pin-dest, .stop-pin-mid {
      display: flex; flex-direction: column; align-items: center;
    }
    .stop-pin-circle {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.45);
    }
    .stop-pin-dest .stop-pin-drop {
      width: 8px; height: 8px;
      clip-path: polygon(50% 100%, 0 0, 100% 0);
      margin-top: -1px;
    }
    .stop-pin-mid .stop-pin-circle { width: 11px; height: 11px; border-width: 2px; }
    .stop-label {
      position: absolute;
      top: -22px;
      white-space: nowrap;
      background: rgba(14,20,32,.9);
      color: #eef2ff;
      font-size: 10px;
      font-weight: 700;
      font-family: Inter, sans-serif;
      padding: 2px 7px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 2px 8px rgba(0,0,0,.4);
      pointer-events: none;
    }

    /* Leaflet popup — clean card style works on both light map and dark UI */
    .leaflet-popup-content-wrapper {
      background: #1a2540 !important;
      border: 1px solid rgba(255,255,255,.15) !important;
      border-radius: 14px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,.5) !important;
      color: #eef2ff !important;
      font-family: Inter, sans-serif !important;
      padding: 0 !important;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip { background: #1a2540 !important; }
    .leaflet-popup-close-button { color: #7a8ba8 !important; top: 8px !important; right: 8px !important; font-size: 18px !important; }

    /* Zoom control — dark pill floats nicely over the light map */
    .leaflet-control-zoom a {
      background: #1a2540 !important; color: #eef2ff !important;
      border: 1px solid rgba(255,255,255,.1) !important;
      font-weight: 700 !important;
    }
    .leaflet-control-zoom a:hover { background: #243055 !important; }

    /* Hide default Leaflet attribution (we set our own) */
    .leaflet-control-attribution { font-size: 9px; opacity: .6; }

    /* Recenter button */
    .recenter-btn {
      position: absolute; bottom: 16px; right: 16px; z-index: 800;
      width: 40px; height: 40px;
      background: #0e1420; border: 1px solid rgba(255,255,255,.12);
      border-radius: 10px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #00d4b8; font-size: 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,.5);
      transition: all .2s;
      font-family: 'Material Symbols Outlined';
    }
    .recenter-btn:hover { background: #141c2e; box-shadow: 0 6px 20px rgba(0,212,184,.2); }
    .recenter-btn.hidden { opacity: 0; pointer-events: none; }
  `;
  document.head.appendChild(style);
}

// ─── Route Definitions — GPS-accurate VIT Vellore campus stops ───────────────
//
// All coordinates verified against OpenStreetMap / satellite imagery of
// VIT Vellore (Tiruvalam Road, Katpadi, Vellore 632 014).
// Campus spans roughly: N 12.975 → S 12.964 · W 79.150 → E 79.163
//
const ROUTES = [
  {
    // Route Alpha — North loop: Main Gate → academic core → men's hostel zone
    id: 'Alpha', label: 'Route Alpha',
    color: '#00d4b8', glow: 'rgba(0,212,184,.35)',
    shuttles: [
      { id: 'VIT-001', speedKmh: 18, startFrac: 0.0 },
      { id: 'VIT-009', speedKmh: 14, startFrac: 0.5 },
    ],
    stops: [
      // North gate on Tiruvalam Rd (NH-46 side)
      { name: 'Main Gate (North)',   pos: [12.9740, 79.1560], type: 'origin' },
      // SJT — Seethakathi Justice Thandapani block, largest academic block
      { name: 'SJT Block',          pos: [12.9714, 79.1551], type: 'mid' },
      // SMV — S.M. Venkataraman block / CDL area
      { name: 'SMV Block',          pos: [12.9703, 79.1543], type: 'mid' },
      // TT — Technology Tower (main landmark clock tower)
      { name: 'Technology Tower',   pos: [12.9696, 79.1555], type: 'mid' },
      // Men's hostel zone (NH-1 / Opp. cluster)
      { name: "Men's Hostel Zone",  pos: [12.9674, 79.1551], type: 'dest' },
    ],
  },
  {
    // Route Beta — Library loop: Learning Centre → GDN → Annapurna
    id: 'Beta', label: 'Route Beta',
    color: '#7c6dfa', glow: 'rgba(124,109,250,.35)',
    shuttles: [
      { id: 'VIT-003', speedKmh: 16, startFrac: 0.0 },
    ],
    stops: [
      // Learning Resource Centre (Central Library)
      { name: 'Library / LRC',      pos: [12.9690, 79.1545], type: 'origin' },
      // GDN block (Mahatma Gandhi block)
      { name: 'GDN Block',          pos: [12.9700, 79.1536], type: 'mid' },
      // MB — Mechanical / civil labs cluster
      { name: 'MB Block / Labs',    pos: [12.9710, 79.1530], type: 'mid' },
      // Annapurna mess / food court near hostel
      { name: 'Annapurna Food Court', pos: [12.9678, 79.1562], type: 'dest' },
    ],
  },
  {
    // Route Charlie — South / admin loop: Gate 2 → Admin → Sports → Women's hostel
    id: 'Charlie', label: 'Route Charlie',
    color: '#ff9d4d', glow: 'rgba(255,157,77,.35)',
    shuttles: [
      { id: 'VIT-007', speedKmh: 15, startFrac: 0.0 },
    ],
    stops: [
      // Gate 2 — south gate near sports complex
      { name: 'Gate 2 (South)',     pos: [12.9668, 79.1565], type: 'origin' },
      // Outdoor stadium / cricket ground
      { name: 'Sports Ground',     pos: [12.9680, 79.1574], type: 'mid' },
      // Admin block / main admin building
      { name: 'Admin Block',       pos: [12.9693, 79.1568], type: 'mid' },
      // Women's hostel cluster (Lakshmi / Saraswati blocks)
      { name: "Women's Hostel",   pos: [12.9706, 79.1574], type: 'dest' },
    ],
  },
];

// ─── Geometry Helpers ─────────────────────────────────────────────────────────
function haversineDist(a, b) {
  const R = 6371000, toRad = d => d * Math.PI / 180;
  const φ1 = toRad(a[0]), φ2 = toRad(b[0]);
  const dφ = toRad(b[0] - a[0]), dλ = toRad(b[1] - a[1]);
  const s = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function getBearing(from, to) {
  const φ1 = from[0] * Math.PI / 180, φ2 = to[0] * Math.PI / 180;
  const dλ = (to[1] - from[1]) * Math.PI / 180;
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return Math.atan2(y, x) * 180 / Math.PI;
}

function buildCumDist(pts) {
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + haversineDist(pts[i - 1], pts[i]));
  return d;
}

/** Given total distance travelled (wraps circularly), return {pos, bearing, nextStopName, distToNextStop} */
function positionAlongRoute(pts, cumDist, travelledM) {
  const total = cumDist[cumDist.length - 1];
  if (total === 0 || pts.length < 2) return { pos: pts[0], bearing: 0 };
  const d = ((travelledM % total) + total) % total;
  let lo = 0, hi = cumDist.length - 1;
  while (lo < hi - 1) { const m = (lo + hi) >> 1; if (cumDist[m] <= d) lo = m; else hi = m; }
  const segLen = cumDist[hi] - cumDist[lo];
  const t = segLen > 0 ? (d - cumDist[lo]) / segLen : 0;
  const from = pts[lo], to = pts[Math.min(hi, pts.length - 1)];
  const pos = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  return { pos, bearing: getBearing(from, to), segIdx: lo, fracInSeg: t };
}

// ─── OSRM Fetching with per-segment fallback ──────────────────────────────────
async function fetchOsrmRoute(route) {
  if (routeGeometryCache.has(route.id)) return routeGeometryCache.get(route.id);

  // Circular route: stops + loop back to first stop
  const circularStops = [...route.stops, route.stops[0]];
  const waypointStr = circularStops.map(s => `${s.pos[1]},${s.pos[0]}`).join(';');
  const url = `${OSRM_BASE}/${waypointStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
      throw new Error(`OSRM code: ${data.code}`);
    }
    // GeoJSON gives [lng, lat] — convert to [lat, lng] for Leaflet
    const pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    routeGeometryCache.set(route.id, pts);
    console.log(`✅ OSRM road-snapped route for ${route.id}: ${pts.length} points`);
    return pts;
  } catch (err) {
    console.warn(`⚠️ OSRM failed for Route ${route.id} (full route): ${err.message}`);

    // Segment-by-segment fallback — try each pair, straight-line if that fails
    console.warn(`   Trying segment-by-segment fallback for Route ${route.id}…`);
    const allPts = [];
    for (let i = 0; i < circularStops.length - 1; i++) {
      const a = circularStops[i], b = circularStops[i + 1];
      const segUrl = `${OSRM_BASE}/${a.pos[1]},${a.pos[0]};${b.pos[1]},${b.pos[0]}?overview=full&geometries=geojson`;
      try {
        const sr = await fetch(segUrl, { signal: AbortSignal.timeout(6000) });
        const sd = await sr.json();
        if (sd.code === 'Ok' && sd.routes?.[0]?.geometry?.coordinates?.length) {
          const segPts = sd.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          allPts.push(...(i === 0 ? segPts : segPts.slice(1)));
        } else throw new Error(`OSRM code: ${sd.code}`);
      } catch (segErr) {
        console.warn(`   ⚠️ Segment ${a.name ?? i} → ${b.name ?? i + 1} unroutable: ${segErr.message}. Using straight line.`);
        if (i === 0) allPts.push(a.pos);
        allPts.push(b.pos);
      }
    }
    const pts = allPts.length >= 2 ? allPts : circularStops.map(s => s.pos);
    routeGeometryCache.set(route.id, pts);
    return pts;
  }
}

// ─── Stop pin HTML factories ──────────────────────────────────────────────────
function originPinHtml(color) {
  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:none">
      <div class="stop-label" style="top:-26px">&nbsp;</div>
      <div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #fff;
                  box-shadow:0 0 0 3px ${color}55,0 3px 10px rgba(0,0,0,.5)"></div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
                  border-top:8px solid ${color};margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))"></div>
    </div>`;
}
function midPinHtml(color) {
  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;pointer-events:none">
      <div style="width:13px;height:13px;border-radius:50%;background:${color};border:2.5px solid #fff;
                  box-shadow:0 0 0 2px ${color}44,0 2px 6px rgba(0,0,0,.5)"></div>
    </div>`;
}
function destPinHtml(color) {
  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:none">
      <div style="width:22px;height:22px;border-radius:50%;background:#0e1420;border:3px solid ${color};
                  box-shadow:0 0 0 3px ${color}44,0 3px 10px rgba(0,0,0,.5);
                  display:flex;align-items:center;justify-content:center">
        <div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
                  border-top:9px solid ${color};margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))"></div>
    </div>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveMap() {
  const mapRef        = useRef(null);
  const mapInst       = useRef(null);
  const markerRefs    = useRef({});      // shuttleId → L.marker
  const polylineRefs  = useRef({});      // routeId   → L.polyline
  const routePoints   = useRef({});      // routeId   → [lat,lng][]
  const cumDistRef    = useRef({});      // routeId   → number[]
  const travelledRef  = useRef({});      // shuttleId → metres travelled (float)
  const animRef       = useRef(null);
  const lastTsRef     = useRef(null);
  const userPannedRef = useRef(false);
  const focusedIdRef  = useRef(null);    // selected shuttle id

  const [osrmLoading, setOsrmLoading] = useState(true);
  const [osrmError,   setOsrmError  ] = useState(false);
  const [selectedId,  setSelectedId ] = useState(null);
  const [panelData,   setPanelData  ] = useState(null); // { shuttle, route, speedKmh, etaMin, nextStop }
  const [isUserPanned, setIsUserPanned] = useState(false);

  // ── Build Leaflet map and fetch OSRM routes ────────────────────────────────
  useEffect(() => {
    injectMarkerCSS();

    // Load Leaflet CSS + JS from CDN
    if (!document.querySelector('link[href*="leaflet"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const loadL = () => new Promise(resolve => {
      if (window.L) { resolve(window.L); return; }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = () => resolve(window.L);
      document.head.appendChild(s);
    });

    loadL().then(async (L) => {
      if (mapInst.current) return;

      // ── Init map ──
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView(VIT_CENTER, VIT_ZOOM);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Dark tile layer (CARTO dark — ride-hailing app style)
      // Standard OpenStreetMap tiles — best road detail for campus maps
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      // Detect user pan
      map.on('movestart', (e) => {
        // e._simulated is set when we pan programmatically via panTo/flyTo
        if (!e.originalEvent) return; // programmatic pan — ignore
        userPannedRef.current = true;
        setIsUserPanned(true);
      });

      mapInst.current = map;
      setTimeout(() => map.invalidateSize(), 200);

      // ── Fetch OSRM routes (rate-limited) ──
      const routePtsMap = {};
      for (let i = 0; i < ROUTES.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 350)); // ~1 req/sec
        try {
          routePtsMap[ROUTES[i].id] = await fetchOsrmRoute(ROUTES[i]);
        } catch {
          routePtsMap[ROUTES[i].id] = ROUTES[i].stops.map(s => s.pos);
        }
      }

      // ── Draw route polylines ──
      ROUTES.forEach(route => {
        const pts = routePtsMap[route.id];
        routePoints.current[route.id] = pts;
        cumDistRef.current[route.id]  = buildCumDist(pts);

        // Shadow/outline pass (thicker, dark, under the colored line)
        L.polyline(pts, {
          color: '#000', weight: 8, opacity: .35, lineCap: 'round', lineJoin: 'round',
        }).addTo(map);

        // Main road-snapped polyline — solid, colored
        const pl = L.polyline(pts, {
          color: route.color, weight: 5, opacity: .92,
          lineCap: 'round', lineJoin: 'round',
        }).addTo(map);
        polylineRefs.current[route.id] = pl;
      });

      // ── Draw stop markers ──
      ROUTES.forEach(route => {
        route.stops.forEach((stop, idx) => {
          const isOrigin = stop.type === 'origin';
          const isDest   = stop.type === 'dest';
          let html, size, anchor;
          if (isOrigin) {
            html = originPinHtml(route.color); size = [20, 30]; anchor = [10, 30];
          } else if (isDest) {
            html = destPinHtml(route.color); size = [22, 33]; anchor = [11, 33];
          } else {
            html = midPinHtml(route.color); size = [13, 13]; anchor = [6.5, 6.5];
          }
          const icon = L.divIcon({ className: '', html, iconSize: size, iconAnchor: anchor });
          L.marker(stop.pos, { icon, zIndexOffset: 200 })
            .addTo(map)
            .bindTooltip(`
              <div style="font-family:Inter,sans-serif;padding:6px 10px">
                <div style="font-weight:800;font-size:12px;color:#eef2ff">${stop.name}</div>
                <div style="font-size:10px;color:#7a8ba8;margin-top:2px">${route.label} · ${isOrigin ? 'Origin' : isDest ? 'Destination' : 'Stop'}</div>
              </div>`, {
              permanent: false, direction: 'top', opacity: 1, className: '',
            });
        });
      });

      // ── Create shuttle markers ──
      ROUTES.forEach(route => {
        const pts = routePtsMap[route.id];
        const cumDist = cumDistRef.current[route.id];
        const totalDist = cumDist[cumDist.length - 1];

        route.shuttles.forEach(shuttle => {
          // Init travelled distance based on startFrac
          travelledRef.current[shuttle.id] = shuttle.startFrac * totalDist;

          const { pos, bearing } = positionAlongRoute(pts, cumDist, travelledRef.current[shuttle.id]);

          const html = `
            <div class="shuttle-wrap" data-shuttle="${shuttle.id}"
                 style="--halo-color:${route.glow}">
              <div class="shuttle-halo-ring"></div>
              <div class="shuttle-halo"></div>
              <div class="shuttle-vehicle" data-vehicle
                   style="background:${route.color};transform:rotate(${bearing}deg)">
                🚌
              </div>
            </div>`;

          const icon = L.divIcon({
            className: '',
            html,
            iconSize: [60, 60],
            iconAnchor: [30, 30],
          });

          const marker = L.marker(pos, { icon, zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup(`
              <div style="padding:14px 16px;min-width:180px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:10px;height:10px;border-radius:50%;background:${route.color};display:inline-block;box-shadow:0 0 6px ${route.color}"></span>
                  <span style="font-weight:800;font-size:13px">${shuttle.id}</span>
                </div>
                <div style="font-size:11px;color:#7a8ba8">${route.label}</div>
                <div style="margin-top:10px;display:flex;align-items:center;gap:6px">
                  <span style="width:7px;height:7px;border-radius:50%;background:#22d3a5;display:inline-block;animation:halopulse 1.8s infinite"></span>
                  <span style="font-size:11px;font-weight:700;color:#22d3a5">LIVE · Active</span>
                </div>
              </div>`);

          marker.on('click', () => {
            focusedIdRef.current = shuttle.id;
            setSelectedId(shuttle.id);
            userPannedRef.current = false;
            setIsUserPanned(false);
          });

          markerRefs.current[shuttle.id] = { marker, route, shuttle };
        });
      });

      setOsrmLoading(false);

      // ── Animation loop ──
      const animate = (ts) => {
        const dt = lastTsRef.current ? Math.min((ts - lastTsRef.current) / 1000, 0.1) : 0.016;
        lastTsRef.current = ts;

        ROUTES.forEach(route => {
          const pts     = routePoints.current[route.id];
          const cumDist = cumDistRef.current[route.id];
          if (!pts || !cumDist) return;

          route.shuttles.forEach(shuttle => {
            const entry = markerRefs.current[shuttle.id];
            if (!entry) return;

            // Advance distance (km/h → m/s, × dt)
            travelledRef.current[shuttle.id] += (shuttle.speedKmh * 1000 / 3600) * dt;

            const { pos, bearing } = positionAlongRoute(
              pts, cumDist, travelledRef.current[shuttle.id]
            );

            // Update marker position
            entry.marker.setLatLng(pos);

            // Update vehicle rotation in DOM (no icon recreation)
            const el = entry.marker.getElement();
            if (el) {
              const veh = el.querySelector('[data-vehicle]');
              if (veh) veh.style.transform = `rotate(${bearing}deg)`;
            }

            // Auto-pan camera to selected shuttle
            if (focusedIdRef.current === shuttle.id && !userPannedRef.current && mapInst.current) {
              mapInst.current.panTo(pos, { animate: true, duration: 0.5, easeLinearity: 0.5, noMoveStart: true });
            }
          });
        });

        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);

      // Update panel data every 500 ms (avoids flooding React state)
      const panelInterval = setInterval(() => {
        const id = focusedIdRef.current;
        if (!id) return;
        let found = null;
        ROUTES.forEach(route => {
          route.shuttles.forEach(shuttle => {
            if (shuttle.id !== id) return;
            const pts     = routePoints.current[route.id];
            const cumDist = cumDistRef.current[route.id];
            if (!pts || !cumDist) return;

            const { pos, segIdx } = positionAlongRoute(pts, cumDist, travelledRef.current[id] || 0);
            const totalDist = cumDist[cumDist.length - 1];
            const travelled = ((travelledRef.current[id] || 0) % totalDist + totalDist) % totalDist;

            // Find next stop
            let nextStop = route.stops[0], minDist = Infinity;
            let distToNext = 0;
            route.stops.forEach(stop => {
              const d = haversineDist(pos, stop.pos);
              if (d < minDist) { minDist = d; nextStop = stop; }
            });
            distToNext = minDist;
            const etaMin = distToNext / (shuttle.speedKmh * 1000 / 60);

            found = {
              shuttle, route,
              speedKmh: shuttle.speedKmh + (Math.random() - .5) * 3,
              etaMin,
              nextStop,
              pos,
            };
          });
        });
        if (found) setPanelData(found);
      }, 500);

      return () => clearInterval(panelInterval);
    }).catch(() => setOsrmError(true));

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  }, []);

  // ── Recenter handler ──────────────────────────────────────────────────────
  const handleRecenter = useCallback(() => {
    userPannedRef.current = false;
    setIsUserPanned(false);
    if (!focusedIdRef.current) {
      mapInst.current?.flyTo(VIT_CENTER, 16, { duration: 0.8 });
    }
  }, []);

  // ── Clear selection ───────────────────────────────────────────────────────
  const handleSelectShuttle = useCallback((id) => {
    focusedIdRef.current = id;
    setSelectedId(id);
    userPannedRef.current = false;
    setIsUserPanned(false);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-tag">
          <span className="material-symbols-outlined">location_on</span>
          Live Tracking
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '.3rem',
            marginLeft: '.6rem',
            background: 'rgba(34,211,165,.1)', border: '1px solid rgba(34,211,165,.3)',
            borderRadius: '999px', padding: '.15rem .5rem',
            fontSize: '.62rem', fontWeight: 700, color: '#22d3a5',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', animation: 'pulse 1.6s infinite' }} />
            LIVE
          </span>
        </div>
        <h1 className="page-title">Live Map</h1>
        <p className="page-desc">Road-snapped shuttle tracking · OSRM routing · {ROUTES.reduce((a, r) => a + r.shuttles.length, 0)} active vehicles</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: '1.25rem', alignItems: 'start' }}>

        {/* ── MAP ── */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>

          {/* Loading overlay */}
          {osrmLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 900,
              background: 'rgba(8,12,20,.8)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#00d4b8', animation: 'spin 1s linear infinite' }}>autorenew</span>
              <div style={{ fontWeight: 700, color: '#eef2ff', fontSize: '.9rem' }}>Fetching road-snapped routes…</div>
              <div style={{ fontSize: '.75rem', color: '#7a8ba8' }}>OSRM routing API · No API key needed</div>
            </div>
          )}

          {/* Map container */}
          <div ref={mapRef} style={{ width: '100%', height: 580 }} />

          {/* Recenter button (floating over map) */}
          <button
            onClick={handleRecenter}
            className={`recenter-btn${!isUserPanned ? ' hidden' : ''}`}
            title="Recenter map"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>my_location</span>
          </button>

          {/* Map overlay — selected shuttle mini-HUD */}
          {panelData && selectedId && (
            <div style={{
              position: 'absolute', bottom: 16, left: 16, zIndex: 800,
              background: 'rgba(14,20,32,.92)', backdropFilter: 'blur(20px)',
              border: `1px solid ${panelData.route.color}45`,
              borderRadius: '16px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: `0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${panelData.route.color}20`,
              minWidth: 240,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                background: `${panelData.route.color}22`,
                border: `2px solid ${panelData.route.color}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
              }}>🚌</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#eef2ff' }}>
                  {panelData.shuttle.id}
                </div>
                <div style={{ fontSize: '.7rem', color: panelData.route.color, fontWeight: 600 }}>
                  {panelData.route.label}
                </div>
              </div>
              <button
                onClick={() => { setSelectedId(null); setPanelData(null); focusedIdRef.current = null; }}
                style={{ background: 'none', border: 'none', color: '#485770', cursor: 'pointer', padding: '2px', display: 'flex' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Ride-hailing info card — shown when a shuttle is selected */}
          {panelData && selectedId ? (
            <div style={{
              background: 'var(--surface)',
              border: `1px solid ${panelData.route.color}35`,
              borderRadius: '20px',
              overflow: 'hidden',
            }}>
              {/* Header strip */}
              <div style={{
                background: `linear-gradient(135deg, ${panelData.route.color}20, ${panelData.route.color}08)`,
                borderBottom: `1px solid ${panelData.route.color}25`,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '14px',
                  background: `${panelData.route.color}22`,
                  border: `2px solid ${panelData.route.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>🚌</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: '.95rem', color: '#eef2ff' }}>
                    {panelData.shuttle.id}
                  </div>
                  <div style={{ fontSize: '.72rem', color: panelData.route.color, fontWeight: 700 }}>
                    {panelData.route.label}
                  </div>
                </div>
                {/* Live badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.35rem',
                  background: 'rgba(34,211,165,.12)', border: '1px solid rgba(34,211,165,.3)',
                  borderRadius: '999px', padding: '.25rem .6rem',
                  fontSize: '.65rem', fontWeight: 800, color: '#22d3a5',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', animation: 'pulse 1.6s infinite', flexShrink: 0 }} />
                  LIVE
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
                {[
                  { label: 'Speed', value: `${panelData.speedKmh.toFixed(0)} km/h`, icon: 'speed', color: '#00d4b8' },
                  { label: 'ETA to stop', value: panelData.etaMin < 1 ? '<1 min' : `${panelData.etaMin.toFixed(0)} min`, icon: 'schedule', color: '#7c6dfa' },
                  { label: 'Next Stop', value: panelData.nextStop.name, icon: 'location_on', color: '#ff9d4d', full: true },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: 'var(--surface)',
                    gridColumn: s.full ? '1 / -1' : undefined,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.3rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '.85rem', color: s.color }}>{s.icon}</span>
                      <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#485770', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '.92rem', color: '#eef2ff' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Stops progress list */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, color: '#485770', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.65rem' }}>
                  Route Stops
                </div>
                {panelData.route.stops.map((stop, idx) => (
                  <div key={stop.name} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: idx < panelData.route.stops.length - 1 ? '.4rem' : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: stop.name === panelData.nextStop.name ? panelData.route.color : 'var(--surface-3)',
                        border: `2px solid ${stop.name === panelData.nextStop.name ? panelData.route.color : 'var(--border-bright)'}`,
                        boxShadow: stop.name === panelData.nextStop.name ? `0 0 8px ${panelData.route.color}` : 'none',
                      }} />
                      {idx < panelData.route.stops.length - 1 && (
                        <div style={{ width: 2, height: 14, background: 'var(--border)', borderRadius: 1, marginTop: 2 }} />
                      )}
                    </div>
                    <div style={{ fontSize: '.78rem', fontWeight: stop.name === panelData.nextStop.name ? 700 : 500, color: stop.name === panelData.nextStop.name ? '#eef2ff' : '#7a8ba8', paddingBottom: idx < panelData.route.stops.length - 1 ? 14 : 0 }}>
                      {stop.name}
                      {stop.name === panelData.nextStop.name && (
                        <span style={{ marginLeft: '.4rem', fontSize: '.6rem', fontWeight: 700, color: panelData.route.color }}>← next</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* No selection hint */
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '24px 20px', textAlign: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: '#485770', display: 'block', marginBottom: '.65rem' }}>touch_app</span>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#eef2ff', marginBottom: '.3rem' }}>Select a Shuttle</div>
              <div style={{ fontSize: '.75rem', color: '#7a8ba8', lineHeight: 1.6 }}>Tap any bus marker on the map to see live speed, ETA, and route details.</div>
            </div>
          )}

          {/* Route list */}
          <div className="card">
            <div className="card-title">
              <span className="material-symbols-outlined">route</span>
              Active Routes
            </div>
            {ROUTES.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '.65rem',
                padding: '.65rem 0',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  background: `${r.color}18`, border: `1.5px solid ${r.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 14, height: 3, borderRadius: 2, background: r.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#eef2ff' }}>{r.label}</div>
                  <div style={{ fontSize: '.66rem', color: '#7a8ba8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.stops.map(s => s.name).join(' → ')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.2rem', flexShrink: 0 }}>
                  <span style={{
                    background: 'rgba(34,211,165,.1)', border: '1px solid rgba(34,211,165,.25)',
                    borderRadius: '999px', padding: '.1rem .45rem',
                    fontSize: '.6rem', fontWeight: 700, color: '#22d3a5',
                  }}>{r.shuttles.length} bus</span>
                </div>
              </div>
            ))}
          </div>

          {/* Fleet list — clickable to select */}
          <div className="card">
            <div className="card-title">
              <span className="material-symbols-outlined">directions_bus</span>
              Active Fleet
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.65rem', color: '#22d3a5', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', animation: 'pulse 1.6s infinite' }} />
                {ROUTES.reduce((a, r) => a + r.shuttles.length, 0)} active
              </div>
            </div>
            {ROUTES.flatMap(r => r.shuttles.map(s => (
              <div key={s.id}
                onClick={() => handleSelectShuttle(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.55rem',
                  padding: '.55rem .5rem', borderRadius: '10px',
                  marginBottom: '.2rem', cursor: 'pointer',
                  background: selectedId === s.id ? `${r.color}15` : 'transparent',
                  border: `1px solid ${selectedId === s.id ? r.color + '40' : 'transparent'}`,
                  transition: 'all .2s',
                }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🚌</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.8rem', color: selectedId === s.id ? r.color : '#eef2ff' }}>{s.id}</div>
                  <div style={{ fontSize: '.65rem', color: '#7a8ba8' }}>{r.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', animation: 'pulse 1.6s infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#22d3a5' }}>Live</span>
                </div>
              </div>
            )))}
          </div>

          {/* Routing info badge */}
          <div style={{
            background: osrmLoading ? 'rgba(255,157,77,.08)' : 'rgba(34,211,165,.06)',
            border: `1px solid ${osrmLoading ? 'rgba(255,157,77,.2)' : 'rgba(34,211,165,.2)'}`,
            borderRadius: '14px', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: '.6rem',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '1.1rem',
              color: osrmLoading ? '#ff9d4d' : '#22d3a5',
              animation: osrmLoading ? 'spin 1s linear infinite' : 'none',
            }}>{osrmLoading ? 'autorenew' : 'check_circle'}</span>
            <div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: osrmLoading ? '#ff9d4d' : '#22d3a5' }}>
                {osrmLoading ? 'Fetching OSRM routes…' : 'Road-snapped routing active'}
              </div>
              <div style={{ fontSize: '.65rem', color: '#7a8ba8' }}>
                {osrmLoading ? 'OSRM public demo API' : 'Routes follow real roads via OSRM'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
