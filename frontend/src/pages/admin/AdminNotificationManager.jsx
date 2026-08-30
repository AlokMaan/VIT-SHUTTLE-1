import React, { useState } from 'react';
import { Bell, Send, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotificationManager() {
  const [formData, setFormData] = useState({
    title: '', message: '', type: 'info', target: 'all'
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      toast.success('Push notification sent successfully!');
      setIsSending(false);
      setFormData({ title: '', message: '', type: 'info', target: 'all' });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-[var(--red)]" />
          Push Notifications
        </h1>
        <p className="text-[var(--text-3)] text-sm">Send real-time alerts to user devices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-[var(--primary)]" />
            Compose Message
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">Target Audience</label>
              <select 
                value={formData.target}
                onChange={e => setFormData({...formData, target: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:border-[var(--red)] focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="RL">Red Line Users Only</option>
                <option value="BL">Blue Line Users Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">Notification Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['info', 'warning', 'delay', 'route_change'].map(type => (
                  <label key={type} className={`
                    border rounded-lg p-2 text-center text-xs font-medium cursor-pointer transition-colors
                    ${formData.type === type ? 'bg-[var(--surface-2)] border-[var(--red)] text-white' : 'border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--surface-2)]'}
                  `}>
                    <input 
                      type="radio" name="type" value={type} className="hidden"
                      onChange={() => setFormData({...formData, type})}
                    />
                    {type.replace('_', ' ').toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">Title</label>
              <input 
                required
                type="text" 
                maxLength="50"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:border-[var(--red)] focus:outline-none"
                placeholder="e.g. Service Disruption"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">Message Body</label>
              <textarea 
                required
                rows="4"
                maxLength="150"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white focus:border-[var(--red)] focus:outline-none resize-none"
                placeholder="Enter detailed message..."
              ></textarea>
              <div className="text-right text-xs text-[var(--text-3)] mt-1">
                {formData.message.length}/150
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSending || !formData.title || !formData.message}
              className="w-full py-3 bg-[var(--red)] text-white rounded-lg font-medium hover:bg-[var(--red)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isSending ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification Now
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--accent)]" />
            Recent History
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-white">Heavy Rain Warning</h4>
                  <span className="text-[10px] text-[var(--text-3)] bg-[var(--surface)] px-2 py-0.5 rounded">All Users</span>
                </div>
                <p className="text-xs text-[var(--text-2)] mb-2">Expect delays on all routes due to severe waterlogging.</p>
                <div className="text-[10px] text-[var(--text-3)]">Sent: Today, 08:30 AM</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
