import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, FastForward, Calendar, Bus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminGpsReplay() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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
      
      const map = L.map(mapRef.current).setView([12.9698, 79.1557], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      // Dummy path
      const latlngs = [
        [12.9698, 79.1557], [12.9710, 79.1565], [12.9725, 79.1580]
      ];
      L.polyline(latlngs, {color: 'var(--red)', weight: 3}).addTo(map);

      setMapLoaded(true);

      return () => map.remove();
    });
  }, []);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && progress >= 100) setProgress(0);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => Math.min(p + 1, 100));
      }, 100);
    } else if (progress >= 100) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-[var(--text-3)]" />
            <select className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
              <option>BUS-01</option>
              <option>BUS-02</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--text-3)]" />
            <input type="date" className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none" />
          </div>
          <button className="px-4 py-1.5 bg-[var(--red)] text-white rounded-lg text-sm font-medium hover:bg-[var(--red)]/90 transition-colors">
            Load Data
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div ref={mapRef} className="w-full h-full z-0"></div>
        
        {/* Playback Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-2xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-2xl p-4">
          <div className="flex items-center gap-4">
            <button onClick={handlePlay} className="p-3 bg-[var(--red)] text-white rounded-full hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <div className="flex-1">
              <div className="flex justify-between text-xs text-[var(--text-3)] mb-1">
                <span>08:00 AM</span>
                <span>08:45 AM</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={progress} 
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--red)]"
              />
            </div>
            
            <button className="p-2 text-[var(--text-3)] hover:text-white transition-colors bg-[var(--surface-2)] rounded-lg flex items-center gap-1 text-xs font-bold">
              <FastForward className="w-4 h-4" />
              2x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
