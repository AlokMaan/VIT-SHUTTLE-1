import React, { useEffect, useRef, useState } from 'react';
import { Layers, MapPin, Navigation } from 'lucide-react';
import { publicApi } from '../../services/api';

const MOCK_BUSES = [
  { id: 'b1', route: 'Alpha', lat: 12.9710, lng: 79.1580, heading: 45, speed: 15, nextStop: 'SJT' },
  { id: 'b2', route: 'Beta', lat: 12.9730, lng: 79.1570, heading: 120, speed: 20, nextStop: 'TT' },
];

export default function PublicTracker() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const busMarkers = useRef({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let interval;
    
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) return resolve(window.L);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstance.current) return;
      
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([12.9698, 79.1557], 15);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
      setMapLoaded(true);

      const updateBuses = () => {
        MOCK_BUSES.forEach(bus => {
          if (!busMarkers.current[bus.id]) {
            const icon = L.divIcon({
              className: 'custom-bus-marker',
              html: `<div style="transform: rotate(${bus.heading}deg); background: var(--primary); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); border: 2px solid #fff;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            const marker = L.marker([bus.lat, bus.lng], { icon }).addTo(mapInstance.current);
            marker.on('click', () => setSelectedBus(bus));
            busMarkers.current[bus.id] = marker;
          } else {
            const marker = busMarkers.current[bus.id];
            marker.setLatLng([bus.lat, bus.lng]);
            const el = marker.getElement();
            if (el && el.firstChild) {
              el.firstChild.style.transform = `rotate(${bus.heading}deg)`;
            }
          }
        });
      };
      
      updateBuses();
      interval = setInterval(() => {
        // Mocking movement
        MOCK_BUSES.forEach(b => {
          b.lat += (Math.random() - 0.5) * 0.001;
          b.lng += (Math.random() - 0.5) * 0.001;
        });
        updateBuses();
      }, 5000);
    });

    return () => {
      clearInterval(interval);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] mt-16 bg-[var(--bg)] overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      
      {/* Floating UI overlays */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-[rgba(14,20,32,0.8)] backdrop-blur-md border border-[var(--border)] rounded-xl p-4 shadow-xl text-white">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
            <Layers size={18} className="text-[var(--primary)]" />
            Live Tracker
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--surface-2)] p-1 rounded">
              <input type="checkbox" defaultChecked className="accent-[var(--primary)]" /> Alpha Route
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--surface-2)] p-1 rounded">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" /> Beta Route
            </label>
          </div>
        </div>
      </div>

      {selectedBus && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-sm">
          <div className="bg-[rgba(14,20,32,0.9)] backdrop-blur-md border border-[var(--border)] rounded-xl p-5 shadow-2xl relative">
            <button 
              onClick={() => setSelectedBus(null)}
              className="absolute top-3 right-3 text-[var(--text-3)] hover:text-white"
            >
              &times;
            </button>
            <h3 className="font-bold text-lg text-[var(--text)] mb-1 flex items-center">
              <Navigation size={18} className="mr-2 text-[var(--primary)]" />
              {selectedBus.route} Shuttle
            </h3>
            <p className="text-sm text-[var(--text-3)] mb-4">ID: {selectedBus.id}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                <p className="text-xs text-[var(--text-3)] mb-1">Speed</p>
                <p className="font-semibold text-[var(--text)]">{selectedBus.speed} km/h</p>
              </div>
              <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                <p className="text-xs text-[var(--text-3)] mb-1">Next Stop</p>
                <p className="font-semibold text-[var(--text)]">{selectedBus.nextStop}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-bus-marker {
          transition: transform 1s linear;
        }
      `}} />
    </div>
  );
}
