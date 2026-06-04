import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const LOCATION_TYPES = [
  { value: 'dorm', label: 'Dorm / Home', icon: '🏠' },
  { value: 'dining', label: 'Dining Hall', icon: '🍽️' },
  { value: 'academic', label: 'Academic Building', icon: '🎓' },
  { value: 'library', label: 'Library', icon: '📚' },
  { value: 'gym', label: 'Gym / Rec Center', icon: '💪' },
  { value: 'social', label: 'Social Area', icon: '👥' },
  { value: 'office', label: 'Office / Work', icon: '💼' },
  { value: 'cafe', label: 'Coffee Shop / Café', icon: '☕' },
  { value: 'outdoor', label: 'Outdoors / Park', icon: '🌲' },
  { value: 'other', label: 'Other', icon: '📍' },
];

export default function Locations() {
  const { locations, isTracking, currentLocation, startTracking, stopTracking, fetchLocations, API } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'academic', icon: '🎓', lat: '', lng: '', radius: 50 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTrackToggle = () => {
    if (isTracking) {
      stopTracking(watchId);
      setWatchId(null);
    } else {
      const id = startTracking();
      setWatchId(id);
    }
  };

  const captureCurrentLocation = () => {
    if (currentLocation) {
      setForm((f) => ({ ...f, lat: currentLocation.lat.toFixed(6), lng: currentLocation.lng.toFixed(6) }));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
        () => setError('Could not get GPS location. Please enter coordinates manually.')
      );
    }
  };

  const handleTypeSelect = (t) => {
    setForm((f) => ({ ...f, type: t.value, icon: t.icon }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) { setError('Please enter a location name.'); return; }
    if (!form.lat || !form.lng) { setError('Please enter coordinates or use GPS capture.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          icon: form.icon,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          radius: parseInt(form.radius) || 50,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      await fetchLocations();
      setForm({ name: '', type: 'academic', icon: '🎓', lat: '', lng: '', radius: 50 });
      setShowAdd(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const typeConfig = Object.fromEntries(LOCATION_TYPES.map((t) => [t.value, t]));

  return (
    <div style={{ maxWidth: 800, animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Locations</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Known places used to infer your activities</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className={`btn ${isTracking ? 'btn-danger' : 'btn-secondary'}`} onClick={handleTrackToggle}>
            {isTracking ? '⏹ Stop Tracking' : '▶ Start Tracking'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setError(''); setShowAdd(true); }}>
            + Add Location
          </button>
        </div>
      </div>

      {currentLocation && (
        <div style={{
          background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-glow 2s infinite' }} />
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>Live Location:</span>
          <span style={{ color: 'var(--text2)' }}>
            {currentLocation.lat?.toFixed(5)}, {currentLocation.lng?.toFixed(5)}
            {currentLocation.speed != null && ` · ${(currentLocation.speed * 3.6).toFixed(1)} km/h`}
          </span>
        </div>
      )}

      {locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg2)', border: '1px dashed var(--border2)', borderRadius: 'var(--radius-lg)', color: 'var(--text2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No locations yet</h3>
          <button type="button" className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>Add Your First Location</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {locations.map((loc, i) => {
            const tc = typeConfig[loc.type] || typeConfig.other;
            return (
              <div key={loc.id} className="card fade-up" style={{ animationDelay: `${i * 0.05}s`, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)' }}>
                  {loc.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>{loc.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: 6 }}>{tc?.label || loc.type}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                    {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)} · {loc.radius}m radius
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">+ Add Known Location</div>

            {error && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', marginBottom: 16, fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Location Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Main Library, Office Building"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LOCATION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeSelect(t)}
                    style={{
                      padding: '5px 10px', borderRadius: 8, border: '1px solid',
                      cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-body)',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
              <div>
                <label>Latitude *</label>
                <input value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} placeholder="37.4268" />
              </div>
              <div>
                <label>Longitude *</label>
                <input value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} placeholder="-122.1670" />
              </div>
            </div>

            <button type="button" className="btn btn-secondary btn-sm" onClick={captureCurrentLocation} style={{ marginBottom: 16 }}>
              📍 Use Current GPS Location
            </button>

            <div className="form-group">
              <label>Detection Radius (meters)</label>
              <input
                type="number"
                value={form.radius}
                onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
                min="10" max="500"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
