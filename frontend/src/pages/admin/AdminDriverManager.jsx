import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDriverManager() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', licenseNo: '', assignedShuttle: '', status: 'active'
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setDrivers([
        { id: 1, name: 'Ramesh Kumar', phone: '9876543210', licenseNo: 'TN-14-12345', assignedShuttle: 'BUS-01', status: 'active' },
        { id: 2, name: 'Suresh Babu', phone: '8765432109', licenseNo: 'TN-14-67890', assignedShuttle: 'BUS-02', status: 'off_duty' },
        { id: 3, name: 'Muthu Vel', phone: '7654321098', licenseNo: 'TN-14-54321', assignedShuttle: 'None', status: 'on_leave' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const openModal = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({ ...driver });
    } else {
      setEditingDriver(null);
      setFormData({ name: '', phone: '', licenseNo: '', assignedShuttle: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, ...formData } : d));
      toast.success('Driver updated');
    } else {
      setDrivers([...drivers, { id: Date.now(), ...formData }]);
      toast.success('Driver created');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Confirm deletion of this driver?')) {
      setDrivers(drivers.filter(d => d.id !== id));
      toast.success('Driver deleted');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-[var(--green)]/10 text-[var(--green)]';
      case 'off_duty': return 'bg-[var(--text-3)]/10 text-[var(--text-3)]';
      case 'on_leave': return 'bg-[var(--orange)]/10 text-[var(--orange)]';
      default: return 'bg-[var(--text-3)]/10 text-[var(--text-3)]';
    }
  };

  const filteredDrivers = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--red)]" />
            Driver Management
          </h1>
          <p className="text-[var(--text-3)] text-sm">Manage driver profiles and assignments</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
        >
          <Plus className="w-5 h-5" />
          Add Driver
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="relative max-w-md mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input 
            type="text" 
            placeholder="Search drivers..." 
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
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">License No</th>
                <th className="py-3 px-4 font-medium">Assigned Shuttle</th>
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
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[var(--text-3)]">
                    No drivers found.
                  </td>
                </tr>
              ) : filteredDrivers.map(driver => (
                <tr key={driver.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors group">
                  <td className="py-3 px-4 font-medium text-white">{driver.name}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{driver.phone}</td>
                  <td className="py-3 px-4 text-[var(--text-2)] font-mono text-sm">{driver.licenseNo}</td>
                  <td className="py-3 px-4 text-[var(--text-2)]">{driver.assignedShuttle || 'None'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(driver.status)}`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(driver)} className="p-1.5 text-[var(--text-3)] hover:text-white bg-[var(--surface-2)] hover:bg-[var(--border)] rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(driver.id)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--red)] bg-[var(--surface-2)] hover:bg-[var(--red)]/10 rounded-md transition-colors">
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
            <h2 className="text-xl font-bold text-white mb-4">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-2)] mb-1">License No</label>
                  <input required type="text" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Assigned Shuttle</label>
                <select value={formData.assignedShuttle} onChange={e => setFormData({...formData, assignedShuttle: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white">
                  <option value="">None</option>
                  <option value="BUS-01">BUS-01</option>
                  <option value="BUS-02">BUS-02</option>
                  <option value="BUS-03">BUS-03</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white">
                  <option value="active">Active / On Duty</option>
                  <option value="off_duty">Off Duty</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--text-2)] hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
