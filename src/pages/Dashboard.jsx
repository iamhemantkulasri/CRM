import React from 'react';
import { useLeadStore } from '../store/leadStore';
import { useVisitStore } from '../store/visitStore';
import { useCallStore } from '../store/callStore';
import { Users, Calendar, PhoneMissed, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { STAGES } from '../utils/constants';
import { AgentCockpit } from '../components/AgentCockpit';

const COLORS = ['#3B82F6', '#8B5CF6', '#6366F1', '#0EA5E9', '#F59E0B', '#F97316', '#EC4899', '#10B981', '#EF4444'];

export function Dashboard() {
  const { leads } = useLeadStore();
  const { visits } = useVisitStore();
  const { calls } = useCallStore();

  // Metrics
  const totalLeads = leads.length;
  const todayVisits = visits.filter(v => new Date(v.scheduledDate).toDateString() === new Date().toDateString()).length;
  const missedCalls = calls.filter(c => c.status === 'missed' && new Date(c.timestamp).toDateString() === new Date().toDateString()).length;
  
  // Dummy Deals Closed for MVP (would come from dealStore)
  const dealsClosed = leads.filter(l => l.stage === 'won').length;
  const totalDealValue = leads.filter(l => l.stage === 'won').reduce((acc, curr) => acc + (curr.requirements.budgetMinLakhs || 0), 0);

  // Chart Data
  const leadsByStage = STAGES.map(stage => ({
    name: stage.label,
    count: leads.filter(l => l.stage === stage.id).length
  }));

  const sources = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});
  
  const leadSourceData = Object.keys(sources).map(source => ({
    name: source.replace('_', ' ').toUpperCase(),
    value: sources[source]
  }));

  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your real estate business</p>
        </div>
      </div>
      
      {/* Agent Daily Command Center */}
      <AgentCockpit />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24, padding: '0 4px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ background: 'var(--color-primary)', color: '#fff', padding: 12, borderRadius: 'var(--border-radius-md)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontWeight: 500 }}>Total Leads</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalLeads}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ background: 'var(--color-warning)', color: '#000', padding: 12, borderRadius: 'var(--border-radius-md)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontWeight: 500 }}>Visits Today</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{todayVisits}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ background: 'var(--color-success)', color: '#fff', padding: 12, borderRadius: 'var(--border-radius-md)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontWeight: 500 }}>Deals Won</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{dealsClosed} <span style={{ fontSize: 14, color: 'var(--color-success)' }}>(₹{totalDealValue}L)</span></div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ background: 'var(--color-destructive)', color: '#fff', padding: 12, borderRadius: 'var(--border-radius-md)' }}>
            <PhoneMissed size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontWeight: 500 }}>Missed Calls</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{missedCalls}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, padding: '0 4px 16px' }}>
        <div className="card">
          <h3 className="section-title">Leads by Stage</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStage} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: 'var(--color-muted-fg)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 'var(--border-radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
                  {leadsByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Lead Sources</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 'var(--border-radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              {leadSourceData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-muted-fg)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
