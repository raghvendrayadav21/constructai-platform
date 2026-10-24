import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield, Search, Home, BarChart3, MessageSquare,
  Cloud, BookOpen, LayoutDashboard, HardHat, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { healthAPI } from '../api/client';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
];

const FEATURE_NAV = [
  { to: '/safety', label: 'Safety Monitoring', icon: Shield, badge: 'AI' },
  { to: '/crack', label: 'Crack Detection', icon: Search, badge: 'AI' },
  { to: '/valuation', label: 'Real Estate Value', icon: Home, badge: 'AI' },
  { to: '/planning', label: 'Project Planning', icon: BarChart3, badge: 'AI' },
  { to: '/assistance', label: 'Site Assistance', icon: MessageSquare, badge: 'AI' },
  { to: '/weather', label: 'Weather Advisory', icon: Cloud, badge: 'AI' },
  { to: '/knowledge', label: 'Knowledge Hub', icon: BookOpen, badge: 'AI' },
];

export default function Sidebar() {
  const location = useLocation();
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthAPI.check();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/" className="sidebar-logo">
        <div className="sidebar-logo-icon">🏗️</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">ConstructAI</span>
          <span className="sidebar-logo-sub">Intelligence Platform</span>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Overview</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-item-icon" size={17} />
            {label}
          </NavLink>
        ))}

        <span className="nav-section-label">AI Features</span>
        {FEATURE_NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-item-icon" size={17} />
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-api-status">
          <div className={`status-dot ${apiOnline === false ? 'offline' : ''}`} />
          <span>
            {apiOnline === null
              ? 'Checking backend...'
              : apiOnline
              ? 'Backend connected'
              : 'Backend offline'}
          </span>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Powered by Google Gemini
        </div>
      </div>
    </aside>
  );
}
