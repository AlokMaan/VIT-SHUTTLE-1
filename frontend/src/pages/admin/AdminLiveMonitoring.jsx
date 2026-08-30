import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, Activity, AlertCircle } from 'lucide-react';

export default function AdminLiveMonitoring() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = () => new Promise((resolve) => {
      if (window.L) return resolve(window.L);
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      js.onload = () => resolve(window.L);
      document.head.appendChild(js);
    });

    loadLeaflet().then((L) => {
      if (!mapRef.current) return;
      
      // Initialize map
      const map = L.map(mapRef.current).setView([12.9698, 79.1557], 16);
      
      // Add dark theme tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);

      // Example markers
      const movingIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 bg-[var(--green)] rounded-full border-2 border-white shadow-[0_0_15px_var(--green)] relative"><div class="absolute inset-0 bg-[var(--green)] rounded-full animate-ping opacity-75"></div></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([12.9698, 79.1557], { icon: movingIcon }).addTo(map)
        .bindPopup('<div class="text-black font-bold">BUS-01 (Moving)</div><div class="text-gray-600 text-sm">Speed: 25 km/h</div>');

      setMapLoaded(true);

      return () => map.remove();
    });
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-[var(--red)]" />
            Live Monitoring
          </h1>
          <p className="text-[var(--text-3)] text-sm">Real-time tracking of all active shuttles</p>
        </div>
        <div className="flex gap-4">
          <div className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="text-sm font-medium text-white">8 Active</span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium text-white">2 Idle</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)] z-10">
            <Activity className="w-8 h-8 text-[var(--red)] animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full z-0"></div>
        
        {/* Overlay panel */}
        <div className="absolute top-4 left-4 z-[400] w-64 bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] rounded-lg shadow-xl p-4 hidden md:block">
          <h3 className="text-sm font-bold text-white mb-3">Alerts & Status</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 bg-[var(--orange)]/10 border border-[var(--orange)]/20 rounded">
              <AlertCircle className="w-4 h-4 text-[var(--orange)] shrink-0 mt-0.5" />
              <p className="text-xs text-white">BUS-03 deviated from assigned route</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
