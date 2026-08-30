import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStopManager() {
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [editingStop, setEditingStop] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', lat: '', lng: '', geofenceRadius: 50, status: 'active'
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setStops([
        { id: 1, name: 'Main Gate', code: 'MG', lat: '12.9698', lng: '79.1557', routes: ['RL', 'BL'], status: 'active' },
        { id: 2, name: 'SJT', code: 'SJT', lat: '12.9712', lng: '79.1580', routes: ['RL'], status: 'active' },
        { id: 3, name: 'Library', code: 'LIB', lat: '12.9734', lng: '79.1610', routes: ['BL', 'GL'], status: 'active' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const openModal = (stop = null) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({ ...stop });
    } else {
      setEditingStop(null);
      setFormData({ name: '', code: '', lat: '', lng: '', geofenceRadius: 50, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStop) {
      setStops(stops.map(s => s.id === editingStop.id ? { ...s, ...formData } : s));
      toast.success('Stop updated');
    } else {
      setStops([...stops, { id: Date.now(), ...formData, routes: [] }]);
      toast.success('Stop created');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Confirm deletion of this stop?')) {
      setStops(stops.filter(s => s.id !== id));
      toast.success('Stop deleted');
    }
  };

  const filteredStops = stops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[var(--red)]" />
            Stop Management
          </h1>
          <p className="text-[var(--text-3)] text-sm">Manage physical shuttle stops and geofences</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
        >
          <Plus className="w-5 h-5" />
          Add Stop
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="relative max-w-md mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input 
            type="text" 
            placeholder="Search stops..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)] transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-sm">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium">Routes</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredStops.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    No stops found.
                  </td>
                </tr>
              ) : filteredStops.map(stop => (
                <tr key={stop.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors group">
                  <td className="py-3 px-4 font-medium text-white">{stop.name}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{stop.code}</td>
                  <td className="py-3 px-4 text-[var(--text-3)] text-xs font-mono">{stop.lat}, {stop.lng}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {stop.routes.map(r => (
                        <span key={r} className="px-1.5 py-0.5 bg-[var(--surface-2)] border border-[var(--border)] rounded text-xs text-[var(--text-2)]">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      stop.status === 'active' ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-[var(--text-3)]/10 text-[var(--text-3)]'
                    }`}>
                      {stop.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(stop)} className="p-1.5 text-[var(--text-3)] hover:text-white bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(stop.id)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--red)] bg-[var(--surface-2)] hover:bg-[var(--red)]/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingStop ? 'Edit Stop' : 'Add Stop'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Stop Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Radius (m)</label>
                  <input required type="number" value={formData.geofenceRadius} onChange={e => setFormData({...formData, geofenceRadius: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Latitude</label>
                  <input required type="text" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Longitude</label>
                  <input required type="text" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--text-2)] hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors">Save Stop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
