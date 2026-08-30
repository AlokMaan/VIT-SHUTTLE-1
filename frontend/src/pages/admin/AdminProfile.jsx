import React, { useState } from 'react';
import { User, Shield, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearAuth } from '../../utils/auth';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[var(--red)]" />
          My Profile
        </h1>
        <p className="text-[var(--text-3)] text-sm">Manage your admin account and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--red)] to-[var(--orange)] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[var(--red)]/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Super Admin</h2>
            <p className="text-[var(--text-3)] text-sm mb-4">admin@vit.ac.in</p>
            <span className="px-3 py-1 bg-[var(--red)]/10 text-[var(--red)] rounded-full text-xs font-medium border border-[var(--red)]/20">
              Full Access
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--red)]/10 hover:text-[var(--red)] hover:border-[var(--red)]/30 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout from Admin
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-[var(--accent)]" />
              Change Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Current Password</label>
                <input 
                  required type="password" 
                  value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">New Password</label>
                <input 
                  required type="password" 
                  value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Confirm New Password</label>
                <input 
                  required type="password" 
                  value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--red)]"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="px-6 py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors font-medium">
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Logins</h3>
            <div className="space-y-3">
              {[
                { ip: '192.168.1.104', location: 'VIT Campus', time: 'Today, 09:30 AM', status: 'Success' },
                { ip: '10.0.0.52', location: 'Vellore, TN', time: 'Yesterday, 14:15 PM', status: 'Success' },
              ].map((login, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
                  <div>
                    <p className="text-sm text-white font-medium">{login.location}</p>
                    <p className="text-xs text-[var(--text-3)] font-mono">{login.ip}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--green)] font-medium">{login.status}</p>
                    <p className="text-xs text-[var(--text-3)]">{login.time}</p>
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
