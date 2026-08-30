import React, { useState } from 'react';
import { Calendar, Clock, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminScheduleManager() {
  const [selectedRoute, setSelectedRoute] = useState('RL');
  const [schedule, setSchedule] = useState({
    startTime: '08:00',
    endTime: '20:00',
    frequency: 15,
    holidays: [
      { id: 1, date: '2023-12-25', description: 'Christmas', isOpen: false }
    ]
  });

  const handleSave = () => {
    toast.success('Schedule updated successfully');
  };

  const addHoliday = () => {
    setSchedule({
      ...schedule,
      holidays: [...schedule.holidays, { id: Date.now(), date: '', description: '', isOpen: false }]
    });
  };

  const removeHoliday = (id) => {
    setSchedule({
      ...schedule,
      holidays: schedule.holidays.filter(h => h.id !== id)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[var(--red)]" />
            Schedule & Timings
          </h1>
          <p className="text-[var(--text-3)] text-sm">Configure operating hours and holiday overrides</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRoute} 
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white"
          >
            <option value="RL">Red Line</option>
            <option value="BL">Blue Line</option>
            <option value="GL">Green Line</option>
          </select>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--red)] hover:bg-[var(--red)]/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-[var(--red)]/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            Daily Operating Hours
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">Start Time</label>
                <input 
                  type="time" 
                  value={schedule.startTime}
                  onChange={(e) => setSchedule({...schedule, startTime: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" 
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-2)] mb-1">End Time</label>
                <input 
                  type="time" 
                  value={schedule.endTime}
                  onChange={(e) => setSchedule({...schedule, endTime: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-2)] mb-1">Frequency (minutes)</label>
              <input 
                type="number" 
                min="5"
                value={schedule.frequency}
                onChange={(e) => setSchedule({...schedule, frequency: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white" 
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
            <p className="text-sm text-[var(--text-3)] mb-2">Estimated departures per day:</p>
            <p className="text-2xl font-bold text-white">~48 trips</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
              Holiday Overrides
            </h2>
            <button onClick={addHoliday} className="p-1.5 bg-[var(--surface-2)] hover:bg-[var(--border)] text-white rounded transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {schedule.holidays.length === 0 ? (
              <p className="text-[var(--text-3)] text-sm text-center py-4">No holiday overrides configured.</p>
            ) : schedule.holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-start gap-2 p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg group">
                <div className="flex-1 space-y-2">
                  <input 
                    type="date" 
                    value={holiday.date}
                    onChange={(e) => setSchedule({
                      ...schedule, 
                      holidays: schedule.holidays.map(h => h.id === holiday.id ? {...h, date: e.target.value} : h)
                    })}
                    className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="Description (e.g. Diwali)"
                    value={holiday.description}
                    onChange={(e) => setSchedule({
                      ...schedule, 
                      holidays: schedule.holidays.map(h => h.id === holiday.id ? {...h, description: e.target.value} : h)
                    })}
                    className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-white" 
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--text-2)] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={holiday.isOpen}
                      onChange={(e) => setSchedule({
                        ...schedule, 
                        holidays: schedule.holidays.map(h => h.id === holiday.id ? {...h, isOpen: e.target.checked} : h)
                      })}
                      className="rounded bg-[var(--surface)] border-[var(--border)] text-[var(--red)] focus:ring-[var(--red)]" 
                    />
                    Operate on this day (modified schedule)
                  </label>
                </div>
                <button onClick={() => removeHoliday(holiday.id)} className="p-1 text-[var(--text-3)] hover:text-[var(--red)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
