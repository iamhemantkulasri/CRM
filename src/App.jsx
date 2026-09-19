import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Properties } from './pages/Properties';
import { PropertyDetails } from './pages/PropertyDetails';
import { Calendar } from './pages/Calendar';
import { Telephony } from './pages/Telephony';
import { Deals } from './pages/Deals';
import { KanbanBoard } from './pages/KanbanBoard';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Tasks } from './pages/Tasks';
import { BuildersSellers } from './pages/BuildersSellers';
import { useAuthStore } from './store/authStore';
import { useUiStore } from './store/uiStore';
import { usePropertyStore } from './store/propertyStore';
import { useLeadStore } from './store/leadStore';
import { useBuilderStore } from './store/builderStore';
import { LayoutDashboard, Users, Building2, CalendarDays, PhoneCall, Handshake } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Layout Shell
const AppLayout = () => {
  const { setActiveView, sidebarCollapsed } = useUiStore();
  const location = useLocation();
  
  const { fetchProperties } = usePropertyStore();
  const { fetchLeads, subscribeToLeads } = useLeadStore();
  const { fetchBuilders } = useBuilderStore();

  // Load live Supabase data on mount & listen for incoming website leads in realtime
  useEffect(() => {
    fetchProperties();
    fetchLeads();
    fetchBuilders();
    const unsubscribe = subscribeToLeads();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchProperties, fetchLeads, fetchBuilders, subscribeToLeads]);

  // Sync router path with UI store
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const view = parts[1] || 'dashboard';
    setActiveView(view);
  }, [location, setActiveView]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header />
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="builders" element={<BuildersSellers />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="telephony" element={<Telephony />} />
          <Route path="deals" element={<Deals />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="leads" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          <NavItem to="/app/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/app/leads" icon={Users} label="Leads" />
          <NavItem to="/app/properties" icon={Building2} label="Properties" />
          <NavItem to="/app/calendar" icon={CalendarDays} label="Visits" />
          <NavItem to="/app/telephony" icon={PhoneCall} label="Calls" />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(to);
  
  return (
    <button 
      className={`bottom-nav-item ${isActive ? 'active' : ''}`}
      onClick={() => window.location.hash = `#${to}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
