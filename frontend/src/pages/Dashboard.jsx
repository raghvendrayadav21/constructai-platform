import { Link } from 'react-router-dom';
import { Shield, Search, Home, BarChart3, MessageSquare, Cloud, BookOpen, ArrowRight, Zap, TrendingUp, Users, Award } from 'lucide-react';

const FEATURES = [
  {
    to: '/safety',
    icon: '🦺',
    title: 'Safety Monitoring',
    desc: 'AI-powered hazard detection and risk assessment from site images and descriptions.',
    color: 'linear-gradient(135deg,#ef4444,#f97316)',
    badge: 'Vision AI'
  },
  {
    to: '/crack',
    icon: '🔍',
    title: 'Crack Detection',
    desc: 'Structural crack analysis with severity scoring, cause identification, and repair recommendations.',
    color: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    badge: 'Vision AI'
  },
  {
    to: '/valuation',
    icon: '🏠',
    title: 'Real Estate Valuation',
    desc: 'Intelligent property valuation with market analysis, rental yield, and investment outlook.',
    color: 'linear-gradient(135deg,#10b981,#06b6d4)',
    badge: 'Market AI'
  },
  {
    to: '/planning',
    icon: '📋',
    title: 'Project Planning',
    desc: 'Full project plan generation with phases, resource allocation, and cost breakdown.',
    color: 'linear-gradient(135deg,#f59e0b,#f97316)',
    badge: 'Planning AI'
  },
  {
    to: '/assistance',
    icon: '💬',
    title: 'Site Assistance',
    desc: 'Real-time AI chat assistant and automated daily site report generation.',
    color: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    badge: 'Chat AI'
  },
  {
    to: '/weather',
    icon: '⛅',
    title: 'Weather Advisory',
    desc: 'Weather-aware construction scheduling with activity-specific safety advisories.',
    color: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
    badge: 'Live Data'
  },
  {
    to: '/knowledge',
    icon: '📚',
    title: 'Knowledge Hub',
    desc: 'IS code references, technical Q&A, drawing analysis, and construction quizzes.',
    color: 'linear-gradient(135deg,#ec4899,#f59e0b)',
    badge: 'Expert AI'
  },
];

const STATS = [
  { icon: <Zap size={20} />, value: '7', label: 'AI Modules', color: '#f59e0b' },
  { icon: <TrendingUp size={20} />, value: 'Real-time', label: 'Analysis', color: '#10b981' },
  { icon: <Users size={20} />, value: 'Multi-modal', label: 'AI Engine', color: '#06b6d4' },
  { icon: <Award size={20} />, value: 'IS Codes', label: 'Compliant', color: '#8b5cf6' },
];

export default function Dashboard() {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(6,182,212,0.04) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 32px 32px',
      }}>
        <div style={{ maxWidth: 700 }}>
          <div className="page-header-badge" style={{ marginBottom: 16 }}>
            🤖 AI-Powered Platform
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, color: 'var(--text-primary)' }}>
            Multimodal Construction{' '}
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Intelligence
            </span>{' '}
            Platform
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
            Empowering construction professionals with AI-driven safety monitoring, crack detection, property valuation, project planning, and expert knowledge — all in one intelligent platform.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/safety" className="btn btn-primary btn-lg">
              <Shield size={18} /> Start Safety Scan
            </Link>
            <Link to="/assistance" className="btn btn-secondary btn-lg">
              <MessageSquare size={18} /> Ask ConstructAI
            </Link>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="metrics-row" style={{ marginBottom: 32, marginTop: 0 }}>
          {STATS.map((s, i) => (
            <div key={i} className="metric-card">
              <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
              <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
              <div className="metric-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="section-title">AI Feature Modules</div>
        <div className="dashboard-grid">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} className="feature-card">
              <div className="feature-card-icon" style={{ background: f.color + '22', border: `1px solid ${f.color}44` }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className="feature-card-title" style={{ marginBottom: 0 }}>{f.title}</div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                  background: 'rgba(245,158,11,0.1)', color: 'var(--primary)', border: '1px solid rgba(245,158,11,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>{f.badge}</span>
              </div>
              <div className="feature-card-desc">{f.desc}</div>
              <div className="feature-card-arrow"><ArrowRight size={16} /></div>
            </Link>
          ))}
        </div>

        {/* Quick Start */}
        <div className="card" style={{ marginTop: 32, background: 'linear-gradient(135deg,rgba(245,158,11,0.05),rgba(6,182,212,0.03))' }}>
          <div className="card-header">
            <span className="card-title">🚀 Quick Start Guide</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { step: '01', title: 'Configure API Keys', desc: 'Add your Gemini API key to backend/.env file', icon: '🔑' },
              { step: '02', title: 'Start the Backend', desc: 'Run: uvicorn main:app --reload in /backend folder', icon: '⚙️' },
              { step: '03', title: 'Launch Frontend', desc: 'Run: npm run dev in /frontend folder', icon: '🖥️' },
              { step: '04', title: 'Explore Features', desc: 'Upload images, ask questions, generate reports!', icon: '✨' },
            ].map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>STEP {s.step}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
