import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLeadStore } from '../store/leadStore';
import { useVisitStore } from '../store/visitStore';
import { useReminderStore } from '../store/reminderStore';
import { usePropertyStore } from '../store/propertyStore';
import {
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { LeadDrawer } from './LeadDrawer';

export function AgentCockpit() {
  const { currentUser } = useAuthStore();
  const { leads, updateLead } = useLeadStore();
  const { visits, updateVisit } = useVisitStore();
  const { getOverdueLeads } = useReminderStore();
  const { properties } = usePropertyStore();

  const [selectedLead, setSelectedLead] = useState(null);
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());

  // Filter tasks specific to current logged-in agent (or all if admin)
  const agentId = currentUser?.id;
  const isAgentOrAdmin = (assignedId) => {
    if (!currentUser || currentUser.role === 'admin') return true;
    return assignedId === agentId;
  };

  // 1. Overdue or due-today callbacks for this agent
  const overdueCallbacks = getOverdueLeads(leads)
    .filter(l => isAgentOrAdmin(l.assignedTo))
    .slice(0, 5);

  // 2. Today's Site Visits for this agent
  const todayDateStr = new Date().toDateString();
  const todayVisits = (visits || [])
    .filter(v => isAgentOrAdmin(v.agentId) && new Date(v.scheduledDate).toDateString() === todayDateStr)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  // 3. Hot Deals in Negotiation / Site Visit Done
  const hotDeals = leads
    .filter(l => isAgentOrAdmin(l.assignedTo) && (l.stage === 'negotiation' || l.stage === 'visit_done') && l.priority === 'hot')
    .slice(0, 4);

  // Total daily tasks for progress computation
  const totalDailyTasks = overdueCallbacks.length + todayVisits.length;
  const completedCount = completedTaskIds.size;
  const progressPct = totalDailyTasks > 0 ? Math.min(100, Math.round((completedCount / totalDailyTasks) * 100)) : 100;

  const handleMarkTaskDone = (taskId) => {
    setCompletedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handlePostponeLead = (leadId, e) => {
    e.stopPropagation();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    updateLead(leadId, { nextFollowUp: tomorrow.toISOString() });
  };

  const handleCall = (phone, e) => {
    e.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (lead, e) => {
    e.stopPropagation();
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${lead.name}, this is ${currentUser?.name || 'your relationship manager'} from PropDesk Realty. Following up on your property search for ${lead.requirements?.bhk || ''} ${lead.requirements?.propertyType || ''}. Are you available for a quick discussion?`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="agent-cockpit-card" style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: '20px 22px',
      marginBottom: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Cockpit Top Bar */}
      <div className="agent-cockpit-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>🎯 My Day Today</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(37,99,235,0.1)',
              color: 'var(--color-primary)'
            }}>
              {currentUser?.name || 'Agent'} Cockpit
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 3 }}>
            High-priority customer calls, scheduled visits, and closing actions for today.
          </div>
        </div>

        {/* Daily Completion Meter */}
        <div className="agent-cockpit-meter" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              <span>Day Velocity</span>
              <span>{completedCount}/{totalDailyTasks} Closed</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-muted)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: progressPct === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: progressPct === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
            {progressPct}%
          </div>
        </div>
      </div>

      {/* 3 Action Pillars */}
      <div className="agent-cockpit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        
        {/* Pillar 1: Urgent Callbacks */}
        <div style={{ background: 'var(--color-muted)', borderRadius: 12, padding: 14, border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
              <Phone size={14} /> Priority Callbacks ({overdueCallbacks.length})
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', background: 'var(--color-card)', padding: '2px 6px', borderRadius: 6 }}>
              Action Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {overdueCallbacks.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                ✅ All client follow-ups are up to date!
              </div>
            ) : (
              overdueCallbacks.map(lead => {
                const isDone = completedTaskIds.has(`call_${lead.id}`);
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      background: 'var(--color-card)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      opacity: isDone ? 0.5 : 1,
                      textDecoration: isDone ? 'line-through' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                          {lead.requirements?.bhk || ''} {lead.requirements?.propertyType || 'Property'} • ₹{lead.requirements?.budgetMinLakhs}-{lead.requirements?.budgetMaxLakhs}L
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                        Overdue
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          style={{ color: '#16a34a', minWidth: 32, minHeight: 32, padding: '4px 6px' }}
                          title="Call immediately"
                          onClick={(e) => handleCall(lead.phone, e)}
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          style={{ color: '#2563eb', minWidth: 32, minHeight: 32, padding: '4px 6px' }}
                          title="WhatsApp chat"
                          onClick={(e) => handleWhatsApp(lead, e)}
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-fg)', minWidth: 32, minHeight: 32, padding: '4px 6px' }}
                          title="Postpone by 1 day"
                          onClick={(e) => handlePostponeLead(lead.id, e)}
                        >
                          +1d
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMarkTaskDone(`call_${lead.id}`); }}
                        style={{
                          background: isDone ? 'var(--color-success)' : 'transparent',
                          color: isDone ? '#fff' : 'var(--color-muted-fg)',
                          border: `1px solid ${isDone ? 'var(--color-success)' : 'var(--color-border)'}`,
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px',
                          minHeight: 32,
                          cursor: 'pointer'
                        }}
                      >
                        {isDone ? 'Done ✓' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pillar 2: Today's Site Visits */}
        <div style={{ background: 'var(--color-muted)', borderRadius: 12, padding: 14, border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}>
              <Calendar size={14} /> Today's Site Visits ({todayVisits.length})
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', background: 'var(--color-card)', padding: '2px 6px', borderRadius: 6 }}>
              On Ground
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayVisits.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                No site visits scheduled today. Good time to call warm leads!
              </div>
            ) : (
              todayVisits.map(visit => {
                const lead = leads.find(l => l.id === visit.leadId);
                const property = properties.find(p => p.id === visit.propertyId);
                const isDone = visit.status === 'completed' || completedTaskIds.has(`visit_${visit.id}`);
                const mapUrl = property?.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property?.locality || 'Bengaluru')}`;

                return (
                  <div
                    key={visit.id}
                    style={{
                      background: 'var(--color-card)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      opacity: isDone ? 0.5 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{lead?.name || 'Buyer Visit'}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
                          🏢 {property?.name || 'Project'} ({visit.scheduledTime || '11:00 AM'})
                        </div>
                      </div>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '2px 6px', height: 24, fontSize: 11, color: 'var(--color-primary)', gap: 3 }}
                        title="Open directions in Google Maps"
                      >
                        <MapPin size={11} /> Map
                      </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                        📞 {lead?.phone || ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleMarkTaskDone(`visit_${visit.id}`);
                          updateVisit(visit.id, { status: isDone ? 'scheduled' : 'completed' });
                        }}
                        style={{
                          background: isDone ? 'var(--color-success)' : 'transparent',
                          color: isDone ? '#fff' : 'var(--color-muted-fg)',
                          border: `1px solid ${isDone ? 'var(--color-success)' : 'var(--color-border)'}`,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        {isDone ? 'Conducted ✓' : 'Mark Visited'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pillar 3: Hot Closing Deals */}
        <div style={{ background: 'var(--color-muted)', borderRadius: 12, padding: 14, border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
              <Flame size={14} /> Hot Deals to Close ({hotDeals.length})
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', background: 'var(--color-card)', padding: '2px 6px', borderRadius: 6 }}>
              High Commission
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hotDeals.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                Move active leads to Negotiation stage to track quick wins here!
              </div>
            ) : (
              hotDeals.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    background: 'var(--color-card)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                        Budget: <strong>₹{lead.requirements?.budgetMinLakhs}-{lead.requirements?.budgetMaxLakhs}L</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      {lead.stage === 'negotiation' ? 'In Negotiation' : 'Visit Done'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                      Est. Commission: ~{formatINR((lead.requirements?.budgetMaxLakhs || 80) * 0.02)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      View <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Embedded Lead Drawer for clicking on any task */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
