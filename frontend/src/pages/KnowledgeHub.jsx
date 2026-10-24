import { useState, useCallback } from 'react';
import { BookOpen, Upload, Brain, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { knowledgeAPI } from '../api/client';
import { useApi, useFileUpload } from '../hooks/useApi';
import ImageUpload from '../components/ImageUpload';
import { LoadingOverlay, ErrorAlert, InfoList, SectionTitle, EmptyState } from '../components/UI';

const DOMAINS = ['general', 'civil', 'structural', 'electrical', 'plumbing', 'safety', 'materials', 'foundation', 'waterproofing'];
const LEVELS = ['beginner', 'intermediate', 'professional'];
const QUIZ_TOPICS = ['Concrete Technology', 'Foundation Design', 'IS Codes', 'Site Safety', 'Steel Structures', 'Masonry', 'Reinforcement', 'Surveying', 'Construction Equipment'];

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState('ask');

  // Q&A
  const [question, setQuestion] = useState('');
  const [domain, setDomain] = useState('general');
  const [level, setLevel] = useState('professional');
  const askApi = useApi(knowledgeAPI.ask);

  // Drawing Analysis
  const { file: drawFile, preview: drawPreview, handleFile: handleDrawFile, clearFile: clearDrawFile } = useFileUpload();
  const [drawQuery, setDrawQuery] = useState('Analyze this construction drawing and explain what it shows.');
  const drawApi = useApi(knowledgeAPI.analyzeDrawing);

  // Quiz
  const [quizTopic, setQuizTopic] = useState('IS Codes');
  const [quizDifficulty, setQuizDifficulty] = useState('intermediate');
  const [quizState, setQuizState] = useState(null); // {questions, answers, submitted}
  const [userAnswers, setUserAnswers] = useState({});
  const quizApi = useApi(knowledgeAPI.generateQuiz);

  const handleAsk = useCallback(async () => {
    if (!question.trim()) return toast.error('Enter a question.');
    const res = await askApi.execute({ question, domain, experience_level: level });
    if (res?.success) toast.success('Answer ready!');
  }, [question, domain, level, askApi]);

  const handleDrawingAnalyze = useCallback(async () => {
    if (!drawFile) return toast.error('Upload a drawing image first.');
    const fd = new FormData();
    fd.append('file', drawFile);
    fd.append('query', drawQuery);
    const res = await drawApi.execute(fd);
    if (res?.success) toast.success('Drawing analyzed!');
  }, [drawFile, drawQuery, drawApi]);

  const handleStartQuiz = useCallback(async () => {
    const res = await quizApi.execute({ topic: quizTopic, difficulty: quizDifficulty, num_questions: 5 });
    if (res?.success && res.data?.questions) {
      setQuizState({ questions: res.data.data.questions, submitted: false });
      setUserAnswers({});
    }
  }, [quizTopic, quizDifficulty, quizApi]);

  const handleSubmitQuiz = () => setQuizState(prev => ({ ...prev, submitted: true }));

  const score = quizState?.submitted
    ? quizState.questions.filter(q => userAnswers[q.id] === q.correct_answer).length
    : null;

  const askResult = askApi.data?.data;
  const drawResult = drawApi.data?.data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-badge">📚 Expert AI</div>
          <h1 className="page-title">Construction <span>Knowledge Hub</span></h1>
          <p className="page-subtitle">IS codes, technical Q&A, drawing analysis, and construction knowledge quizzes</p>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs" style={{ maxWidth: 600, marginBottom: 24 }}>
          <button className={`tab ${activeTab === 'ask' ? 'active' : ''}`} onClick={() => setActiveTab('ask')}>❓ Ask AI</button>
          <button className={`tab ${activeTab === 'drawing' ? 'active' : ''}`} onClick={() => setActiveTab('drawing')}>📐 Drawing Analysis</button>
          <button className={`tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>🏆 Quiz</button>
        </div>

        {/* ── ASK AI ── */}
        {activeTab === 'ask' && (
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="card-header"><span className="card-title"><Brain size={16} /> Ask a Construction Question</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Domain</label>
                    <select className="form-select" value={domain} onChange={e => setDomain(e.target.value)}>
                      {DOMAINS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">My Level</label>
                    <select className="form-select" value={level} onChange={e => setLevel(e.target.value)}>
                      {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Question *</label>
                  <textarea className="form-textarea" rows={5} placeholder="e.g., What is the minimum clear cover for columns as per IS 456? How do I calculate the safe bearing capacity of soil?" value={question} onChange={e => setQuestion(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleAsk} disabled={askApi.loading}>
                  {askApi.loading ? <><span className="loading-spinner" /> Getting Answer...</> : <><BookOpen size={16} /> Get Expert Answer</>}
                </button>

                {/* Sample Questions */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try these:</div>
                  {[
                    'What is the water-cement ratio for different grades of concrete?',
                    'Explain the difference between one-way and two-way slabs',
                    'What are the IS code requirements for earthquake-resistant construction?',
                    'How is pile load capacity calculated?',
                  ].map((q, i) => (
                    <button key={i} onClick={() => setQuestion(q)} style={{ display: 'block', textAlign: 'left', width: '100%', padding: '8px 10px', marginBottom: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s', lineHeight: 1.4 }}
                      onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'rgba(245,158,11,0.3)'; }}
                      onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border)'; }}>
                      ▸ {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Panel */}
            <div>
              {askApi.loading && <div className="card"><LoadingOverlay text="Consulting AI construction expert..." /></div>}
              {askApi.error && <ErrorAlert message={askApi.error} onRetry={handleAsk} />}
              {!askApi.loading && !askApi.error && !askResult && <div className="card"><EmptyState icon="🎓" title="Ask Anything" description="Ask questions about civil engineering, IS codes, materials, safety, or any construction topic." /></div>}

              {askResult && !askApi.loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="card">
                    <div style={{ display: 'flex', align: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: 'var(--primary)', border: '1px solid rgba(245,158,11,0.2)' }}>{askResult.domain?.toUpperCase()}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>{askResult.difficulty_level}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{askResult.answer}</div>
                  </div>

                  {askResult.key_points?.length > 0 && (
                    <div className="card">
                      <SectionTitle>🎯 Key Points</SectionTitle>
                      <InfoList items={askResult.key_points} icon="▸" />
                    </div>
                  )}

                  {askResult.relevant_is_codes?.length > 0 && (
                    <div className="card">
                      <SectionTitle>📜 Relevant IS Codes</SectionTitle>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {askResult.relevant_is_codes.map((c, i) => (
                          <span key={i} style={{ padding: '5px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {askResult.practical_tips?.length > 0 && (
                      <div className="card">
                        <SectionTitle>💡 Practical Tips</SectionTitle>
                        <InfoList items={askResult.practical_tips} icon="→" />
                      </div>
                    )}
                    {askResult.common_mistakes?.length > 0 && (
                      <div className="card">
                        <SectionTitle>❌ Common Mistakes</SectionTitle>
                        <InfoList items={askResult.common_mistakes} icon="✗" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DRAWING ANALYSIS ── */}
        {activeTab === 'drawing' && (
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="card-header"><span className="card-title"><Upload size={16} /> Upload Drawing / Image</span></div>
              <ImageUpload file={drawFile} preview={drawPreview} onFile={handleDrawFile} onClear={() => { clearDrawFile(); drawApi.reset?.(); }}
                label="Upload construction drawing or technical image" hint="Plans, sections, elevations, details — JPG, PNG, PDF screenshots" />
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Your Query</label>
                <textarea className="form-textarea" rows={3} value={drawQuery} onChange={e => setDrawQuery(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 10 }} onClick={handleDrawingAnalyze} disabled={drawApi.loading || !drawFile}>
                {drawApi.loading ? <><span className="loading-spinner" /> Analyzing...</> : <><Brain size={16} /> Analyze Drawing</>}
              </button>
            </div>

            <div>
              {drawApi.loading && <div className="card"><LoadingOverlay text="Analyzing construction drawing with Gemini Vision..." /></div>}
              {drawApi.error && <ErrorAlert message={drawApi.error} onRetry={handleDrawingAnalyze} />}
              {!drawApi.loading && !drawApi.error && !drawResult && <div className="card"><EmptyState icon="📐" title="Upload a Drawing" description="Upload any construction drawing, plan, or technical image for AI analysis." /></div>}

              {drawResult && !drawApi.loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="card">
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Image Type: </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{drawResult.image_type}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{drawResult.summary}</p>
                  </div>
                  {drawResult.query_response && (
                    <div className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
                      <SectionTitle>💬 Answer to Your Query</SectionTitle>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{drawResult.query_response}</p>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {drawResult.key_elements?.length > 0 && <div className="card"><SectionTitle>🔍 Elements Found</SectionTitle><InfoList items={drawResult.key_elements} icon="▸" /></div>}
                    {drawResult.concerns_or_errors?.length > 0 && <div className="card"><SectionTitle>⚠️ Concerns / Errors</SectionTitle><InfoList items={drawResult.concerns_or_errors} icon="⚠" /></div>}
                    {drawResult.recommendations?.length > 0 && <div className="card"><SectionTitle>💡 Recommendations</SectionTitle><InfoList items={drawResult.recommendations} icon="→" /></div>}
                    {drawResult.compliance_observations?.length > 0 && <div className="card"><SectionTitle>📜 Compliance Notes</SectionTitle><InfoList items={drawResult.compliance_observations} icon="§" /></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {activeTab === 'quiz' && (
          <div>
            {!quizState && (
              <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="card-header"><span className="card-title"><Trophy size={16} /> Construction Knowledge Quiz</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Topic</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {QUIZ_TOPICS.map(t => (
                        <button key={t} onClick={() => setQuizTopic(t)} style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter,sans-serif', background: quizTopic === t ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)', color: quizTopic === t ? 'var(--primary)' : 'var(--text-muted)', borderColor: quizTopic === t ? 'rgba(245,158,11,0.4)' : 'var(--border)', transition: 'all 0.15s' }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['beginner', 'intermediate', 'advanced'].map(d => (
                        <button key={d} onClick={() => setQuizDifficulty(d)} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', fontFamily: 'Inter,sans-serif', background: quizDifficulty === d ? 'rgba(6,182,212,0.12)' : 'var(--bg-elevated)', color: quizDifficulty === d ? 'var(--accent)' : 'var(--text-muted)', borderColor: quizDifficulty === d ? 'rgba(6,182,212,0.35)' : 'var(--border)', transition: 'all 0.15s' }}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg btn-full" onClick={handleStartQuiz} disabled={quizApi.loading}>
                    {quizApi.loading ? <><span className="loading-spinner" /> Generating Quiz...</> : <><Trophy size={18} /> Start Quiz (5 Questions)</>}
                  </button>
                  {quizApi.error && <ErrorAlert message={quizApi.error} />}
                </div>
              </div>
            )}

            {quizState && (
              <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{quizTopic} Quiz</h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{quizDifficulty} level · 5 questions</span>
                  </div>
                  {quizState.submitted && (
                    <div style={{ textAlign: 'center', padding: '12px 20px', background: score >= 4 ? 'rgba(16,185,129,0.1)' : score >= 2 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 10, border: `1px solid ${score >= 4 ? 'rgba(16,185,129,0.3)' : score >= 2 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: score >= 4 ? '#10b981' : score >= 2 ? '#f59e0b' : '#ef4444' }}>{score}/5</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{score >= 4 ? '🎉 Excellent!' : score >= 2 ? '👍 Good Try!' : '📚 Keep Learning!'}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {quizState.questions.map((q, qi) => {
                    const userAns = userAnswers[q.id];
                    const isCorrect = userAns === q.correct_answer;
                    return (
                      <div key={q.id} className="card" style={{ borderColor: quizState.submitted ? (isCorrect ? 'rgba(16,185,129,0.3)' : userAns ? 'rgba(239,68,68,0.3)' : 'var(--border)') : 'var(--border)' }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0 }}>Q{qi + 1}</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.question}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {Object.entries(q.options).map(([key, val]) => {
                            let bg = 'var(--bg-elevated)', bc = 'var(--border)', tc = 'var(--text-secondary)';
                            if (quizState.submitted) {
                              if (key === q.correct_answer) { bg = 'rgba(16,185,129,0.1)'; bc = 'rgba(16,185,129,0.4)'; tc = '#34d399'; }
                              else if (key === userAns && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; bc = 'rgba(239,68,68,0.3)'; tc = '#f87171'; }
                            } else if (key === userAns) { bg = 'rgba(245,158,11,0.1)'; bc = 'rgba(245,158,11,0.3)'; tc = 'var(--primary)'; }
                            return (
                              <button key={key} onClick={() => !quizState.submitted && setUserAnswers(prev => ({ ...prev, [q.id]: key }))}
                                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, cursor: quizState.submitted ? 'default' : 'pointer', border: `1px solid ${bc}`, background: bg, color: tc, fontSize: '0.85rem', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s', fontWeight: key === userAns ? 600 : 400 }}>
                                <strong>{key}.</strong> {val}
                              </button>
                            );
                          })}
                        </div>
                        {quizState.submitted && q.explanation && (
                          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, fontSize: '0.82rem', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.15)' }}>
                            💡 <strong>Explanation:</strong> {q.explanation}
                            {q.is_code_reference && <div style={{ marginTop: 4, color: 'var(--primary)' }}>📜 {q.is_code_reference}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
                  {!quizState.submitted && (
                    <button className="btn btn-primary btn-lg" onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length < quizState.questions.length}>
                      <Trophy size={18} /> Submit Answers
                    </button>
                  )}
                  <button className="btn btn-secondary btn-lg" onClick={() => { setQuizState(null); setUserAnswers({}); }}>
                    {quizState.submitted ? '🔄 New Quiz' : '✕ Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
