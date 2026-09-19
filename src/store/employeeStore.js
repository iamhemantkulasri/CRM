import { create } from 'zustand';

// Hardcoded seed data for employees
const seedEmployees = [
  {
    id: 'emp_admin',
    name: 'Rajan Mehta',
    email: 'rajan@propdesk.in',
    phone: '+919900110001',
    role: 'admin',
    avatarColor: 'var(--color-fg)',
    status: 'active'
  },
  {
    id: 'emp_rohan',
    name: 'Rohan Verma',
    email: 'rohan@propdesk.in',
    phone: '+919876543210',
    role: 'agent',
    avatarColor: 'var(--agent-1-bg)',
    avatarText: 'var(--agent-1-fg)',
    avatarBorder: 'var(--agent-1-border)',
    status: 'active'
  },
  {
    id: 'emp_priya',
    name: 'Priya Sharma',
    email: 'priya@propdesk.in',
    phone: '+919765432109',
    role: 'agent',
    avatarColor: 'var(--agent-2-bg)',
    avatarText: 'var(--agent-2-fg)',
    avatarBorder: 'var(--agent-2-border)',
    status: 'active'
  },
  {
    id: 'emp_amit',
    name: 'Amit Patel',
    email: 'amit@propdesk.in',
    phone: '+919654321098',
    role: 'agent',
    avatarColor: 'var(--agent-3-bg)',
    avatarText: 'var(--agent-3-fg)',
    avatarBorder: 'var(--agent-3-border)',
    status: 'active'
  }
];

export const useEmployeeStore = create((set, get) => ({
  employees: seedEmployees,

  getEmployee: (id) => {
    if (!id) return null;
    return get().employees.find(e => e.id === id) || null;
  },

  getActiveAgents: () => {
    return get().employees.filter(e => e.role === 'agent' && e.status === 'active');
  }
}));
