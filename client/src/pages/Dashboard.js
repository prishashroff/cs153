import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

const CAT_COLORS = {
  academic: '#818cf8', personal: '#34d399', exercise: '#f472b6',
  social: '#fbbf24', work: '#60a5fa', transit: '#94a3b8', other: '#6b7280', sleep: '#6366f1',
};

export default function Dashboard() {
  const { activities, calendarEvents, selectedDate, mode, getActivityDuration, getCategoryColor } = useApp();

  const stats = useMemo(() => {
    const totals = {};
    let totalMins = 0;
    activities.forEach((a) => {
      const dur = getActivityDuration(a);
      totals[a.category] = (totals[a.category] || 0) + dur;
      totalMins += dur;
    });
    return { totals, totalMins, count: activities.length };
  }, [activities]);

  const pieData = Object.entries(stats.totals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value),
    key: name,
  })).sort((a, b) => b.value - a.value);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, minutes: 0, category: 'none' }));
    activities.forEach((a) => {
      const [sh] = a.startTime.split(':').map(Number);
      const [eh] = a.endTime.split(':').map(Number);
      for (let h = sh; h <= Math.min(eh, 23); h++) {
        hours[h].minutes = Math.min(60, hours[h].minutes + 30);
        hours[h].category = a.category;
        hours[h].color = CAT_COLORS[a.category] || CAT_COLORS.other;
      }
    });
    return hours.filter((h) => h.minutes > 0);
  }, [activities]);

  const dateLabel = format(parseISO(selectedDate), 'EEEE, MMMM d');
  const productiveCategories = mode === 'business' ? ['work', 'academic'] : ['academic', 'work'];
  const productiveMins = productiveCategories.reduce((s, c) => s + (stats.totals[c] || 0), 0);
  const productivePct = stats.totalMins > 0 ? Math.round((productiveMins / stats.totalMins) * 100) : 0;

  const statCards = [
    { label: 'Total Tracked', value: `${Math.floor(stats.totalMins / 60)}h ${stats.totalMins % 60}m`, icon: '⏱', color: 'var(--accent)' },
    { label: mode === 'business' ? 'Productive Time' : 'Study Time', value: `${Math.floor(productiveMins / 60)}h ${productiveMins % 60}m`, icon: mode === 'business' ? '💼' : '📚', color: 'var(--green)' },
    { label: 'Activities', value: stats.count, icon: '📋', color: 'var(--blue)' },
    { label: 'Calendar Events', value: calendarEvents.length, icon: '📅', color: 'var(--yellow)' },
  ];

  return (
    <div style={{ maxWidth: 1000, animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Dashboard</h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>{dateLabel} · {mode === 'business' ? '🏢 Business' : '👤 Individual'} mode</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card fade-up" style={{ animationDelay: `${i * 0.07}s`, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 28, opacity: 0.7 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Time breakdown pie */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: '1rem' }}>Time Breakdown</h3>
          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((d) => <Cell key={d.key} fill={CAT_COLORS[d.key] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Math.floor(v / 60)}h ${v % 60}m`, 'Time']} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((d) => (
                  <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[d.key] || '#6b7280' }} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: CAT_COLORS[d.key] }}>
                      {Math.floor(d.value / 60)}h{d.value % 60 > 0 ? ` ${d.value % 60}m` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Productivity score */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 16 }}>
            {mode === 'business' ? 'Work Focus' : 'Study Focus'}
          </div>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="70" cy="70" r="58" fill="none"
                stroke={productivePct >= 50 ? 'var(--green)' : productivePct >= 25 ? 'var(--yellow)' : 'var(--red)'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58 * productivePct / 100} ${2 * Math.PI * 58}`}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>{productivePct}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>of tracked time</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text2)', maxWidth: 180 }}>
            {productiveMins} min of {mode === 'business' ? 'work' : 'study & classes'}
          </div>
        </div>
      </div>

      {/* Activity timeline bar */}
      {activities.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: '1rem' }}>Activity Timeline</h3>
          <div style={{ display: 'flex', height: 48, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
            {activities.map((a) => {
              const dur = getActivityDuration(a);
              const pct = (dur / 1440) * 100;
              const color = CAT_COLORS[a.category] || CAT_COLORS.other;
              return (
                <div key={a.id} title={`${a.label} (${a.startTime}–${a.endTime})`}
                  style={{ flex: pct, background: color, opacity: 0.85, minWidth: 2, cursor: 'default', borderRadius: 2 }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--text2)' }}>
            <span>12:00 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11:59 PM</span>
          </div>
        </div>
      )}
    </div>
  );
}
