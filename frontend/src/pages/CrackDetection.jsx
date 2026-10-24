import { useCallback } from 'react';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { crackAPI } from '../api/client';
import { useApi, useFileUpload } from '../hooks/useApi';
import ImageUpload from '../components/ImageUpload';
import { LoadingOverlay, ErrorAlert, RiskBadge, ScoreRing, InfoList, SectionTitle, EmptyState } from '../components/UI';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444', SEVERE: '#f97316', MODERATE: '#f59e0b', MINOR: '#10b981'
};
const URGENCY_COLORS = {
  EVACUATE: '#ef4444', REPAIR_IMMEDIATELY: '#f97316', REPAIR_SOON: '#f59e0b', MONITOR: '#10b981'
};

export default function CrackDetection() {
  const { file, preview, handleFile, clearFile } = useFileUpload();
  const { data, loading, error, execute, reset } = useApi(crackAPI.analyze);

  const handleAnalyze = useCallback(async () => {
    if (!file) return toast.error('Please upload an image first.');
    const fd = new FormData();
    fd.append('file', file);
    const res = await execute(fd);
    if (res?.success) toast.success('Crack analysis complete!');
  }, [file, execute]);

  const result = data?.data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">🔍 Structural AI</div>
          <h1 className="page-title">Crack <span>Detection & Analysis</span></h1>
          <p className="page-subtitle">Upload a photo of a wall, floor, or structural element for AI-powered crack detection and repair guidance</p>
        </div>
      </div>

      <div className="page-content">
        <div className="two-col" style={{ alignItems: 'start' }}>
          {/* Upload Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Search size={16} /> Upload Structural Image</span>
            </div>
            <ImageUpload file={file} preview={preview} onFile={handleFile} onClear={() => { clearFile(); reset(); }}
              label="Drop image of wall, floor, or structure" hint="JPG, PNG, WEBP · Best results with clear, well-lit photos" />
            <button className="btn btn-primary btn-full" style={{ marginTop: 16 }}
              onClick={handleAnalyze} disabled={loading || !file}>
              {loading ? <><span className="loading-spinner" /> Analyzing...</> : <><Search size={16} /> Detect Cracks</>}
            </button>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Hairline Crack', color: '#10b981', desc: '< 0.1mm — cosmetic only' },
                { label: 'Structural Crack', color: '#ef4444', desc: '> 1mm — needs engineer review' },
                { label: 'Settlement Crack', color: '#f97316', desc: 'Diagonal pattern — foundation issue' },
                { label: 'Shrinkage Crack', color: '#f59e0b', desc: 'Concrete curing — typically harmless' },
              ].map((t) => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t.label}</span> — {t.desc}
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            {loading && <div className="card"><LoadingOverlay text="Analyzing structural integrity with Gemini Vision..." /></div>}
            {error && <ErrorAlert message={error} onRetry={handleAnalyze} />}
            {!loading && !error && !result && <div className="card"><EmptyState icon="🔬" title="No Analysis Yet" description="Upload a structural image to detect and analyze cracks." /></div>}

            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Overview */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Crack Detected</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {result.crack_detected ? (
                          <><AlertTriangle size={20} style={{ color: '#ef4444' }} /><span style={{ color: '#ef4444', fontWeight: 700 }}>YES</span></>
                        ) : (
                          <><CheckCircle size={20} style={{ color: '#10b981' }} /><span style={{ color: '#10b981', fontWeight: 700 }}>NO CRACKS</span></>
                        )}
                      </div>
                    </div>
                    <ScoreRing score={result.integrity_score ?? 100} label="Integrity Score" />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>Structural Integrity:</span>
                    <RiskBadge level={result.structural_integrity === 'GOOD' || result.structural_integrity === 'EXCELLENT' ? 'LOW' : result.structural_integrity === 'FAIR' ? 'MEDIUM' : 'HIGH'} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 6 }}>{result.structural_integrity}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
                  {result.professional_inspection_required && (
                    <div className="alert alert-danger" style={{ marginTop: 12 }}>
                      ⚠️ <strong>Professional Inspection Required</strong> — Please engage a structural engineer.
                    </div>
                  )}
                </div>

                {/* Crack Details */}
                {result.cracks?.length > 0 && (
                  <div className="card">
                    <SectionTitle>🔎 Crack Details</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {result.cracks.map((c) => (
                        <div key={c.id} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: `1px solid var(--border)`, borderLeft: `3px solid ${SEVERITY_COLORS[c.severity] || '#f59e0b'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>#{c.id} — {c.type}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <RiskBadge level={c.severity} />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                            {[
                              ['Location', c.location], ['Width', c.estimated_width],
                              ['Length', c.estimated_length], ['Pattern', c.pattern],
                            ].map(([k, v]) => (
                              <div key={k} style={{ fontSize: '0.78rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{v || 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Likely Cause:</strong> {c.likely_cause}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, background: `${URGENCY_COLORS[c.urgency]}22`, color: URGENCY_COLORS[c.urgency] || '#f59e0b' }}>
                            🚨 {c.urgency?.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repair Recommendations */}
                {result.repair_recommendations?.length > 0 && (
                  <div className="card">
                    <SectionTitle>🛠️ Repair Recommendations</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {result.repair_recommendations.map((r, i) => (
                        <div key={i} style={{ padding: 14, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                            Crack #{r.crack_id} — {r.method}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.8rem' }}>
                            <div><span style={{ color: 'var(--text-muted)' }}>Cost (INR): </span><span style={{ color: '#10b981', fontWeight: 600 }}>{r.estimated_cost_range}</span></div>
                            <div><span style={{ color: 'var(--text-muted)' }}>Timeline: </span><span style={{ color: 'var(--text-secondary)' }}>{r.timeline}</span></div>
                          </div>
                          {r.materials_needed?.length > 0 && (
                            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Materials: {r.materials_needed.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.monitoring_advice && (
                  <div className="card">
                    <SectionTitle>👁️ Monitoring Advice</SectionTitle>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.monitoring_advice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
