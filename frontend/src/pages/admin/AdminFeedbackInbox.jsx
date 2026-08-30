import React, { useState } from 'react';
import { MessageSquare, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFeedbackInbox() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);

  const mockData = [
    { id: 'FB-001', title: 'AC not working', category: 'Maintenance', priority: 'high', status: 'pending', date: 'Today, 10:30 AM', student: '20BCT0123' },
    { id: 'FB-002', title: 'Rude behavior by driver', category: 'Staff', priority: 'high', status: 'in_review', date: 'Yesterday', student: '21BCE1122' },
    { id: 'FB-003', title: 'App tracking inaccurate', category: 'App Issue', priority: 'medium', status: 'resolved', date: 'Oct 12', student: '19BME0045' },
  ];

  const filtered = activeTab === 'all' ? mockData : mockData.filter(d => d.status === activeTab);

  const getPriorityColor = (p) => {
    if (p === 'high') return 'text-[var(--red)] bg-[var(--red)]/10';
    if (p === 'medium') return 'text-[var(--orange)] bg-[var(--orange)]/10';
    return 'text-[var(--primary)] bg-[var(--primary)]/10';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* List Panel */}
      <div className="w-full md:w-1/2 lg:w-2/3 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--red)]" />
            Feedback & Complaints
          </h2>
        </div>
        
        <div className="flex border-b border-[var(--border)] overflow-x-auto hide-scrollbar">
          {['all', 'pending', 'in_review', 'resolved', 'rejected'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-[var(--red)] text-white' : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedItem?.id === item.id ? 'border-[var(--red)] bg-[var(--surface-2)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--text-3)]">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-3)] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.date}
                </span>
              </div>
              <h3 className="text-white font-medium mb-1">{item.title}</h3>
              <div className="flex items-center gap-4 text-sm text-[var(--text-2)]">
                <span>Category: {item.category}</span>
                <span>By: {item.student}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--text-3)]">No feedback found for this filter.</div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="hidden md:flex flex-col w-1/2 lg:w-1/3 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        {selectedItem ? (
          <>
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-white mb-2">{selectedItem.title}</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded text-xs">ID: {selectedItem.id}</span>
                <span className="px-2 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded text-xs">Student: {selectedItem.student}</span>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="prose prose-invert max-w-none text-sm text-[var(--text-2)]">
                <p>Detailed description of the issue would go here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
              <div className="mt-8 space-y-4">
                <h4 className="text-sm font-bold text-white">Admin Actions</h4>
                <div>
                  <label className="block text-xs text-[var(--text-3)] mb-1">Update Status</label>
                  <select className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-white focus:outline-none">
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-3)] mb-1">Admin Notes (Internal)</label>
                  <textarea rows="3" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-white focus:outline-none" placeholder="Add resolution notes..."></textarea>
                </div>
                <button 
                  onClick={() => toast.success('Feedback updated')}
                  className="w-full py-2 bg-[var(--red)] text-white rounded-lg hover:bg-[var(--red)]/90 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-3)] p-6 text-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a feedback item from the list to view details and take action.</p>
          </div>
        )}
      </div>
    </div>
  );
}
