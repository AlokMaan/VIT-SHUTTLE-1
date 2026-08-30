import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Bus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminShuttleManager() {
  const [shuttles, setShuttles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [editingShuttle, setEditingShuttle] = useState(null);
  const [formData, setFormData] = useState({
    busId: '', name: '', capacity: 40, routeId: '', status: 'active', isAC: false
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setShuttles([
        { id: 1, busId: 'BUS-01', name: 'Alpha 1', route: 'Red Line', capacity: 40, status: 'active', isAC: true },
        { id: 2, busId: 'BUS-02', name: 'Alpha 2', route: 'Blue Line', capacity: 30, status: 'idle', isAC: false },
        { id: 3, busId: 'BUS-03', name: 'Beta 1', route: 'Green Line', capacity: 50, status: 'maintenance', isAC: true },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const openModal = (shuttle = null) => {
    if (shuttle) {
      setEditingShuttle(shuttle);
      setFormData({ ...shuttle });
    } else {
      setEditingShuttle(null);
      setFormData({ busId: '', name: '', capacity: 40, routeId: '', status: 'active', isAC: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingShuttle) {
      setShuttles(shuttles.map(s => s.id === editingShuttle.id ? { ...s, ...formData } : s));
      toast.success('Shuttle updated');
    } else {
      setShuttles([...shuttles, { id: Date.now(), ...formData, route: 'Unassigned' }]);
      toast.success('Shuttle created');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Confirm deletion of this shuttle?')) {
      setShuttles(shuttles.filter(s => s.id !== id));
      toast.success('Shuttle deleted');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[var(--green)]/10 text-[var(--green)]';
      case 'idle': return 'bg-yellow-500/10 text-yellow-500';
      case 'maintenance': return 'bg-[var(--orange)]/10 text-[var(--orange)]';
      case 'out_of_service': return 'bg-[var(--red)]/10 text-[var(--red)]';
      default: return 'bg-[var(--text-3)]/10 text-[var(--text-3)]';
    }
  };

  const filteredShuttles = shuttles.filter(s => s.busId.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bus className="w-6 h-6 text-[var(--red)]" />
            Shuttle Management
          </h1>
          <p className="text-[var(--text-3)] text-sm">Manage shuttle fleet and assignments</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
        >
          <Plus className="w-5 h-5" />
          Add Shuttle
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="relative max-w-md mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input 
            type="text" 
            placeholder="Search shuttles..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)] transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-sm">
                <th className="py-3 px-4 font-medium">Bus ID / Name</th>
                <th className="py-3 px-4 font-medium">Route</th>
                <th className="py-3 px-4 font-medium">Capacity</th>
                <th className="py-3 px-4 font-medium">Features</th>
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
              ) : filteredShuttles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    No shuttles found.
                  </td>
                </tr>
              ) : filteredShuttles.map(shuttle => (
                <tr key={shuttle.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors group">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{shuttle.busId}</div>
                    <div className="text-xs text-[var(--text-3)]">{shuttle.name}</div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{shuttle.route}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{shuttle.capacity}</td>
                  <td className="py-3 px-4">
                    {shuttle.isAC ? (
                      <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs">A/C</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-[var(--surface-2)] border border-[var(--border)] rounded text-xs text-[var(--text-3)]">Non-A/C</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(shuttle.status)}`}>
                      {shuttle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(shuttle)} className="p-1.5 text-[var(--text-3)] hover:text-white bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(shuttle.id)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--red)] bg-[var(--surface-2)] hover:bg-[var(--red)]/10 rounded-md transition-colors">
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
            <h2 className="text-xl font-bold text-white mb-4">{editingShuttle ? 'Edit Shuttle' : 'Add Shuttle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Bus ID</label>
                  <input required type="text" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white uppercase" placeholder="e.g. BUS-01" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" placeholder="Alpha 1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Capacity</label>
                  <input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-[var(--text-2)] cursor-pointer">
                    <input type="checkbox" checked={formData.isAC} onChange={e => setFormData({...formData, isAC: e.target.checked})} className="rounded bg-[var(--surface-2)] border-[var(--border)] text-[var(--red)] focus:ring-[var(--red)]" />
                    A/C Equipped
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white">
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--text-2)] hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors">Save Shuttle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
