import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, CalendarDays, 
  PhoneCall, IndianRupee, Shield, Settings, TrendingUp, 
  Flame, CheckCircle2, X, ChevronLeft, ChevronRight, CheckSquare, Handshake
} from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useLeadStore } from '../store/leadStore';
import { useReminderStore } from '../store/reminderStore';
import { usePropertyStore } from '../store/propertyStore';
import { useTaskStore } from '../store/taskStore';
import { useBuilderStore } from '../store/builderStore';
import './Sidebar.css';

export function Sidebar() {
  const { 
    sidebarOpen, toggleSidebar, 
    sidebarCollapsed, toggleSidebarCollapse, 
    leadFilter, setLeadFilter 
  } = useUiStore();
  const { currentUser } = useAuthStore();
  const { leads, getLeads, getLeadsByAgent, getUnassignedLeads } = useLeadStore();
  const { getOverdueLeads } = useReminderStore();
  const { properties } = usePropertyStore();
  const { tasks } = useTaskStore();
  const { builders } = useBuilderStore();
  const buildersCount = (builders || []).length;

  const allLeads = getLeads();
  const myLeadsCount = currentUser ? getLeadsByAgent(currentUser.id).length : 0;
  const unassignedCount = getUnassignedLeads().length;
  const overdueCount = getOverdueLeads(allLeads).length;
  const hotLeadsCount = allLeads.filter(l => l.priority === 'hot').length;
  const wonCount = allLeads.filter(l => l.stage === 'won').length;
  const pendingTasksCount = (tasks || []).filter(t => t.status === 'pending').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={`app-sidebar ${sidebarOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Collapse Toggle Header (Desktop) */}
        <div className="sidebar-collapse-header">
          <div className="collapse-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--color-muted-fg)' }}>
              Workspace
            </span>
          </div>
          <button 
            type="button"
            className="collapse-btn"
            onClick={toggleSidebarCollapse}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Mobile Header with Close Button */}
        <div className="sidebar-header mobile-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-icon" style={{ width: 24, height: 24, fontSize: 13 }}>P</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>PropDesk</span>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={toggleSidebar}>
            <X size={18} />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="sidebar-section">
          <h3 className="sidebar-title">Navigation</h3>
          <nav className="sidebar-nav">
            <NavLink to="/app/dashboard" className="sidebar-nav-item" title="Dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/app/leads" className="sidebar-nav-item" title="Leads">
              <Users size={18} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Leads</span>
                <span className="sidebar-badge">{allLeads.length}</span>
              </div>
            </NavLink>
            <NavLink to="/app/tasks" className="sidebar-nav-item" title="Tasks">
              <CheckSquare size={18} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tasks</span>
                {pendingTasksCount > 0 && (
                  <span className="sidebar-badge" style={{ background: '#f59e0b', color: '#fff' }}>
                    {pendingTasksCount}
                  </span>
                )}
              </div>
            </NavLink>
            <NavLink to="/app/properties" className="sidebar-nav-item" title="Properties">
              <Building2 size={18} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Properties</span>
                <span className="sidebar-badge">{properties.length}</span>
              </div>
            </NavLink>
            <NavLink to="/app/builders" className="sidebar-nav-item" title="Builders & Sellers">
              <Handshake size={18} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Builders & Sellers</span>
                <span className="sidebar-badge" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)' }}>
                  {buildersCount}
                </span>
              </div>
            </NavLink>
            <NavLink to="/app/calendar" className="sidebar-nav-item" title="Site Visits">
              <CalendarDays size={18} />
              <span>Site Visits</span>
            </NavLink>
            <NavLink to="/app/telephony" className="sidebar-nav-item" title="Calls & Telephony">
              <PhoneCall size={18} />
              <span>Calls & Telephony</span>
            </NavLink>
            <NavLink to="/app/deals" className="sidebar-nav-item" title="Deals & Commission">
              <IndianRupee size={18} />
              <span>Deals & Commission</span>
            </NavLink>
          </nav>
        </div>

        {/* Admin Navigation */}
        {currentUser?.role === 'admin' && (
          <div className="sidebar-section" style={{ marginTop: 16 }}>
            <h3 className="sidebar-title">Management</h3>
            <nav className="sidebar-nav">
              <NavLink to="/app/team" className="sidebar-nav-item" title="Team & Agents">
                <Shield size={18} />
                <span>Team & Agents</span>
              </NavLink>
              <NavLink to="/app/settings" className="sidebar-nav-item" title="Settings">
                <Settings size={18} />
                <span>Settings</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Pipeline Quick Filters */}
        <div className="sidebar-section" style={{ marginTop: 20 }}>
          <h3 className="sidebar-title">Lead Filters</h3>
          <div className="sidebar-filters">
            <button 
              className={`filter-btn ${leadFilter === 'my' ? 'active' : ''}`}
              onClick={() => setLeadFilter('my')}
            >
              <span className="filter-dot" style={{ backgroundColor: 'var(--color-primary)' }}></span>
              <span style={{ flex: 1, textAlign: 'left' }}>My Leads</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{myLeadsCount}</span>
            </button>

            <button 
              className={`filter-btn ${leadFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLeadFilter('all')}
            >
              <span className="filter-dot" style={{ backgroundColor: '#94a3b8' }}></span>
              <span style={{ flex: 1, textAlign: 'left' }}>All Leads</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{allLeads.length}</span>
            </button>

            <button 
              className={`filter-btn ${leadFilter === 'unassigned' ? 'active' : ''}`}
              onClick={() => setLeadFilter('unassigned')}
            >
              <span className="filter-dot" style={{ backgroundColor: '#f59e0b' }}></span>
              <span style={{ flex: 1, textAlign: 'left' }}>Unassigned</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{unassignedCount}</span>
            </button>

            <button 
              className={`filter-btn ${leadFilter === 'overdue' ? 'active' : ''}`}
              onClick={() => setLeadFilter('overdue')}
              style={overdueCount > 0 ? { color: '#ef4444' } : {}}
            >
              <span className="filter-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span style={{ flex: 1, textAlign: 'left' }}>Overdue Follow-ups</span>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 10,
                background: overdueCount > 0 ? '#ef4444' : 'transparent',
                color: overdueCount > 0 ? '#fff' : 'inherit'
              }}>
                {overdueCount}
              </span>
            </button>
          </div>
        </div>

        {/* Live Metrics Summary */}
        <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div className="sidebar-stats-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-muted-fg)' }}>
                Sales Health
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                <TrendingUp size={12} /> Active
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'var(--color-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Hot Leads</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={14} /> {hotLeadsCount}
                </div>
              </div>

              <div style={{ background: 'var(--color-card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Deals Won</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} /> {wonCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
