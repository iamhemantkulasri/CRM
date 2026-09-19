import React from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { AgentBadge } from '../components/AgentBadge';
import { Shield, ShieldAlert, UserCog } from 'lucide-react';

export function Team() {
  const { employees } = useEmployeeStore();

  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage agents and permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('MVP: Add Agent disabled.')}>+ Add Agent</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: '0 4px' }}>
        {employees.map(emp => (
          <div key={emp.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 20 }}>
            <AgentBadge employee={emp} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{emp.name}</h3>
                {emp.role === 'admin' ? (
                  <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <UserCog size={16} style={{ color: 'var(--color-muted-fg)' }} />
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', marginBottom: 8 }}>{emp.email}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>{emp.phone}</div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost" style={{ padding: '4px 12px', height: 'auto', fontSize: 12 }}>Edit</button>
                <button className="btn btn-ghost" style={{ padding: '4px 12px', height: 'auto', fontSize: 12, color: emp.status === 'active' ? 'var(--color-destructive)' : 'var(--color-success)' }}>
                  {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
