import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INDIVIDUAL_ACTIVITY_TYPES, BUSINESS_ACTIVITY_TYPES } from '../pages/Timeline';

const CATEGORIES = ['academic', 'personal', 'exercise', 'work', 'social', 'transit', 'other'];

export default function ActivityModal({ activity, onClose }) {
  const { saveActivity, selectedDate, mode } = useApp();
  const ACTIVITY_TYPES = mode === 'business' ? BUSINESS_ACTIVITY_TYPES : INDIVIDUAL_ACTIVITY_TYPES;
  const isNew = !activity;

  const [form, setForm] = useState({
    label: '',
    type: 'other',
    icon: '📍',
    category: 'other',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    source: 'manual',
    date: selectedDate,
    ...activity,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sel = ACTIVITY_TYPES.find((t) => t.value === form.type);
    if (sel && isNew) {
      setForm((f) => ({ ...f, icon: sel.icon, category: sel.category, label: sel.label }));
    }
  }, [form.type]);

  const recalcDuration = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const dur = (eh * 60 + em) - (sh * 60 + sm);
    return dur > 0 ? dur : 0;
  };

  const handleChange = (key, val) => {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === 'startTime' || key === 'endTime') {
        next.durationMinutes = recalcDuration(next.startTime, next.endTime);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setError('');
    if (!form.label.trim()) { setError('Please enter a label for this activity.'); return; }
    if (!form.startTime) { setError('Please set a start time.'); return; }
    if (!form.endTime) { setError('Please set an end time.'); return; }
    if (form.durationMinutes <= 0) { setError('End time must be after start time.'); return; }
    setSaving(true);
    try {
      await saveActivity({ ...form, label: form.label.trim() });
      onClose();
    } catch (e) {
      setError('Failed to save. Make sure the server is running on port 3001.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{isNew ? '+ New Activity' : 'Edit Activity'}</div>

        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Activity Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleChange('type', t.value)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid',
                  cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)',
                  transition: 'all 0.12s',
                  borderColor: form.type === t.value ? 'var(--accent)' : 'var(--border)',
                  background: form.type === t.value ? 'var(--accent-glow2)' : 'var(--surface)',
                  color: form.type === t.value ? 'var(--accent2)' : 'var(--text2)',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Label *</label>
          <input
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="What were you doing?"
            autoFocus={isNew}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="form-group">
          <div>
            <label>Start Time *</label>
            <input type="time" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} />
          </div>
          <div>
            <label>End Time *</label>
            <input type="time" value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)} />
          </div>
          <div>
            <label>Duration</label>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', fontSize: '0.9rem',
              color: form.durationMinutes > 0 ? 'var(--text)' : 'var(--red)',
            }}>
              {form.durationMinutes >= 60
                ? `${Math.floor(form.durationMinutes / 60)}h ${form.durationMinutes % 60 > 0 ? `${form.durationMinutes % 60}m` : ''}`
                : form.durationMinutes > 0 ? `${form.durationMinutes}m` : '⚠ invalid'}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat)}
                style={{
                  padding: '5px 12px', borderRadius: 8, border: '1px solid',
                  cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)',
                  transition: 'all 0.12s', textTransform: 'capitalize',
                  borderColor: form.category === cat ? `var(--cat-${cat})` : 'var(--border)',
                  background: form.category === cat ? `var(--cat-${cat})20` : 'var(--surface)',
                  color: form.category === cat ? `var(--cat-${cat})` : 'var(--text2)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Icon (emoji)</label>
          <input value={form.icon} onChange={(e) => handleChange('icon', e.target.value)} style={{ maxWidth: 80 }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {saving ? 'Saving…' : isNew ? 'Add Activity' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
