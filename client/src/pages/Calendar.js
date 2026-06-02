import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';

const EVENT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const EVENT_TYPES = ['class', 'meeting', 'study', 'workout', 'event', 'reminder', 'other'];

export default function Calendar() {
  const { calendarEvents, selectedDate, saveCalendarEvent, locations } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'class', startTime: '09:00', endTime: '10:00',
    location: '', locationId: '', color: '#6366f1', date: selectedDate,
  });

  const sorted = [...calendarEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSave = async () => {
    if (!form.title || !form.startTime) return alert('Fill in required fields.');
    setSaving(true);
    await saveCalendarEvent({ ...form, date: selectedDate });
    setForm({ title: '', type: 'class', startTime: '09:00', endTime: '10:00', location: '', locationId: '', color: '#6366f1', date: selectedDate });
    setShowAdd(false);
    setSaving(false);
  };

  const typeIcons = { class: '📚', meeting: '🤝', study: '📖', workout: '💪', event: '🎉', reminder: '🔔', other: '📌' };

  return (
    <div style={{ maxWidth: 760, animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Calendar</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')} · {calendarEvents.length} events
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Event</button>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'var(--blue-bg)', border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
        fontSize: '0.82rem', color: 'var(--blue)',
      }}>
        💡 Calendar events are used to automatically infer activities. When you're at an academic location during a class time, it's logged as "In Class: [event name]".
      </div>

      {/* Events list */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', background: 'var(--bg2)',
          border: '1px dashed var(--border2)', borderRadius: 'var(--radius-lg)', color: 'var(--text2)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No events today</h3>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>Add Event</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((event, i) => (
            <div key={event.id} className="card fade-up" style={{
              animationDelay: `${i * 0.06}s`, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              borderLeft: `3px solid ${event.color || '#6366f1'}`,
            }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcons[event.type] || '📌'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{event.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                  {event.startTime} – {event.endTime}
                  {event.location && ` · 📍 ${event.location}`}
                </div>
              </div>
              <span className="badge" style={{ background: `${event.color || '#6366f1'}20`, color: event.color || '#6366f1', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add event modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-title">+ Add Calendar Event</div>

            <div className="form-group">
              <label>Event Title *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. CS 101 - Intro to Programming" />
            </div>

            <div className="form-group">
              <label>Type</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EVENT_TYPES.map((t) => (
                  <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} style={{
                    padding: '5px 10px', borderRadius: 8, border: '1px solid',
                    cursor: 'pointer', fontSize: '0.78rem', textTransform: 'capitalize',
                    borderColor: form.type === t ? 'var(--accent)' : 'var(--border)',
                    background: form.type === t ? 'var(--accent-glow2)' : 'var(--surface)',
                    color: form.type === t ? 'var(--accent2)' : 'var(--text2)',
                  }}>
                    {typeIcons[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
              <div><label>Start Time *</label><input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} /></div>
              <div><label>End Time</label><input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} /></div>
            </div>

            <div className="form-group">
              <label>Location Name</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Gates Hall 101" />
            </div>

            <div className="form-group">
              <label>Linked Known Location (for activity inference)</label>
              <select value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
                <option value="">— None —</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {EVENT_COLORS.map((c) => (
                  <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                    cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add Event'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
