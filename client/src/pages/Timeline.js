import React, { useState } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import ActivityModal from '../components/ActivityModal';

const INDIVIDUAL_ACTIVITY_TYPES = [
  { value: 'sleep', label: 'Sleeping', icon: '😴', category: 'personal' },
  { value: 'eating', label: 'Eating', icon: '🍽️', category: 'personal' },
  { value: 'class', label: 'In Class', icon: '📚', category: 'academic' },
  { value: 'studying', label: 'Studying', icon: '📖', category: 'academic' },
  { value: 'working', label: 'Working', icon: '💼', category: 'work' },
  { value: 'exercise', label: 'Exercise', icon: '💪', category: 'exercise' },
  { value: 'walking', label: 'Walking', icon: '🚶', category: 'exercise' },
  { value: 'biking', label: 'Biking', icon: '🚴', category: 'exercise' },
  { value: 'transit', label: 'Transit', icon: '🚗', category: 'transit' },
  { value: 'social', label: 'Social', icon: '👥', category: 'social' },
  { value: 'cafe', label: 'Café', icon: '☕', category: 'personal' },
  { value: 'home', label: 'At Home', icon: '🏠', category: 'personal' },
  { value: 'meeting', label: 'Meeting', icon: '🤝', category: 'work' },
  { value: 'other', label: 'Other', icon: '📍', category: 'other' },
];

const BUSINESS_ACTIVITY_TYPES = [
  { value: 'deep_work', label: 'Deep Work', icon: '🧠', category: 'work' },
  { value: 'deliverable', label: 'Working on Deliverable', icon: '📋', category: 'work' },
  { value: 'meeting', label: 'Meeting', icon: '🤝', category: 'work' },
  { value: 'touch_base', label: 'Touch Base', icon: '📞', category: 'work' },
  { value: 'client_call', label: 'Client Call', icon: '📱', category: 'work' },
  { value: 'email', label: 'Email / Comms', icon: '📧', category: 'work' },
  { value: 'planning', label: 'Planning & Strategy', icon: '🗺️', category: 'work' },
  { value: 'review', label: 'Review & Feedback', icon: '🔍', category: 'work' },
  { value: 'training', label: 'Training / L&D', icon: '📈', category: 'academic' },
  { value: 'lunch', label: 'Lunch Break', icon: '🍽️', category: 'personal' },
  { value: 'commute', label: 'Commute', icon: '🚗', category: 'transit' },
  { value: 'exercise', label: 'Exercise', icon: '💪', category: 'exercise' },
  { value: 'admin', label: 'Admin Tasks', icon: '🗂️', category: 'work' },
  { value: 'other', label: 'Other', icon: '📍', category: 'other' },
];

const ACTIVITY_TYPES = INDIVIDUAL_ACTIVITY_TYPES; // default export for ActivityModal fallback

export { ACTIVITY_TYPES, INDIVIDUAL_ACTIVITY_TYPES, BUSINESS_ACTIVITY_TYPES };

export default function Timeline() {
  const { selectedDate, setSelectedDate, activities, calendarEvents, deleteActivity, getCategoryColor, getActivityDuration, mode } = useApp();
  const activityTypes = mode === 'business' ? BUSINESS_ACTIVITY_TYPES : INDIVIDUAL_ACTIVITY_TYPES;
  const [editingActivity, setEditingActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dateLabel = format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy');
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  const totalMinutes = activities.reduce((sum, a) => sum + getActivityDuration(a), 0);

  const categoryTotals = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + getActivityDuration(a);
    return acc;
  }, {});

  const openEdit = (activity) => { setEditingActivity(activity); setShowModal(true); };
  const openNew = () => { setEditingActivity(null); setShowModal(true); };

  return (
    <div style={{ maxWidth: 900, animation: 'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Daily Timeline
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{dateLabel} · {activities.length} activities tracked</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <span>+</span> Add Activity
        </button>
      </div>

      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>← Prev</button>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          style={{ width: 160 }} />
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>Next →</button>
        {!isToday && (
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>Today</button>
        )}
        {isToday && <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent2)' }}>Today</span>}
      </div>

      {/* Category summary pills */}
      {Object.keys(categoryTotals).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {Object.entries(categoryTotals).map(([cat, mins]) => (
            <div key={cat} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 100,
              background: 'var(--surface)', border: '1px solid var(--border)',
              fontSize: '0.78rem', fontWeight: 500,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoryColor(cat) }} />
              <span style={{ textTransform: 'capitalize', color: 'var(--text2)' }}>{cat}</span>
              <span style={{ color: getCategoryColor(cat), fontFamily: 'var(--font-display)' }}>
                {Math.round(mins / 60 * 10) / 10}h
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'var(--bg2)', border: '1px dashed var(--border2)',
          borderRadius: 'var(--radius-lg)', color: 'var(--text2)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No activities logged yet</h3>
          <p style={{ marginBottom: 20 }}>Start tracking your day or add activities manually</p>
          <button className="btn btn-primary" onClick={openNew}>+ Add First Activity</button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 72, top: 0, bottom: 0,
            width: 2, background: 'linear-gradient(to bottom, transparent, var(--border2), transparent)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activities.map((activity, i) => {
              const duration = getActivityDuration(activity);
              const color = getCategoryColor(activity.category);
              const calEvent = calendarEvents.find((e) => e.startTime === activity.startTime);

              return (
                <div key={activity.id} className="timeline-item fade-up"
                  style={{ animationDelay: `${i * 0.04}s`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                  {/* Time column */}
                  <div style={{ width: 60, textAlign: 'right', flexShrink: 0, paddingTop: 14 }}>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', color: 'var(--text2)', fontWeight: 600 }}>
                      {activity.startTime}
                    </div>
                  </div>

                  {/* Dot */}
                  <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ marginTop: 16, width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid var(--bg2)', boxShadow: `0 0 0 3px ${color}30`, flexShrink: 0 }} />
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1, marginBottom: 8,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '14px 16px',
                    borderLeft: `3px solid ${color}`,
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    onClick={() => openEdit(activity)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{activity.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activity.label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>
                            {activity.startTime} – {activity.endTime}
                            <span style={{ margin: '0 6px' }}>·</span>
                            {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60 > 0 ? `${duration % 60}m` : ''}` : `${duration}m`}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {activity.source === 'calendar' && (
                          <span className="badge" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: '0.68rem' }}>📅 calendar</span>
                        )}
                        <span className="badge" style={{ background: `${color}15`, color, fontSize: '0.68rem', textTransform: 'capitalize' }}>
                          {activity.category}
                        </span>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(activity); }}
                          style={{ opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        >✏️</button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this activity?')) deleteActivity(activity.id); }}
                          style={{ opacity: 0, transition: 'opacity 0.15s', color: 'var(--red)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.closest('.timeline-item') && null; }}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        >🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <ActivityModal
          activity={editingActivity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
