import React, { useState } from 'react';
import { FileText, Filter, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminAuditLog() {
  const [expandedId, setExpandedId] = useState(null);

  const logs = [
    { id: 1, timestamp: '2023-10-25 14:30:22', admin: 'superadmin@vit.ac.in', action: 'UPDATE_ROUTE', target: 'Red Line (RL)', details: { before: { status: 'inactive' }, after: { status: 'active' } } },
    { id: 2, timestamp: '2023-10-25 12:15:00', admin: 'manager1@vit.ac.in', action: 'SEND_NOTIFICATION', target: 'All Users', details: { message: 'Bus delayed by 10 mins' } },
    { id: 3, timestamp: '2023-10-24 09:00:11', admin: 'superadmin@vit.ac.in', action: 'SYSTEM_SETTINGS', target: 'Maintenance Mode', details: { before: true, after: false } },
  ];

  const getActionColor = (action) => {
    if (action.includes('UPDATE')) return 'text-blue-400';
    if (action.includes('DELETE')) return 'text-red-400';
    if (action.includes('CREATE')) return 'text-green-400';
    return 'text-[var(--primary)]';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--red)]" />
            Audit Logs
          </h1>
          <p className="text-[var(--text-3)] text-sm">Track all administrative actions and system changes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <select className="pl-9 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--red)]">
              <option value="all">All Actions</option>
              <option value="auth">Authentication</option>
              <option value="crud">Data Changes</option>
              <option value="system">System Settings</option>
            </select>
          </div>
          <input type="date" className="px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white text-sm focus:outline-none" />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-sm bg-[var(--surface-2)]/30">
                <th className="w-8"></th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Admin / User</th>
                <th className="py-3 px-4 font-medium">Action</th>
                <th className="py-3 px-4 font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr 
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="pl-4 text-[var(--text-3)]">
                      {expandedId === log.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-2)] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-sm text-white">{log.admin}</td>
                    <td className="py-3 px-4 text-sm font-mono font-medium">
                      <span className={getActionColor(log.action)}>{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-2)]">{log.target}</td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-[var(--surface-2)]/50 border-b border-[var(--border)]">
                      <td colSpan="5" className="p-4">
                        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-lg font-mono text-xs text-[var(--text-2)] overflow-x-auto">
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[var(--border)] flex justify-between items-center text-sm text-[var(--text-3)]">
          <span>Showing 1-10 of 124 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded hover:text-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded hover:text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
