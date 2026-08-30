import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, Shield, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    publicTracker: true,
    capacityDisplay: true,
    enable3DMap: false,
    siteName: 'VIT ShuttleAI',
    accentColor: '#ff6b6b'
  });

  const handleSave = () => {
    toast.success('Global settings updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[var(--red)]" />
            System Settings
          </h1>
          <p className="text-[var(--text-3)] text-sm">Configure global application behavior</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Core Settings */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--orange)]" />
              Core System
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Maintenance Mode
                </h3>
                <p className="text-sm text-[var(--text-3)] mt-1">Disables access to the public app for users. Admin portal remains active.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.maintenanceMode}
                  onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                />
                <div className="w-11 h-6 bg-[var(--surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">System Name</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={e => setSettings({...settings, siteName: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[var(--primary)]" />
              App Features
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-white text-sm font-medium">Public Live Tracker</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">Allow users to see live shuttle locations on the map.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.publicTracker} onChange={e => setSettings({...settings, publicTracker: e.target.checked})} />
                <div className="w-9 h-5 bg-[var(--surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--green)]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-white text-sm font-medium">Real-time Capacity Display</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">Show crowdedness levels (Low, Medium, High) to users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.capacityDisplay} onChange={e => setSettings({...settings, capacityDisplay: e.target.checked})} />
                <div className="w-9 h-5 bg-[var(--surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-medium">Enable 3D Map View (Experimental)</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">Enable 3D buildings in Mapbox view for supported devices.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.enable3DMap} onChange={e => setSettings({...settings, enable3DMap: e.target.checked})} />
                <div className="w-9 h-5 bg-[var(--surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--green)]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
