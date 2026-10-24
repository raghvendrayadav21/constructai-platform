export function LoadingOverlay({ text = 'Analyzing with AI...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
      <div style={{ textAlign: 'center' }}>
        <p className="loading-text">{text}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Powered by Google Gemini · This may take 10–30 seconds
        </p>
      </div>
    </div>
  );
}

export function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger" style={{ flexDirection: 'column', gap: 10 }}>
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <strong>Analysis Failed</strong>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function RiskBadge({ level }) {
  const lvl = (level || '').toUpperCase();
  return <span className={`badge badge-${lvl}`}>{lvl}</span>;
}

export function ScoreRing({ score, size = 80, label }) {
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-ring-container">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="score-ring-value" style={{ color, fontSize: size * 0.18 }}>
          {score}
        </div>
      </div>
      {label && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
}

export function InfoList({ items, icon = '▸' }) {
  if (!items?.length) return null;
  return (
    <div className="info-list">
      {items.map((item, i) => (
        <div key={i} className="info-item">
          <span className="info-item-dot">{icon}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function ProgressBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function EmptyState({ icon = '🔍', title = 'No results yet', description = 'Run an analysis to see results here.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem' }}>{description}</p>
    </div>
  );
}
