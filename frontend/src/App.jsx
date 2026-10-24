import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SafetyMonitoring from './pages/SafetyMonitoring';
import CrackDetection from './pages/CrackDetection';
import RealEstateValuation from './pages/RealEstateValuation';
import ProjectPlanning from './pages/ProjectPlanning';
import SiteAssistance from './pages/SiteAssistance';
import WeatherAdvisory from './pages/WeatherAdvisory';
import KnowledgeHub from './pages/KnowledgeHub';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2128',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/safety" element={<SafetyMonitoring />} />
            <Route path="/crack" element={<CrackDetection />} />
            <Route path="/valuation" element={<RealEstateValuation />} />
            <Route path="/planning" element={<ProjectPlanning />} />
            <Route path="/assistance" element={<SiteAssistance />} />
            <Route path="/weather" element={<WeatherAdvisory />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
