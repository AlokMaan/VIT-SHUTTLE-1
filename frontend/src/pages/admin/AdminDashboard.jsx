import React, { useState, useEffect } from 'react';
import { 
  Users, Map, Bus, AlertTriangle, IndianRupee, 
  Bell, Settings, Activity, ArrowRight, Loader2, ServerCrash 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setStats({
        routes: 4,
        stops: 28,
        shuttles: 12,
        feedback: 5,
        revenue: 45000
      });
      setLogs([
        { id: 1, action: 'Route Updated', target: 'Red Line', time: '10 mins ago', admin: 'Admin 1' },
        { id: 2, action: 'Shuttle Status Changed', target: 'BUS-04', time: '1 hour ago', admin: 'System' },
        { id: 3, action: 'Driver Assigned', target: 'John Doe', time: '2 hours ago', admin: 'Admin 2' },
        { id: 4, action: 'Schedule Override', target: 'Blue Line', time: 'Yesterday', admin: 'Admin 1' },
        { id: 5, action: 'Settings Updated', target: 'Maintenance Mode', time: 'Yesterday', admin: 'System' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePushNotification = () => {
    toast.success('Push notification dialog opened');
  };

  const handleMaintenanceToggle = () => {
    toast.success('Maintenance mode toggled');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--red)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <ServerCrash className="w-12 h-12 text-[var(--red)] mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Failed to load dashboard</h3>
        <p className="text-[var(--text-3)] mb-4">The server encountered an error while fetching stats.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--surface-2)] text-white rounded-lg hover:bg-[var(--border)] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Routes', value: stats?.routes, icon: Map, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' },
    { title: 'Total Stops', value: stats?.stops, icon: Map, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
    { title: 'Active Shuttles', value: stats?.shuttles, icon: Bus, color: 'text-[var(--green)]', bg: 'bg-[var(--green)]/10' },
    { title: 'Open Feedback', value: stats?.feedback, icon: AlertTriangle, color: 'text-[var(--orange)]', bg: 'bg-[var(--orange)]/10' },
    { title: 'Today\'s Revenue', value: `₹${stats?.revenue}`, icon: IndianRupee, color: 'text-[var(--red)]', bg: 'bg-[var(--red)]/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-[var(--text-3)] text-sm">System status and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePushNotification}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--border)] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Bell className="w-4 h-4 text-[var(--orange)]" />
            Push Notification
          </button>
          <button 
            onClick={handleMaintenanceToggle}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--border)] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Settings className="w-4 h-4 text-[var(--red)]" />
            Toggle Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-start gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[var(--text-3)] text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--red)]" />
              <h2 className="text-lg font-bold text-white">System Health</h2>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border border-[var(--border)] border-dashed rounded-lg text-[var(--text-3)]">
            [Chart Placeholder: System load & active connections]
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-[var(--red)] mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{log.action}</p>
                  <p className="text-xs text-[var(--text-3)] truncate">{log.target} • by {log.admin}</p>
                </div>
                <div className="text-xs text-[var(--text-3)] whitespace-nowrap">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-sm text-[var(--red)] hover:text-white transition-colors bg-[var(--red)]/10 hover:bg-[var(--red)]/20 rounded-lg">
            View Full Audit Log
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
