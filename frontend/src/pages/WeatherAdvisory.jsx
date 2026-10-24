import { useState, useCallback } from 'react';
import { Cloud, Wind, Droplets, Eye, Thermometer, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { weatherAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingOverlay, ErrorAlert, EmptyState, InfoList, SectionTitle } from '../components/UI';

const SUITABILITY_COLORS = {
  EXCELLENT: '#10b981', GOOD: '#3b82f6', CAUTION: '#f59e0b', AVOID: '#ef4444'
};

const WEATHER_ICONS = {
  'sunny': '☀️', 'clear': '☀️', 'cloud': '⛅', 'rain': '🌧️', 'thunder': '⛈️',
  'fog': '🌫️', 'wind': '💨', 'drizzle': '🌦️', 'haze': '🌁', 'storm': '🌪️',
};

const getWeatherIcon = (desc) => {
  if (!desc) return '🌤️';
  const lower = desc.toLowerCase();
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🌤️';
};

const PHASES = ['general', 'site_preparation', 'foundation', 'substructure', 'superstructure', 'finishing', 'waterproofing', 'electrical', 'plumbing'];

const ACTIVITY_OPTIONS = [
  'Concrete Pouring', 'Masonry Work', 'Excavation', 'Steel Erection', 'Roofing',
  'Plastering', 'Painting', 'Waterproofing', 'Electrical Work', 'Plumbing',
  'Scaffolding', 'Heavy Equipment Operation',
];

export default function WeatherAdvisory() {
  const [city, setCity] = useState('');
  const [phase, setPhase] = useState('general');
  const [activities, setActivities] = useState([]);
  const { data, loading, error, execute } = useApi(weatherAPI.getAdvisory);

  const toggle = (item) => setActivities(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const handleSubmit = useCallback(async () => {
    if (!city.trim()) return toast.error('Enter a city name.');
    const res = await execute({ city, country_code: 'IN', construction_phase: phase, activities_planned: activities });
    if (res?.success) toast.success('Weather advisory ready!');
  }, [city, phase, activities, execute]);

  const weather = data?.weather_data;
  const advisory = data?.advisory;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">⛅ Live Weather AI</div>
          <h1 className="page-title">Weather <span>Construction Advisory</span></h1>
          <p className="page-subtitle">Get real-time weather data with AI-powered construction activity advisories and safety guidance</p>
        </div>
      </div>

      <div className="page-content">
        {/* Input Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input className="form-input" placeholder="e.g., Mumbai, Bangalore, Chennai" value={city}
                onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-group">
              <label className="form-label">Construction Phase</label>
              <select className="form-select" value={phase} onChange={e => setPhase(e.target.value)}>
                {PHASES.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Planned Activities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 80, overflowY: 'auto' }}>
                {ACTIVITY_OPTIONS.slice(0, 6).map(a => (
                  <button key={a} onClick={() => toggle(a)} style={{ padding: '3px 8px', borderRadius: 20, fontSize: '0.72rem', cursor: 'pointer', border: '1px solid', background: activities.includes(a) ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)', color: activities.includes(a) ? 'var(--accent)' : 'var(--text-muted)', borderColor: activities.includes(a) ? 'rgba(6,182,212,0.35)' : 'var(--border)', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>{a}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ height: 44 }}>
              {loading ? <span className="loading-spinner" /> : <Cloud size={16} />} Get Advisory
            </button>
          </div>
        </div>

        {loading && <div className="card"><LoadingOverlay text="Fetching weather data and generating AI advisory..." /></div>}
        {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
        {!loading && !error && !data && <div className="card"><EmptyState icon="⛅" title="Enter a City" description="Enter your construction site city to get weather data and AI construction advisories." /></div>}

        {data && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Mock Data Notice */}
            {weather?.mock && (
              <div className="alert alert-warning">
                ⚠️ Using <strong>demo weather data</strong>. Add your OpenWeatherMap API key in <code>backend/.env</code> for real-time data.
              </div>
            )}

            {/* Current Weather + Suitability */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Current Weather */}
              <div className="card" style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.08),rgba(59,130,246,0.05))' }}>
                <div style={{ display: 'flex', align: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: '3rem' }}>{getWeatherIcon(weather?.current?.description)}</div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{weather?.current?.temp_celsius}°C</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>{weather?.current?.description}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Feels like {weather?.current?.feels_like}°C</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>📍 {weather?.city}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { icon: <Droplets size={14} />, label: 'Humidity', val: `${weather?.current?.humidity}%` },
                    { icon: <Wind size={14} />, label: 'Wind', val: `${weather?.current?.wind_speed_kmh} km/h` },
                    { icon: <Eye size={14} />, label: 'Visibility', val: `${weather?.current?.visibility_km} km` },
                    { icon: <Thermometer size={14} />, label: 'Rain (1h)', val: weather?.current?.rain_1h_mm ? `${weather.current.rain_1h_mm} mm` : 'None' },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--accent)' }}>{m.icon}</span>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{m.label}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Suitability */}
              {advisory && (
                <div className="card">
                  <SectionTitle>🏗️ Construction Suitability</SectionTitle>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: SUITABILITY_COLORS[advisory.overall_suitability], lineHeight: 1, marginBottom: 6 }}>{advisory.overall_suitability}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{advisory.suitability_score}/100</div>
                    <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, margin: '10px 0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${advisory.suitability_score}%`, background: SUITABILITY_COLORS[advisory.overall_suitability], borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{advisory.today_summary}</p>
                  </div>
                  {advisory.worker_safety_advisory && (
                    <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.8rem' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 6 }}>⏰ Recommended Work Hours</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{advisory.worker_safety_advisory.recommended_work_hours}</div>
                      {advisory.worker_safety_advisory.heat_stress_risk !== 'LOW' && (
                        <div style={{ color: '#f87171', marginTop: 6 }}>⚠️ Heat stress risk: {advisory.worker_safety_advisory.heat_stress_risk}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5-Day Forecast */}
            {weather?.forecast_days?.length > 0 && (
              <div className="card">
                <SectionTitle>📅 5-Day Forecast</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  {weather.forecast_days.slice(0, 5).map((day, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>{day.day?.split?.('-')?.slice(1).join('/')  || day.day}</div>
                      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{getWeatherIcon(day.condition)}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{day.high || day.temp}°</div>
                      {day.low && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{day.low}°</div>}
                      <div style={{ fontSize: '0.68rem', color: day.rain_chance > 60 ? '#60a5fa' : 'var(--text-muted)', marginTop: 4 }}>💧 {day.rain_chance}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Advisories */}
            {advisory?.activity_advisories?.length > 0 && (
              <div className="card">
                <SectionTitle>🔨 Activity-Specific Advisories</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {advisory.activity_advisories.map((a, i) => {
                    const c = { PROCEED: '#10b981', PROCEED_WITH_CAUTION: '#f59e0b', POSTPONE: '#f97316', CANCEL: '#ef4444' }[a.suitability] || '#f59e0b';
                    return (
                      <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', border: `1px solid ${c}33`, borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.activity}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c, background: `${c}18`, padding: '2px 8px', borderRadius: 10 }}>{a.suitability?.replace(/_/g, ' ')}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{a.reason}</div>
                        {a.best_time && <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: 4 }}>⏰ {a.best_time}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Concrete + Material Advisories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {advisory?.concrete_pouring_advice && (
                <div className="card">
                  <SectionTitle>🪣 Concrete Pouring</SectionTitle>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{advisory.concrete_pouring_advice}</p>
                </div>
              )}
              {advisory?.material_storage_advice && (
                <div className="card">
                  <SectionTitle>📦 Material Storage</SectionTitle>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{advisory.material_storage_advice}</p>
                </div>
              )}
            </div>

            {/* Alerts */}
            {advisory?.alerts?.filter(Boolean).length > 0 && (
              <div className="alert alert-danger">
                <AlertTriangle size={18} />
                <div>
                  <strong>Weather Alerts</strong>
                  {advisory.alerts.map((a, i) => <div key={i} style={{ marginTop: 4, fontSize: '0.85rem' }}>{a}</div>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
