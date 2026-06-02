import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { apiKey, saveApiKey, mode, changeMode } = useApp();
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    saveApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 640, animation: 'fadeUp 0.4s ease' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginBottom: 8 }}>Settings</h1>
      <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Configure Chronos to match your workflow</p>

      {/* Mode */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>Mode</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginBottom: 16 }}>
          Switch between Individual (student) and Business modes to get contextually relevant insights.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {['individual', 'business'].map((m) => (
            <button key={m} onClick={() => changeMode(m)} style={{
              flex: 1, padding: '16px', borderRadius: 'var(--radius)', border: '2px solid',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
              background: mode === m ? 'var(--accent-glow2)' : 'var(--surface)',
              color: mode === m ? 'var(--accent2)' : 'var(--text2)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m === 'individual' ? '👤' : '🏢'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'capitalize', fontSize: '0.95rem' }}>{m}</div>
              <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--muted)' }}>
                {m === 'individual' ? 'Students, freelancers' : 'Professionals, teams'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>Anthropic API Key</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginBottom: 16 }}>
          Required for AI Insights. Your key is stored locally in your browser and never sent to our servers — it goes directly to the Anthropic API.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ paddingRight: 42 }}
            />
            <button onClick={() => setShowKey((s) => !s)} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 16,
            }}>
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Key'}
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>
          Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>console.anthropic.com</a>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>About Chronos</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['📍 Location Tracking', 'Uses your device GPS to detect which known location you\'re in and infer your activity.'],
            ['📅 Calendar Integration', 'Cross-references your calendar events with location to provide context (e.g. "In Class: CS 101").'],
            ['🤖 AI Analysis', 'Claude analyzes your daily activity pattern and provides personalized insights and suggestions.'],
            ['✏️ Manual Override', 'Every inferred activity can be manually edited — start/end time, label, and category.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{title.split(' ')[0]}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{title.slice(3)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
