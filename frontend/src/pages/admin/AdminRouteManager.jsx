import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Map } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRouteManager() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', color: '#00d4b8', frequency: 15, status: 'active'
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setRoutes([
        { id: 1, name: 'Red Line', code: 'RL', color: '#ff6b6b', stops: 8, frequency: 10, status: 'active' },
        { id: 2, name: 'Blue Line', code: 'BL', color: '#7c6dfa', stops: 12, frequency: 15, status: 'active' },
        { id: 3, name: 'Green Line', code: 'GL', color: '#22d3a5', stops: 5, frequency: 20, status: 'inactive' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const openModal = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({ ...route });
    } else {
      setEditingRoute(null);
      setFormData({ name: '', code: '', color: '#00d4b8', frequency: 15, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoute) {
      setRoutes(routes.map(r => r.id === editingRoute.id ? { ...r, ...formData } : r));
      toast.success('Route updated');
    } else {
      setRoutes([...routes, { id: Date.now(), ...formData, stops: 0 }]);
      toast.success('Route created');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Type YES to confirm deletion of this route.')) {
      setRoutes(routes.filter(r => r.id !== id));
      toast.success('Route deleted');
    }
  };

  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-[var(--red)]" />
            Route Management
          </h1>
          <p className="text-[var(--text-3)] text-sm">Manage shuttle routes and configurations</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
        >
          <Plus className="w-5 h-5" />
          Add Route
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="relative max-w-md mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input 
            type="text" 
            placeholder="Search routes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)] transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-sm">
                <th className="py-3 px-4 font-medium">Route</th>
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Stops</th>
                <th className="py-3 px-4 font-medium">Freq (min)</th>
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
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    No routes found.
                  </td>
                </tr>
              ) : filteredRoutes.map(route => (
                <tr key={route.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                      <span className="font-medium text-white">{route.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{route.code}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{route.stops}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{route.frequency}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      route.status === 'active' ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-[var(--text-3)]/10 text-[var(--text-3)]'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(route)} className="p-1.5 text-[var(--text-3)] hover:text-white bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(route.id)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--red)] bg-[var(--surface-2)] hover:bg-[var(--red)]/10 rounded-md transition-colors">
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
            <h2 className="text-xl font-bold text-white mb-4">{editingRoute ? 'Edit Route' : 'Add Route'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Route Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Color</label>
                  <input required type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full h-[42px] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Frequency (mins)</label>
                <input required type="number" min="1" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
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
                <button type="submit" className="px-4 py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors">Save Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
