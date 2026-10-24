import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Send, FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { assistanceAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingOverlay, ErrorAlert, InfoList, SectionTitle, EmptyState, RiskBadge } from '../components/UI';

const QUICK_QUESTIONS = [
  'What is the minimum cover for reinforcement in footings?',
  'How do I check concrete quality on site?',
  'What PPE is mandatory for height work?',
  'How to calculate shuttering quantity for a slab?',
  'What is the water-cement ratio for M25 concrete?',
  'How do I read a structural drawing?',
];

export default function SiteAssistance() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👷 Hello! I\'m **ConstructAI**, your expert construction assistant. I can help with IS codes, materials, site supervision, safety, cost estimation, and much more. What would you like to know?',
  }]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [reportForm, setReportForm] = useState({
    site_name: '', date: new Date().toISOString().split('T')[0],
    workers_present: '', weather_conditions: '', next_day_plan: '',
  });
  const [workItems, setWorkItems] = useState(['']);
  const [materialItems, setMaterialItems] = useState(['']);
  const [issueItems, setIssueItems] = useState(['']);
  const reportApi = useApi(assistanceAPI.dailyReport);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput('');
    const userMsg = { role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const res = await assistanceAPI.chat({
        message: msgText,
        conversation_history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
      });
      if (res.data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.message }]);
      }
    } catch (e) {
      toast.error('Failed to get response. Check backend connection.');
    } finally {
      setChatLoading(false);
    }
  }, [input, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const addItem = (setter) => setter(prev => [...prev, '']);
  const updateItem = (setter, idx, val) => setter(prev => prev.map((x, i) => i === idx ? val : x));
  const removeItem = (setter, idx) => setter(prev => prev.filter((_, i) => i !== idx));

  const handleReport = useCallback(async () => {
    if (!reportForm.site_name) return toast.error('Enter site name.');
    const res = await reportApi.execute({
      ...reportForm,
      workers_present: parseInt(reportForm.workers_present) || 0,
      work_completed: workItems.filter(Boolean),
      materials_used: materialItems.filter(Boolean),
      issues_encountered: issueItems.filter(Boolean),
    });
    if (res?.success) toast.success('Daily report generated!');
  }, [reportForm, workItems, materialItems, issueItems, reportApi]);

  const report = reportApi.data?.data;

  const renderText = (text) => {
    // Simple markdown-like rendering for bold
    return text.split('**').map((t, i) => i % 2 === 1 ? <strong key={i}>{t}</strong> : t);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">💬 Chat AI</div>
          <h1 className="page-title">Daily <span>Site Assistance</span></h1>
          <p className="page-subtitle">Your AI construction expert — chat, get guidance, and auto-generate daily site reports</p>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs" style={{ maxWidth: 400, marginBottom: 24 }}>
          <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 AI Chat</button>
          <button className={`tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>📄 Daily Report</button>
        </div>

        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
            {/* Chat */}
            <div className="chat-container">
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>ConstructAI</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Online · Expert Mode
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    <div className={`chat-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                      {msg.role === 'assistant' ? '🤖' : '👤'}
                    </div>
                    <div className="chat-bubble">
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>{renderText(line)}{j < msg.content.split('\n').length - 1 ? <br /> : null}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message ai">
                    <div className="chat-avatar ai">🤖</div>
                    <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px' }}>
                      <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <textarea className="chat-input" rows={1} placeholder="Ask about IS codes, materials, safety, site issues..."
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                <button className="btn btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }}
                  onClick={() => sendMessage()} disabled={chatLoading || !input.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="card" style={{ position: 'sticky', top: 20 }}>
              <div className="card-header"><span className="card-title">⚡ Quick Questions</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} disabled={chatLoading}
                    style={{ textAlign: 'left', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)', transition: 'all 0.15s', fontFamily: 'Inter,sans-serif', lineHeight: 1.5 }}
                    onMouseEnter={e => { e.target.style.borderColor = 'rgba(245,158,11,0.3)'; e.target.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                    {q}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 12 }}
                onClick={() => setMessages([messages[0]])}>
                <Trash2 size={14} /> Clear Chat
              </button>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="two-col" style={{ alignItems: 'start' }}>
            {/* Report Form */}
            <div className="card">
              <div className="card-header"><span className="card-title"><FileText size={16} /> Daily Site Report</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Site Name *</label>
                    <input className="form-input" placeholder="e.g., Greenview Tower" value={reportForm.site_name} onChange={e => setReportForm(p => ({ ...p, site_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={reportForm.date} onChange={e => setReportForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Workers Present</label>
                    <input className="form-input" type="number" placeholder="e.g., 45" value={reportForm.workers_present} onChange={e => setReportForm(p => ({ ...p, workers_present: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weather</label>
                    <input className="form-input" placeholder="e.g., Sunny, 32°C" value={reportForm.weather_conditions} onChange={e => setReportForm(p => ({ ...p, weather_conditions: e.target.value }))} />
                  </div>
                </div>

                {[
                  { label: 'Work Completed', items: workItems, setter: setWorkItems, placeholder: 'e.g., Slab casting completed for 3rd floor' },
                  { label: 'Materials Used', items: materialItems, setter: setMaterialItems, placeholder: 'e.g., Cement: 50 bags, Steel: 2 tonnes' },
                  { label: 'Issues Encountered', items: issueItems, setter: setIssueItems, placeholder: 'e.g., Formwork delay due to material shortage' },
                ].map(({ label, items, setter, placeholder }) => (
                  <div key={label} className="form-group">
                    <label className="form-label">{label}</label>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input className="form-input" placeholder={placeholder} value={item}
                          onChange={e => updateItem(setter, idx, e.target.value)} />
                        {items.length > 1 && (
                          <button className="btn btn-icon" onClick={() => removeItem(setter, idx)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={() => addItem(setter)} style={{ marginTop: 4 }}>
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Next Day Plan</label>
                  <textarea className="form-textarea" rows={2} placeholder="Plans for tomorrow's activities..." value={reportForm.next_day_plan} onChange={e => setReportForm(p => ({ ...p, next_day_plan: e.target.value }))} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleReport} disabled={reportApi.loading}>
                  {reportApi.loading ? <><span className="loading-spinner" /> Generating...</> : <><FileText size={16} /> Generate Report</>}
                </button>
              </div>
            </div>

            {/* Report Result */}
            <div>
              {reportApi.loading && <div className="card"><LoadingOverlay text="Generating professional daily report..." /></div>}
              {reportApi.error && <ErrorAlert message={reportApi.error} />}
              {!reportApi.loading && !reportApi.error && !report && <div className="card"><EmptyState icon="📄" title="No Report Yet" description="Fill in site details to auto-generate a professional daily report." /></div>}

              {report && !reportApi.loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="card" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.06),rgba(139,92,246,0.04))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{report.report_header?.site_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Report #{report.report_header?.report_number} · {report.report_header?.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Project Health</div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: report.overall_project_health?.includes('ON_TRACK') ? '#10b981' : '#f59e0b' }}>
                          {report.overall_project_health?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{report.executive_summary}</p>
                  </div>

                  {report.productivity_assessment && (
                    <div className="card">
                      <SectionTitle>📊 Productivity Assessment</SectionTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{report.productivity_assessment.score}/10</div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{report.productivity_assessment.rating}</div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{report.productivity_assessment.commentary}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {report.action_items?.length > 0 && (
                    <div className="card">
                      <SectionTitle>✅ Action Items</SectionTitle>
                      {report.action_items.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8, fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.action}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{a.responsible} · {a.deadline}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {report.next_day_activities?.length > 0 && (
                    <div className="card">
                      <SectionTitle>📅 Tomorrow's Plan</SectionTitle>
                      <InfoList items={report.next_day_activities} icon="→" />
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
