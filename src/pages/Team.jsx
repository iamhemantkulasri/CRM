import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { AgentBadge } from '../components/AgentBadge';
import { AgentModal } from '../components/AgentModal';
import { Shield, UserCog, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';

export function Team() {
  const { employees, fetchEmployees, toggleEmployeeStatus } = useEmployeeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddAgent = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditAgent = (emp) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (emp) => {
    const action = emp.status === 'active' ? 'deactivate' : 'activate';
    if (emp.role === 'admin' && emp.status === 'active') {
      const activeAdmins = employees.filter(e => e.role === 'admin' && e.status === 'active');
      if (activeAdmins.length <= 1) {
        alert('Cannot deactivate the sole active Admin account.');
        return;
      }
    }
    if (window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) {
      toggleEmployeeStatus(emp.id);
    }
  };

  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage agents, administrators, and permissions</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddAgent} style={{ gap: 6 }}>
          <Plus size={16} /> Add Agent
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, padding: '0 4px' }}>
        {employees.map(emp => {
          const isActive = emp.status === 'active';
          return (
            <div 
              key={emp.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                gap: 16, 
                alignItems: 'flex-start', 
                padding: 20,
                opacity: isActive ? 1 : 0.65,
                transition: 'opacity 0.2s ease',
                position: 'relative'
              }}
            >
              <AgentBadge employee={emp} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-fg)' }}>
                      {emp.name}
                    </h3>
                    <span 
                      className="badge" 
                      style={{ 
                        fontSize: 10, 
                        padding: '1px 6px',
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: isActive ? '#10b981' : '#ef4444',
                        border: 'none',
                        fontWeight: 600
                      }}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {emp.role === 'admin' ? (
                    <span title="Administrator" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>
                      <Shield size={14} /> Admin
                    </span>
                  ) : (
                    <span title="Sales Agent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-muted-fg)' }}>
                      <UserCog size={14} /> Agent
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {emp.email || 'No email provided'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontFamily: 'var(--font-mono)' }}>
                  {emp.phone || 'No phone provided'}
                </div>
                
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button 
                    type="button"
                    className="btn btn-ghost" 
                    style={{ padding: '4px 10px', height: 28, fontSize: 12, gap: 4 }}
                    onClick={() => handleEditAgent(emp)}
                    title="Edit agent details"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button 
                    type="button"
                    className="btn btn-ghost" 
                    style={{ 
                      padding: '4px 10px', 
                      height: 28, 
                      fontSize: 12, 
                      color: isActive ? 'var(--color-destructive, #ef4444)' : 'var(--color-success, #10b981)',
                      gap: 4
                    }}
                    onClick={() => handleToggleStatus(emp)}
                    title={isActive ? 'Deactivate agent' : 'Activate agent'}
                  >
                    {isActive ? (
                      <>
                        <XCircle size={13} /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
}
