import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/supabase';

const AVATAR_PALETTES = [
  { bg: 'var(--agent-1-bg, #3b82f6)', fg: 'var(--agent-1-fg, #ffffff)', border: 'var(--agent-1-border, #2563eb)' },
  { bg: 'var(--agent-2-bg, #8b5cf6)', fg: 'var(--agent-2-fg, #ffffff)', border: 'var(--agent-2-border, #7c3aed)' },
  { bg: 'var(--agent-3-bg, #10b981)', fg: 'var(--agent-3-fg, #ffffff)', border: 'var(--agent-3-border, #059669)' },
  { bg: '#f59e0b', fg: '#ffffff', border: '#d97706' },
  { bg: '#ec4899', fg: '#ffffff', border: '#db2777' },
  { bg: '#06b6d4', fg: '#ffffff', border: '#0891b2' },
];

export function normalizeCrmEmployee(raw) {
  return {
    id: raw.id,
    name: raw.name || 'Unnamed Agent',
    email: raw.email || '',
    phone: raw.phone || '',
    role: raw.role || 'agent',
    avatarColor: raw.avatar_color || raw.avatarColor || 'var(--color-primary)',
    avatarText: raw.avatar_text || raw.avatarText || '#ffffff',
    avatarBorder: raw.avatar_border || raw.avatarBorder || '',
    status: raw.status || 'active',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString()
  };
}

const seedEmployees = [
  {
    id: 'emp_admin',
    name: 'Hemant Kulasari',
    email: 'hemant@tgvestates.com',
    phone: '+91 99001 10001',
    role: 'admin',
    avatarColor: 'var(--color-primary)',
    avatarText: '#ffffff',
    avatarBorder: 'var(--color-primary)',
    status: 'active'
  }
];

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: seedEmployees,
      isLoading: false,
      error: null,

      fetchEmployees: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching employees from Supabase:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data && data.length > 0) {
            set({ employees: data.map(normalizeCrmEmployee), isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error('Exception fetching employees:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      getEmployee: (id) => {
        if (!id) return null;
        return get().employees.find(e => e.id === id) || null;
      },

      getActiveAgents: () => {
        return get().employees.filter(e => e.status === 'active');
      },

      addEmployee: async (empData) => {
        const count = get().employees.length;
        const palette = AVATAR_PALETTES[count % AVATAR_PALETTES.length];
        const newId = `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

        const newEmp = {
          id: newId,
          name: empData.name.trim(),
          email: empData.email?.trim() || '',
          phone: empData.phone?.trim() || '',
          role: empData.role || 'agent',
          avatarColor: empData.role === 'admin' ? 'var(--color-primary)' : palette.bg,
          avatarText: '#ffffff',
          avatarBorder: empData.role === 'admin' ? 'var(--color-primary)' : palette.border,
          status: empData.status || 'active',
          createdAt: new Date().toISOString()
        };

        // Optimistic update
        set(state => ({ employees: [...state.employees, newEmp] }));

        try {
          const { data, error } = await supabase
            .from('employees')
            .insert({
              id: newEmp.id,
              name: newEmp.name,
              email: newEmp.email,
              phone: newEmp.phone,
              role: newEmp.role,
              avatar_color: newEmp.avatarColor,
              avatar_text: newEmp.avatarText,
              avatar_border: newEmp.avatarBorder,
              status: newEmp.status
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to sync new employee to Supabase:', error);
          } else if (data) {
            const saved = normalizeCrmEmployee(data);
            set(state => ({
              employees: state.employees.map(e => e.id === newEmp.id ? saved : e)
            }));
            return saved;
          }
        } catch (err) {
          console.error('Exception adding employee to Supabase:', err);
        }
        return newEmp;
      },

      updateEmployee: async (id, updates) => {
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
        }));

        try {
          const payload = {};
          if (updates.name !== undefined) payload.name = updates.name.trim();
          if (updates.email !== undefined) payload.email = updates.email.trim();
          if (updates.phone !== undefined) payload.phone = updates.phone.trim();
          if (updates.role !== undefined) payload.role = updates.role;
          if (updates.status !== undefined) payload.status = updates.status;
          payload.updated_at = new Date().toISOString();

          const { error } = await supabase.from('employees').update(payload).eq('id', id);
          if (error) {
            console.error('Failed to update employee in Supabase:', error);
          }
        } catch (err) {
          console.error('Exception updating employee:', err);
        }
      },

      toggleEmployeeStatus: async (id) => {
        const emp = get().employees.find(e => e.id === id);
        if (!emp) return;
        const newStatus = emp.status === 'active' ? 'inactive' : 'active';

        // Prevent deactivating the last active Admin
        if (emp.role === 'admin' && newStatus === 'inactive') {
          const activeAdmins = get().employees.filter(e => e.role === 'admin' && e.status === 'active' && e.id !== id);
          if (activeAdmins.length === 0) {
            alert('Cannot deactivate the sole active Admin account.');
            return;
          }
        }

        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, status: newStatus } : e)
        }));

        try {
          const { error } = await supabase
            .from('employees')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);

          if (error) {
            console.error('Failed to toggle employee status in Supabase:', error);
          }
        } catch (err) {
          console.error('Exception toggling employee status:', err);
        }
      }
    }),
    {
      name: 'tgv-employees-v2',
    }
  )
);
