import { useState, useCallback } from 'react';
import { Home, TrendingUp, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { valuationAPI } from '../api/client';
import { useApi, useTagInput } from '../hooks/useApi';
import { LoadingOverlay, ErrorAlert, InfoList, SectionTitle, EmptyState, ScoreRing } from '../components/UI';

const formatINR = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const TREND_COLORS = { RISING: '#10b981', STABLE: '#f59e0b', DECLINING: '#ef4444' };
const RECOMMEND_COLORS = { BUY: '#10b981', HOLD: '#f59e0b', SELL: '#ef4444', RENT_OUT: '#3b82f6' };

const AMENITY_OPTIONS = ['Lift', 'Parking', 'Security', 'Power Backup', 'Gym', 'Swimming Pool', 'Garden', 'Terrace', 'Clubhouse', 'Solar Panels'];
const NEARBY_OPTIONS = ['Metro/Railway Station', 'School', 'Hospital', 'Shopping Mall', 'IT Park', 'Highway Access', 'Airport'];

export default function RealEstateValuation() {
  const [form, setForm] = useState({
    property_type: 'residential', location: '', city: '', state: '',
    area_sqft: '', bedrooms: '', bathrooms: '', age_years: 0,
    floors: '', condition: 'good', additional_notes: '',
  });
  const [amenities, setAmenities] = useState([]);
  const [nearby, setNearby] = useState([]);
  const { data, loading, error, execute } = useApi(valuationAPI.estimate);

  const toggleItem = (list, setList, item) =>
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const handleSubmit = useCallback(async () => {
    if (!form.location || !form.city || !form.area_sqft) return toast.error('Fill in Location, City, and Area.');
    const res = await execute({ ...form, area_sqft: parseFloat(form.area_sqft), age_years: parseInt(form.age_years) || 0, bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null, bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null, floors: form.floors ? parseInt(form.floors) : null, amenities, nearby_facilities: nearby });
    if (res?.success) toast.success('Valuation complete!');
  }, [form, amenities, nearby, execute]);

  const result = data?.data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">🏠 Market AI</div>
          <h1 className="page-title">Real Estate <span>Valuation</span></h1>
          <p className="page-subtitle">Get AI-powered property valuation with market analysis, rental yield, and investment outlook</p>
        </div>
      </div>

      <div className="page-content">
        <div className="two-col" style={{ alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Home size={16} /> Property Details</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-select" value={form.property_type} onChange={e => setForm(p => ({ ...p, property_type: e.target.value }))}>
                  {['residential', 'commercial', 'industrial', 'land'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Location / Area</label>
                  <input className="form-input" placeholder="e.g., Bandra West" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" placeholder="e.g., Mumbai" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" placeholder="e.g., Maharashtra" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area (sq ft) *</label>
                  <input className="form-input" type="number" placeholder="e.g., 1200" value={form.area_sqft} onChange={e => setForm(p => ({ ...p, area_sqft: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <input className="form-input" type="number" placeholder="e.g., 3" value={form.bedrooms} onChange={e => setForm(p => ({ ...p, bedrooms: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input className="form-input" type="number" placeholder="e.g., 2" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Age (Years)</label>
                  <input className="form-input" type="number" placeholder="e.g., 5" value={form.age_years} onChange={e => setForm(p => ({ ...p, age_years: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                    {['excellent', 'good', 'fair', 'poor'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {AMENITY_OPTIONS.map(a => (
                    <button key={a} onClick={() => toggleItem(amenities, setAmenities, a)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer', border: '1px solid', background: amenities.includes(a) ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)', color: amenities.includes(a) ? 'var(--primary)' : 'var(--text-muted)', borderColor: amenities.includes(a) ? 'rgba(245,158,11,0.4)' : 'var(--border)', transition: 'all 0.15s', fontFamily: 'Inter,sans-serif' }}>{a}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nearby Facilities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {NEARBY_OPTIONS.map(n => (
                    <button key={n} onClick={() => toggleItem(nearby, setNearby, n)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer', border: '1px solid', background: nearby.includes(n) ? 'rgba(6,182,212,0.1)' : 'var(--bg-elevated)', color: nearby.includes(n) ? 'var(--accent)' : 'var(--text-muted)', borderColor: nearby.includes(n) ? 'rgba(6,182,212,0.3)' : 'var(--border)', transition: 'all 0.15s', fontFamily: 'Inter,sans-serif' }}>{n}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-textarea" rows={3} placeholder="Corner unit, sea view, society name, recent renovation..." value={form.additional_notes} onChange={e => setForm(p => ({ ...p, additional_notes: e.target.value }))} />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="loading-spinner" /> Estimating...</> : <><IndianRupee size={16} /> Get Valuation</>}
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            {loading && <div className="card"><LoadingOverlay text="Analyzing market data with Gemini AI..." /></div>}
            {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
            {!loading && !error && !result && <div className="card"><EmptyState icon="🏘️" title="Enter Property Details" description="Fill in the property details and click Get Valuation." /></div>}

            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Price Card */}
                <div className="card" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(16,185,129,0.05))' }}>
                  <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Estimated Market Value</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{formatINR(result.estimated_value?.most_likely)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
                      Range: {formatINR(result.estimated_value?.minimum)} — {formatINR(result.estimated_value?.maximum)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4 }}>
                      ₹{result.estimated_value?.per_sqft_rate?.toLocaleString('en-IN')} / sq ft
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Monthly Rent</div>
                      <div style={{ fontWeight: 700, color: '#3b82f6' }}>
                        {formatINR(result.rental_potential?.monthly_rent_range?.min)} – {formatINR(result.rental_potential?.monthly_rent_range?.max)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Annual Yield</div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>{result.rental_potential?.annual_yield_percentage?.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>

                {/* Market Analysis */}
                {result.market_analysis && (
                  <div className="card">
                    <SectionTitle>📊 Market Analysis</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                      {[
                        { label: 'Trend', val: result.market_analysis.current_market_trend, color: TREND_COLORS[result.market_analysis.current_market_trend] },
                        { label: 'Demand', val: result.market_analysis.demand_level, color: result.market_analysis.demand_level === 'HIGH' ? '#10b981' : '#f59e0b' },
                        { label: 'Rating', val: result.market_analysis.investment_rating, color: '#f59e0b' },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: m.color }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.market_analysis.market_commentary}</p>
                  </div>
                )}

                {/* Investment Outlook */}
                {result.investment_outlook && (
                  <div className="card">
                    <SectionTitle>📈 Investment Outlook</SectionTitle>
                    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', padding: '6px 16px', borderRadius: 8, background: `${RECOMMEND_COLORS[result.investment_outlook.recommendation]}22`, color: RECOMMEND_COLORS[result.investment_outlook.recommendation], border: `1px solid ${RECOMMEND_COLORS[result.investment_outlook.recommendation]}44` }}>
                        {result.investment_outlook.recommendation}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Est. Appreciation: <strong style={{ color: '#10b981' }}>{result.investment_outlook.appreciation_rate_estimate}</strong>/year</span>
                    </div>
                    {[['1 Year', result.investment_outlook.short_term_1yr], ['3 Years', result.investment_outlook.medium_term_3yr], ['5 Years', result.investment_outlook.long_term_5yr]].map(([p, v]) => (
                      <div key={p} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 60 }}>{p}:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Valuation Factors */}
                {result.valuation_factors?.length > 0 && (
                  <div className="card">
                    <SectionTitle>⚖️ Valuation Factors</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.valuation_factors.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '1rem' }}>{f.impact === 'POSITIVE' ? '✅' : f.impact === 'NEGATIVE' ? '❌' : '➖'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.factor}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.description}</div>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>{f.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.risks?.length > 0 && (
                  <div className="card">
                    <SectionTitle>⚠️ Risks & Opportunities</SectionTitle>
                    <div className="two-col" style={{ gap: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Risks</div>
                        <InfoList items={result.risks} icon="⚠" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Opportunities</div>
                        <InfoList items={result.opportunities} icon="✦" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="alert alert-info" style={{ fontSize: '0.78rem' }}>ℹ️ {result.disclaimer}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
