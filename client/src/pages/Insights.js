import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';

const PRIORITY_CONFIG = {
  high: { color: 'var(--red)', bg: 'var(--red-bg)', label: '↑ High Priority' },
  medium: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: '→ Medium' },
  low: { color: 'var(--green)', bg: 'var(--green-bg)', label: '↓ Low' },
};

const INSIGHT_CONFIG = {
  positive: { color: 'var(--green)', icon: '✓', bg: 'var(--green-bg)', border: 'rgba(52,211,153,0.15)' },
  negative: { color: 'var(--red)', icon: '!', bg: 'var(--red-bg)', border: 'rgba(248,113,113,0.15)' },
  neutral: { color: 'var(--blue)', icon: 'i', bg: 'var(--blue-bg)', border: 'rgba(96,165,250,0.15)' },
};

export default function Insights() {
  const { activities, selectedDate, mode, apiKey, API, getActivityDuration } = useApp();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    if (!apiKey) { setError('Please set your Anthropic API key in Settings first.'); return; }
    if (activities.length === 0) { setError('No activities to analyze for this day.'); return; }
    setLoading(true); setError(''); setAnalysis(null);

    try {
      const res = await fetch(`${API}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ activities, mode, date: selectedDate }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const dateLabel = format(parseISO(selectedDate), 'EEEE, MMMM d');

  return (
    <div style={{ maxWidth: 820, animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
          AI Insights
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>{dateLabel} · Powered by Claude</p>
      </div>

      {/* Run analysis CTA */}
      {!analysis && !loading && (
        <div style={{
          background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)', padding: '48px 40px',
          textAlign: 'center', marginBottom: 24,
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔮</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>Analyze Your Day</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Claude will analyze your {activities.length} logged activities and provide personalized insights and recommendations.
          </p>
          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', marginBottom: 16, fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" onClick={runAnalysis} style={{ fontSize: '1rem', padding: '14px 28px' }}>
            ✦ Run AI Analysis
          </button>
          {!apiKey && (
            <p style={{ color: 'var(--text2)', fontSize: '0.8rem', marginTop: 12 }}>
              ⚠ No API key set — go to <a href="/settings" style={{ color: 'var(--accent2)' }}>Settings</a> to add your Anthropic API key.
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Analyzing your day…</h3>
          <p style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Claude is reviewing {activities.length} activities</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Score hero */}
          <div style={{
            background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
            border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)',
            padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 32,
          }}>
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none"
                  stroke={analysis.score >= 70 ? 'var(--green)' : analysis.score >= 40 ? 'var(--yellow)' : 'var(--red)'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46 * analysis.score / 100} ${2 * Math.PI * 46}`}
                  transform="rotate(-90 55 55)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{analysis.score}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Day Score</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', lineHeight: 1.3 }}>{analysis.headline}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setAnalysis(null)} style={{ marginTop: 12, color: 'var(--text2)' }}>
                ↺ Re-analyze
              </button>
            </div>
          </div>

          {/* Insights */}
          {analysis.insights?.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysis.insights.map((ins, i) => {
                  const cfg = INSIGHT_CONFIG[ins.type] || INSIGHT_CONFIG.neutral;
                  return (
                    <div key={i} style={{
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: 'var(--radius)', padding: '14px 16px',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: cfg.color, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, marginTop: 1,
                      }}>{cfg.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{ins.title}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.55 }}>{ins.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysis.suggestions.map((sug, i) => {
                  const cfg = PRIORITY_CONFIG[sug.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <div key={i} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600 }}>{sug.title}</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 100, flexShrink: 0 }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.55 }}>{sug.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {analysis.categoryBreakdown && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Category Assessment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {Object.entries(analysis.categoryBreakdown).map(([cat, data]) => {
                  const assessColors = { good: 'var(--green)', low: 'var(--yellow)', high: 'var(--red)', ok: 'var(--blue)' };
                  const color = assessColors[data.assessment] || 'var(--text2)';
                  return (
                    <div key={cat} style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'capitalize', marginBottom: 6 }}>{cat}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {Math.floor((data.minutes || 0) / 60)}h{(data.minutes || 0) % 60 > 0 ? ` ${(data.minutes || 0) % 60}m` : ''}
                      </div>
                      <div style={{ marginTop: 4, fontSize: '0.72rem', color, fontWeight: 600, textTransform: 'capitalize' }}>
                        {data.assessment}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
