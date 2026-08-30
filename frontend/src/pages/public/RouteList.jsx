import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, MapPin, ChevronRight, Route as RouteIcon, Activity } from 'lucide-react';
import { publicApi } from '../../services/api';

const MOCK_ROUTES = [
  { _id: '1', name: 'Alpha Route', color: '#00d4b8', stopsCount: 8, frequency: 'Every 10 mins', hours: '08:00 AM - 08:00 PM', active: true },
  { _id: '2', name: 'Beta Route', color: '#7c6dfa', stopsCount: 6, frequency: 'Every 15 mins', hours: '08:00 AM - 07:00 PM', active: true },
  { _id: '3', name: 'Charlie Route', color: '#ff9d4d', stopsCount: 12, frequency: 'Every 20 mins', hours: '07:30 AM - 09:00 PM', active: true },
  { _id: '4', name: 'Delta Route', color: '#ff6b6b', stopsCount: 5, frequency: 'Every 15 mins', hours: '09:00 AM - 05:00 PM', active: false },
];

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await publicApi.getRoutes(searchQuery);
        // setRoutes(response.data);
        setTimeout(() => {
          setRoutes(MOCK_ROUTES);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("API error, using mock data", err);
        setRoutes(MOCK_ROUTES);
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-8 pb-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Campus Routes</h1>
            <p className="text-[var(--text-3)]">Explore all available shuttle paths across VIT</p>
          </div>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={20} />
            <input 
              type="text" 
              placeholder="Search routes or stops..." 
              className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-full py-3 pl-12 pr-4 outline-none focus:border-[var(--primary)] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-[var(--surface)] rounded-[var(--radius-lg)] h-48 border border-[var(--border)]"></div>
            ))}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)]">
            <RouteIcon size={48} className="mx-auto text-[var(--text-3)] mb-4" />
            <h3 className="text-xl font-medium text-[var(--text)] mb-2">No routes found</h3>
            <p className="text-[var(--text-3)]">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map((route) => (
              <Link 
                key={route._id} 
                to={`/routes/${route._id}`}
                className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 transition-all hover:bg-[var(--surface-2)] overflow-hidden"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                  style={{ backgroundColor: route.color }}
                />
                
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[var(--text)]">{route.name}</h2>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${route.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {route.active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-[var(--text-3)] text-sm">
                    <MapPin size={16} className="mr-2 text-[var(--text-2)]" />
                    {route.stopsCount} Stops
                  </div>
                  <div className="flex items-center text-[var(--text-3)] text-sm">
                    <Activity size={16} className="mr-2 text-[var(--text-2)]" />
                    {route.frequency}
                  </div>
                  <div className="flex items-center text-[var(--text-3)] text-sm">
                    <Clock size={16} className="mr-2 text-[var(--text-2)]" />
                    {route.hours}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-medium mt-auto pt-4 border-t border-[var(--border)]">
                  <span style={{ color: route.color }}>View Details</span>
                  <ChevronRight size={16} className="text-[var(--text-3)] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
