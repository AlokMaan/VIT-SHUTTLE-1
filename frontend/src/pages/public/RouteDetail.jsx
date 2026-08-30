import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, Navigation } from 'lucide-react';
import { publicApi } from '../../services/api';

const MOCK_ROUTE = {
  _id: '1',
  name: 'Alpha Route',
  color: '#00d4b8',
  description: 'Main circular route covering all major academic blocks and hostels.',
  hours: '08:00 AM - 08:00 PM',
  stops: [
    { id: 's1', name: 'Main Gate', eta: '0 mins', lat: 12.9698, lng: 79.1557 },
    { id: 's2', name: 'SJT', eta: '5 mins', lat: 12.9710, lng: 79.1580 },
    { id: 's3', name: 'TT', eta: '10 mins', lat: 12.9725, lng: 79.1595 },
    { id: 's4', name: 'Mens Hostel', eta: '15 mins', lat: 12.9740, lng: 79.1570 },
  ],
  activeShuttles: 2
};

export default function RouteDetail() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        // Replace with real API
        setTimeout(() => {
          setRoute(MOCK_ROUTE);
          setLoading(false);
        }, 600);
      } catch (err) {
        console.error(err);
        setRoute(MOCK_ROUTE);
        setLoading(false);
      }
    };
    fetchRoute();
  }, [id]);

  useEffect(() => {
    if (!loading && route && mapRef.current && !mapInstance.current) {
      // Dynamic Leaflet Injection
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
        if (!mapRef.current) return;
        
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([12.9698, 79.1557], 15);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
        
        if (route.stops && route.stops.length > 0) {
          const latlngs = route.stops.map(s => [s.lat, s.lng]);
          L.polyline(latlngs, { color: route.color, weight: 4 }).addTo(mapInstance.current);
          
          route.stops.forEach((stop, i) => {
            L.circleMarker([stop.lat, stop.lng], {
              radius: 6,
              fillColor: '#fff',
              color: route.color,
              weight: 2,
              fillOpacity: 1
            }).bindPopup(`<b>${stop.name}</b>`).addTo(mapInstance.current);
          });

          mapInstance.current.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, route]);

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!route) return <div className="min-h-screen bg-[var(--bg)] pt-24 text-center text-white">Route not found</div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <Link to="/routes" className="inline-flex items-center text-[var(--text-3)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Routes
        </Link>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-4 h-4 rounded-full shadow-[var(--shadow-glow)]" style={{ backgroundColor: route.color }}></span>
                    <h1 className="text-3xl font-bold text-[var(--text)]">{route.name}</h1>
                  </div>
                  <p className="text-[var(--text-3)] leading-relaxed">{route.description}</p>
                </div>
                <div className="bg-[var(--surface-2)] px-4 py-2 rounded-lg border border-[var(--border)] flex items-center gap-2">
                  <Navigation size={18} style={{ color: route.color }} />
                  <span className="font-semibold text-[var(--text)]">{route.activeShuttles} Active</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center text-[var(--text-2)]">
                  <Clock size={18} className="mr-2 opacity-70" />
                  {route.hours}
                </div>
                <div className="flex items-center text-[var(--text-2)]">
                  <Users size={18} className="mr-2 opacity-70" />
                  Medium Capacity
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden h-[400px] relative">
              <div ref={mapRef} className="absolute inset-0 z-0"></div>
            </div>
          </div>

          {/* Stops Timeline */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-xl font-bold text-[var(--text)] mb-6">Route Stops</h3>
            <div className="relative pl-4 space-y-8">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[var(--border)] z-0"></div>
              
              {route.stops.map((stop, index) => (
                <div key={stop.id} className="relative z-10 flex items-start gap-4">
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5 shadow-[var(--shadow-glow)]" 
                    style={{ backgroundColor: route.color, border: '2px solid var(--surface)' }}
                  ></div>
                  <div className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-lg hover:border-[var(--primary)] transition-colors cursor-pointer">
                    <h4 className="font-semibold text-[var(--text)]">{stop.name}</h4>
                    <p className="text-sm text-[var(--text-3)] mt-1 flex items-center">
                      <Clock size={14} className="mr-1" /> ETA: {stop.eta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
