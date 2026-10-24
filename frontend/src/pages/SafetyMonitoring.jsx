import { useState, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { safetyAPI } from '../api/client';
import { useApi, useFileUpload } from '../hooks/useApi';
import ImageUpload from '../components/ImageUpload';
import { LoadingOverlay, ErrorAlert, RiskBadge, ScoreRing, InfoList, SectionTitle, EmptyState } from '../components/UI';

export default function SafetyMonitoring() {
  const [mode, setMode] = useState('image'); // 'image' | 'text'
  const [textForm, setTextForm] = useState({ site_description: '', location: '', work_type: '' });
  const { file, preview, handleFile, clearFile } = useFileUpload();
  const { data, loading, error, execute, reset } = useApi(
    mode === 'image' ? safetyAPI.analyzeImage : safetyAPI.analyzeText
  );

  const handleImageAnalyze = useCallback(async () => {
    if (!file) return toast.error('Please upload a site image first.');
    const fd = new FormData();
    fd.append('file', file);
    const res = await execute(fd);
    if (res?.success) toast.success('Safety analysis complete!');
  }, [file, execute]);

  const handleTextAnalyze = useCallback(async () => {
    if (!textForm.site_description.trim()) return toast.error('Please describe the site.');
    const res = await execute(textForm);
    if (res?.success) toast.success('Safety analysis complete!');
  }, [textForm, execute]);

  const result = data?.data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">🦺 AI Safety Inspector</div>
          <h1 className="page-title">Construction <span>Safety Monitoring</span></h1>
          <p className="page-subtitle">Upload a site image or describe your site for instant AI-powered hazard detection</p>
        </div>
      </div>

      <div className="page-content">
        {/* Mode Tabs */}
        <div className="tabs" style={{ maxWidth: 400, marginBottom: 24 }}>
          <button className={`tab ${mode === 'image' ? 'active' : ''}`} onClick={() => { setMode('image'); reset(); }}>📸 Image Analysis</button>
          <button className={`tab ${mode === 'text' ? 'active' : ''}`} onClick={() => { setMode('text'); reset(); }}>📝 Text Description</button>
        </div>

        <div className="two-col" style={{ alignItems: 'start' }}>
          {/* Input Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Upload size={16} /> {mode === 'image' ? 'Upload Site Image' : 'Describe Your Site'}</span>
            </div>

            {mode === 'image' ? (
              <>
                <ImageUpload file={file} preview={preview} onFile={handleFile} onClear={clearFile}
                  label="Drop construction site photo here" hint="Supports JPG, PNG, WEBP · Max 10MB" />
                <button className="btn btn-primary btn-full" style={{ marginTop: 16 }}
                  onClick={handleImageAnalyze} disabled={loading || !file}>
                  {loading ? <><span className="loading-spinner" /> Analyzing...</> : <><Shield size={16} /> Analyze Safety</>}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Site Description *</label>
                    <textarea className="form-textarea" rows={5} placeholder="Describe the construction site in detail: workers, equipment, scaffolding, PPE usage, work in progress..."
                      value={textForm.site_description} onChange={e => setTextForm(p => ({ ...p, site_description: e.target.value }))} />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" placeholder="e.g., Mumbai" value={textForm.location}
                        onChange={e => setTextForm(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Type</label>
                      <input className="form-input" placeholder="e.g., Foundation work" value={textForm.work_type}
                        onChange={e => setTextForm(p => ({ ...p, work_type: e.target.value }))} />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleTextAnalyze} disabled={loading}>
                    {loading ? <><span className="loading-spinner" /> Analyzing...</> : <><Shield size={16} /> Analyze Safety</>}
                  </button>
                </div>
              </>
            )}

            {/* Quick Tips */}
            <div style={{ marginTop: 20, padding: '14px', background: 'rgba(245,158,11,0.04)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.1)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Tips for best results</div>
              {['Ensure the image clearly shows workers and work area', 'Include multiple angles if possible', 'Describe PPE usage and scaffolding condition'].map((t, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>▸ {t}</div>
              ))}
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {loading && <div className="card"><LoadingOverlay text="Analyzing site safety with Gemini AI..." /></div>}
            {error && <ErrorAlert message={error} onRetry={mode === 'image' ? handleImageAnalyze : handleTextAnalyze} />}
            {!loading && !error && !result && <div className="card"><EmptyState icon="🦺" title="No Analysis Yet" description="Upload a site image or enter a description to get an AI safety report." /></div>}

            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Overview */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Risk Level</div>
                      <RiskBadge level={result.overall_risk_level} />
                    </div>
                    <ScoreRing score={result.risk_score ?? 0} label="Risk Score" />
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>

                  {result.ppe_compliance && (
                    <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>PPE Compliance</div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={result.ppe_compliance.status === 'COMPLIANT' ? 'LOW' : result.ppe_compliance.status === 'PARTIAL' ? 'MEDIUM' : 'HIGH'} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{result.ppe_compliance.status}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hazards */}
                {result.hazards?.length > 0 && (
                  <div className="card">
                    <SectionTitle>⚠️ Identified Hazards</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {result.hazards.map((h, i) => (
                        <div key={i} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)', borderLeft: `3px solid ${h.severity === 'CRITICAL' ? '#ef4444' : h.severity === 'HIGH' ? '#f97316' : h.severity === 'MEDIUM' ? '#f59e0b' : '#10b981'}` }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{h.category}</span>
                            <RiskBadge level={h.severity} />
                          </div>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{h.description}</p>
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>📍 {h.location}</div>
                          <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(16,185,129,0.05)', borderRadius: 6, fontSize: '0.8rem', color: '#34d399' }}>
                            ✅ <strong>Action:</strong> {h.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Actions */}
                {result.immediate_actions?.length > 0 && (
                  <div className="card">
                    <SectionTitle>🚨 Immediate Actions Required</SectionTitle>
                    <InfoList items={result.immediate_actions} icon="→" />
                  </div>
                )}

                {/* Positive Observations */}
                {result.positive_observations?.length > 0 && (
                  <div className="card">
                    <SectionTitle>✅ Good Practices Observed</SectionTitle>
                    <InfoList items={result.positive_observations} icon="✓" />
                  </div>
                )}

                {/* Regulatory References */}
                {result.regulatory_references?.length > 0 && (
                  <div className="card">
                    <SectionTitle>📜 Regulatory References</SectionTitle>
                    <InfoList items={result.regulatory_references} icon="§" />
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
