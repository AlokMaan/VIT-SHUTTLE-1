import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Clock } from 'lucide-react';

export default function AdminAnalytics() {
  const lineData = [
    { name: 'Mon', riders: 4000 }, { name: 'Tue', riders: 3000 }, { name: 'Wed', riders: 2000 },
    { name: 'Thu', riders: 2780 }, { name: 'Fri', riders: 1890 }, { name: 'Sat', riders: 2390 }, { name: 'Sun', riders: 3490 },
  ];

  const pieData = [
    { name: 'Daily Pass', value: 400 },
    { name: 'Monthly Pass', value: 300 },
    { name: 'Semester Pass', value: 300 },
  ];
  const COLORS = ['#00d4b8', '#7c6dfa', '#ff9d4d'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--red)]" />
            Analytics & Reports
          </h1>
          <p className="text-[var(--text-3)] text-sm">Deep dive into ridership and financial metrics</p>
        </div>
        <select className="px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-white text-sm focus:outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Semester</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-[var(--text-3)] text-sm font-medium mb-2">Total Ridership (7d)</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">19,550</span>
            <span className="text-sm text-[var(--green)]">+12%</span>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-[var(--text-3)] text-sm font-medium mb-2">Avg Wait Time</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">4.2 min</span>
            <span className="text-sm text-[var(--green)]">-0.5 min</span>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-[var(--text-3)] text-sm font-medium mb-2">Pass Revenue (7d)</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">₹1.2L</span>
            <span className="text-sm text-[var(--red)]">-3%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ridership Trend */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Ridership Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6dfa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c6dfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="riders" stroke="#7c6dfa" strokeWidth={3} fillOpacity={1} fill="url(#colorRiders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Active Pass Distribution</h2>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs text-[var(--text-2)]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
