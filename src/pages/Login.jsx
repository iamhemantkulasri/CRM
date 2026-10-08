import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { AgentBadge } from '../components/AgentBadge';
import { Moon, Sun } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { HELPLINE_NUMBER, COMPANY_NAME } from '../utils/constants';
import './Login.css';

export function Login() {
  const { currentUser, login } = useAuthStore();
  const { employees } = useEmployeeStore();
  const { theme, toggleTheme } = useUiStore();

  // If already logged in, redirect to app
  if (currentUser) {
    return <Navigate to="/app/leads" replace />;
  }

  return (
    <div className="login-container">
      {/* Theme Toggle */}
      <button 
        className="btn btn-icon btn-ghost theme-toggle" 
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={toggleTheme}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="login-card glass-surface">
        <div className="login-header">
          <div className="login-logo-icon" style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold' }}>T</div>
          <h1 className="text-h1">Welcome to {COMPANY_NAME}</h1>
          <p className="text-body mt-2" style={{ color: 'var(--color-muted-fg)' }}>Internal Operating System & Admin Desk</p>
        </div>

        <div className="agent-grid">
          {employees.filter(e => e.status !== 'inactive').map(employee => (
            <button 
              key={employee.id} 
              className="agent-select-card card card-hoverable"
              onClick={() => login(employee)}
            >
              <AgentBadge employee={employee} size="xl" />
              <div className="agent-select-info">
                <div className="agent-name">{employee.name}</div>
                <div className={`badge ${employee.role === 'admin' ? 'badge-admin' : 'badge-agent'}`}>
                  {employee.role === 'admin' ? 'Admin / Owner' : 'Sales Agent'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="login-footer">
          <span style={{ color: 'var(--color-muted-fg)' }}>☎️ Company Helpline:</span>
          <span className="font-mono font-medium ml-2">{HELPLINE_NUMBER}</span>
        </div>
      </div>
    </div>
  );
}
