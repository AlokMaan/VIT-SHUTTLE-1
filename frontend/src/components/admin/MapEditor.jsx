import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Trash2, RotateCcw } from 'lucide-react';

/**
 * Leaflet-based map editor for routes and stops.
 *
 * Props:
 * - mode: 'route' | 'stop' (default 'route')
 * - path: [{ lat, lng }] (initial route path coordinates)
 * - stopLocation: { lat, lng } (initial stop position for mode='stop')
 * - geofenceRadius: number (meters, for mode='stop')
 * - routeColor: string (hex color for route polyline)
 * - onPathChange: (path: [{ lat, lng }]) => void
 * - onLocationChange: ({ lat, lng }) => void
 * - height: string (CSS height, default '400px')
 */

const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => resolve(window.L);
    document.head.appendChild(js);
  });

export default function MapEditor({
  mode = 'route',
  path = [],
  stopLocation = null,
  geofenceRadius = 50,
  routeColor = '#00d4b8',
  onPathChange,
  onLocationChange,
  height = '400px',
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const circleRef = useRef(null);
  const [L, setL] = useState(null);
  const [ready, setReady] = useState(false);

  // Load Leaflet
  useEffect(() => {
    loadLeaflet().then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [12.9698, 79.1557],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [L]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Route mode: waypoints + polyline
  useEffect(() => {
    if (!ready || !L || mode !== 'route') return;
    const map = mapRef.current;
    if (!map) return;

    clearMarkers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Add existing waypoints
    const waypoints = [...path];
    waypoints.forEach((pt, idx) => {
      const marker = L.marker([pt.lat, pt.lng], {
        draggable: true,
        title: `Waypoint ${idx + 1}`,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        waypoints[idx] = { lat: pos.lat, lng: pos.lng };
        updatePolyline(waypoints);
        onPathChange?.(waypoints);
      });

      markersRef.current.push(marker);
    });

    // Draw polyline
    const updatePolyline = (pts) => {
      if (polylineRef.current) polylineRef.current.remove();
      if (pts.length >= 2) {
        polylineRef.current = L.polyline(
          pts.map((p) => [p.lat, p.lng]),
          { color: routeColor, weight: 4, opacity: 0.8, dashArray: '8 4' }
        ).addTo(map);
      }
    };
    updatePolyline(waypoints);

    // Click to add waypoint
    const handleClick = (e) => {
      const pt = { lat: e.latlng.lat, lng: e.latlng.lng };
      waypoints.push(pt);
      const marker = L.marker([pt.lat, pt.lng], { draggable: true }).addTo(map);
      const newIdx = waypoints.length - 1;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        waypoints[newIdx] = { lat: pos.lat, lng: pos.lng };
        updatePolyline(waypoints);
        onPathChange?.(waypoints);
      });

      markersRef.current.push(marker);
      updatePolyline(waypoints);
      onPathChange?.([...waypoints]);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [ready, L, mode, routeColor]);

  // Stop mode: single draggable marker + geofence circle
  useEffect(() => {
    if (!ready || !L || mode !== 'stop') return;
    const map = mapRef.current;
    if (!map) return;

    clearMarkers();
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    const loc = stopLocation || { lat: 12.9698, lng: 79.1557 };
    const marker = L.marker([loc.lat, loc.lng], { draggable: true }).addTo(map);
    markersRef.current.push(marker);

    const circle = L.circle([loc.lat, loc.lng], {
      radius: geofenceRadius,
      color: '#00d4b8',
      fillColor: '#00d4b8',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;

    map.setView([loc.lat, loc.lng], 17);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      circle.setLatLng(pos);
      onLocationChange?.({ lat: pos.lat, lng: pos.lng });
    });

    // Click to reposition
    const handleClick = (e) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      onLocationChange?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [ready, L, mode, stopLocation, geofenceRadius]);

  const handleClear = () => {
    clearMarkers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    onPathChange?.([]);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: 'var(--text-4)' }}>
          {mode === 'route'
            ? 'Click map to add waypoints. Drag markers to adjust.'
            : 'Click map or drag marker to set location.'}
        </p>
        {mode === 'route' && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border-0 cursor-pointer"
            style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        style={{
          height,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
