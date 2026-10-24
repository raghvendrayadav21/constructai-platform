import { useState, useCallback } from 'react';
import { BarChart3, Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { planningAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingOverlay, ErrorAlert, InfoList, SectionTitle, EmptyState, RiskBadge } from '../components/UI';

const formatINR = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n?.toLocaleString('en-IN')}`;
};

const PHASE_COLORS = ['#f59e0b','#06b6d4','#10b981','#8b5cf6','#ef4444','#3b82f6','#f97316'];

export default function ProjectPlanning() {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'estimate'
  const [planForm, setPlanForm] = useState({
    project_name: '', project_type: 'residential', description: '', location: '',
    total_area_sqft: '', budget_inr: '', target_duration_months: '', floors: '',
    special_requirements: '', client_type: 'Private',
  });
  const [costForm, setCostForm] = useState({ project_type: 'residential', area_sqft: '', location: '', quality_grade: 'standard' });

  const planApi = useApi(planningAPI.generatePlan);
  const costApi = useApi(planningAPI.costEstimate);

  const handlePlan = useCallback(async () => {
    if (!planForm.project_name || !planForm.description || !planForm.location) return toast.error('Fill in Name, Description, and Location.');
    const res = await planApi.execute({ ...planForm, total_area_sqft: planForm.total_area_sqft ? parseFloat(planForm.total_area_sqft) : null, budget_inr: planForm.budget_inr ? parseFloat(planForm.budget_inr) : null, target_duration_months: planForm.target_duration_months ? parseInt(planForm.target_duration_months) : null, floors: planForm.floors ? parseInt(planForm.floors) : null });
    if (res?.success) toast.success('Project plan generated!');
  }, [planForm, planApi]);

  const handleCost = useCallback(async () => {
    if (!costForm.area_sqft || !costForm.location) return toast.error('Fill in area and location.');
    const res = await costApi.execute({ ...costForm, area_sqft: parseFloat(costForm.area_sqft) });
    if (res?.success) toast.success('Cost estimate ready!');
  }, [costForm, costApi]);

  const planResult = planApi.data?.data;
  const costResult = costApi.data?.data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">📋 Planning AI</div>
          <h1 className="page-title">Construction <span>Project Planning</span></h1>
          <p className="page-subtitle">Generate complete project plans with phases, resources, risk registers, and cost breakdowns</p>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs" style={{ maxWidth: 500, marginBottom: 24 }}>
          <button className={`tab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>📋 Full Project Plan</button>
          <button className={`tab ${activeTab === 'estimate' ? 'active' : ''}`} onClick={() => setActiveTab('estimate')}>💰 Quick Cost Estimate</button>
        </div>

        {activeTab === 'plan' && (
          <div className="two-col" style={{ alignItems: 'start' }}>
            {/* Plan Form */}
            <div className="card">
              <div className="card-header"><span className="card-title"><BarChart3 size={16} /> Project Details</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input className="form-input" placeholder="e.g., Greenview Residential Complex" value={planForm.project_name} onChange={e => setPlanForm(p => ({ ...p, project_name: e.target.value }))} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project Type</label>
                    <select className="form-select" value={planForm.project_type} onChange={e => setPlanForm(p => ({ ...p, project_type: e.target.value }))}>
                      {['residential', 'commercial', 'industrial', 'infrastructure', 'renovation'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input className="form-input" placeholder="e.g., Pune, Maharashtra" value={planForm.location} onChange={e => setPlanForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Project Description *</label>
                  <textarea className="form-textarea" rows={4} placeholder="Describe the project: scope, objectives, special features..." value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Total Area (sq ft)</label>
                    <input className="form-input" type="number" placeholder="e.g., 50000" value={planForm.total_area_sqft} onChange={e => setPlanForm(p => ({ ...p, total_area_sqft: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (₹)</label>
                    <input className="form-input" type="number" placeholder="e.g., 5000000" value={planForm.budget_inr} onChange={e => setPlanForm(p => ({ ...p, budget_inr: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Target Duration (months)</label>
                    <input className="form-input" type="number" placeholder="e.g., 18" value={planForm.target_duration_months} onChange={e => setPlanForm(p => ({ ...p, target_duration_months: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Floors</label>
                    <input className="form-input" type="number" placeholder="e.g., 5" value={planForm.floors} onChange={e => setPlanForm(p => ({ ...p, floors: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Special Requirements</label>
                  <textarea className="form-textarea" rows={2} placeholder="Green building, rainwater harvesting, special materials..." value={planForm.special_requirements} onChange={e => setPlanForm(p => ({ ...p, special_requirements: e.target.value }))} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handlePlan} disabled={planApi.loading}>
                  {planApi.loading ? <><span className="loading-spinner" /> Generating Plan...</> : <><BarChart3 size={16} /> Generate Project Plan</>}
                </button>
              </div>
            </div>

            {/* Plan Results */}
            <div>
              {planApi.loading && <div className="card"><LoadingOverlay text="Generating comprehensive project plan..." /></div>}
              {planApi.error && <ErrorAlert message={planApi.error} onRetry={handlePlan} />}
              {!planApi.loading && !planApi.error && !planResult && <div className="card"><EmptyState icon="📋" title="No Plan Yet" description="Fill in project details to generate a complete plan." /></div>}

              {planResult && !planApi.loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Overview */}
                  <div className="card">
                    <SectionTitle>🏗️ Project Overview</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { icon: '📅', label: 'Duration', val: `${planResult.project_overview?.estimated_duration_months} months` },
                        { icon: '💰', label: 'Est. Cost', val: formatINR(planResult.project_overview?.estimated_total_cost_inr) },
                        { icon: '⚡', label: 'Complexity', val: planResult.project_overview?.complexity_level },
                        { icon: '👥', label: 'Team Size', val: `${planResult.project_overview?.recommended_team_size} people` },
                      ].map((m) => (
                        <div key={m.label} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{m.icon}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phases Timeline */}
                  {planResult.phases?.length > 0 && (
                    <div className="card">
                      <SectionTitle>📅 Project Phases</SectionTitle>
                      <div className="timeline">
                        {planResult.phases.map((phase, i) => (
                          <div key={i} className="timeline-item">
                            <div className="timeline-dot" style={{ background: PHASE_COLORS[i % PHASE_COLORS.length] + 'dd', color: '#000' }}>{phase.phase_number}</div>
                            <div className="timeline-content">
                              <div className="timeline-title">
                                {phase.phase_name}
                                {phase.critical_path && <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>Critical</span>}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Week {phase.start_week}–{phase.end_week} · {phase.duration_weeks} weeks · {phase.budget_allocation_percentage}% budget</div>
                              <div className="timeline-desc">{phase.description}</div>
                              {phase.key_activities?.length > 0 && (
                                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {phase.key_activities.slice(0, 4).map((a, j) => (
                                    <span key={j} style={{ fontSize: '0.7rem', padding: '2px 8px', background: `${PHASE_COLORS[i % PHASE_COLORS.length]}18`, color: PHASE_COLORS[i % PHASE_COLORS.length], border: `1px solid ${PHASE_COLORS[i % PHASE_COLORS.length]}30`, borderRadius: 10 }}>{a}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Register */}
                  {planResult.risk_register?.length > 0 && (
                    <div className="card">
                      <SectionTitle>⚠️ Risk Register</SectionTitle>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {planResult.risk_register.map((r, i) => (
                          <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{r.risk}</span>
                              <RiskBadge level={r.probability} />
                              <RiskBadge level={r.impact} />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><strong>Mitigation:</strong> {r.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance */}
                  {planResult.compliance_checklist?.length > 0 && (
                    <div className="card">
                      <SectionTitle>✅ Compliance Checklist</SectionTitle>
                      <InfoList items={planResult.compliance_checklist} icon="☐" />
                    </div>
                  )}

                  {/* Sustainability */}
                  {planResult.sustainability_recommendations?.length > 0 && (
                    <div className="card">
                      <SectionTitle>🌿 Sustainability Recommendations</SectionTitle>
                      <InfoList items={planResult.sustainability_recommendations} icon="🌱" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'estimate' && (
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="card-header"><span className="card-title"><DollarSign size={16} /> Quick Cost Estimate</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project Type</label>
                    <select className="form-select" value={costForm.project_type} onChange={e => setCostForm(p => ({ ...p, project_type: e.target.value }))}>
                      {['residential', 'commercial', 'industrial', 'warehouse', 'school'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Area (sq ft) *</label>
                    <input className="form-input" type="number" placeholder="e.g., 2000" value={costForm.area_sqft} onChange={e => setCostForm(p => ({ ...p, area_sqft: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g., Bangalore, Karnataka" value={costForm.location} onChange={e => setCostForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quality Grade</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {['basic', 'standard', 'premium', 'luxury'].map(g => (
                      <button key={g} onClick={() => setCostForm(p => ({ ...p, quality_grade: g }))} style={{ padding: '10px 6px', borderRadius: 8, cursor: 'pointer', border: '1px solid', textTransform: 'capitalize', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter,sans-serif', background: costForm.quality_grade === g ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)', color: costForm.quality_grade === g ? 'var(--primary)' : 'var(--text-muted)', borderColor: costForm.quality_grade === g ? 'rgba(245,158,11,0.4)' : 'var(--border)' }}>{g}</button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary btn-full" onClick={handleCost} disabled={costApi.loading}>
                  {costApi.loading ? <><span className="loading-spinner" /> Calculating...</> : <><DollarSign size={16} /> Get Cost Estimate</>}
                </button>
              </div>
            </div>

            <div>
              {costApi.loading && <div className="card"><LoadingOverlay text="Calculating construction cost estimate..." /></div>}
              {costApi.error && <ErrorAlert message={costApi.error} />}
              {!costApi.loading && !costApi.error && !costResult && <div className="card"><EmptyState icon="💰" title="Fill in Details" description="Enter project details for a quick cost estimate." /></div>}
              {costResult && !costApi.loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(16,185,129,0.05))' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Total Estimated Cost</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981' }}>{formatINR(costResult.total_estimated_cost_inr)}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: 4 }}>{formatINR(costResult.cost_per_sqft_inr)} / sq ft</div>
                  </div>
                  {costResult.breakdown?.length > 0 && (
                    <div className="card">
                      <SectionTitle>💡 Cost Breakdown</SectionTitle>
                      {costResult.breakdown.map((b, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.category}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatINR(b.cost_inr)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({b.percentage}%)</span></span>
                          </div>
                          <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${b.percentage}%`, background: `hsl(${(i * 47 + 30) % 360}, 70%, 55%)`, borderRadius: 3, transition: 'width 0.8s ease' }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{b.notes}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {costResult.cost_optimization_tips?.length > 0 && (
                    <div className="card">
                      <SectionTitle>💡 Optimization Tips</SectionTitle>
                      <InfoList items={costResult.cost_optimization_tips} icon="→" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
