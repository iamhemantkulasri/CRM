import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/supabase';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const seedTasks = [
  {
    id: 'task_1',
    title: 'Call Vikram Malhotra for Price Negotiation',
    description: 'Vikram requested ₹5L discount on 3 BHK at Prestige Lake View. Discuss builder flexibility.',
    leadId: 'lead_1',
    assignedTo: 'emp_rohan',
    dueDate: today.toISOString().split('T')[0],
    priority: 'high',
    status: 'pending',
    type: 'call',
    createdAt: yesterday.toISOString()
  },
  {
    id: 'task_2',
    title: 'Prepare Cost Sheet for Ananya Reddy',
    description: 'Include GST and stamp duty for Sarjapur Road 2 BHK.',
    leadId: 'lead_2',
    assignedTo: 'emp_priya',
    dueDate: today.toISOString().split('T')[0],
    priority: 'high',
    status: 'pending',
    type: 'document',
    createdAt: yesterday.toISOString()
  },
  {
    id: 'task_3',
    title: 'Site Visit Follow-up with Neha Sharma',
    description: 'Check if she liked the villa location and wants to view alternative corner plots.',
    leadId: 'lead_4',
    assignedTo: 'emp_amit',
    dueDate: tomorrow.toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
    type: 'visit',
    createdAt: today.toISOString()
  },
  {
    id: 'task_4',
    title: 'Send Bank Loan Checklist to Suresh Pillai',
    description: 'Provide list of approved banks for Bellandur project booking loan process.',
    leadId: 'lead_5',
    assignedTo: 'emp_rohan',
    dueDate: today.toISOString().split('T')[0],
    priority: 'medium',
    status: 'completed',
    type: 'document',
    createdAt: yesterday.toISOString()
  }
];

export function normalizeCrmTask(raw) {
  return {
    id: raw.id,
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    leadId: raw.lead_id || raw.leadId || null,
    assignedTo: raw.assigned_to || raw.assignedTo || 'emp_rohan',
    dueDate: raw.due_date || raw.dueDate || new Date().toISOString().split('T')[0],
    priority: raw.priority || 'medium',
    status: raw.status || 'pending',
    type: raw.type || 'general',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
  };
}

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: seedTasks,
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching tasks from Supabase:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data && data.length > 0) {
            const normalized = data.map(normalizeCrmTask);
            set({ tasks: normalized, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error('Failed to fetch tasks:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      getTasks: () => get().tasks,

      getPendingCount: () => get().tasks.filter(t => t.status === 'pending').length,

      getTasksByAgent: (agentId) => {
        return get().tasks.filter(t => t.assignedTo === agentId);
      },

      getTasksByLead: (leadId) => {
        return get().tasks.filter(t => t.leadId === leadId);
      },

      addTask: async (taskData) => {
        const newTask = {
          ...taskData,
          id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Optimistic local update
        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));

        // Persist to Supabase
        try {
          const { error } = await supabase.from('tasks').insert({
            id: newTask.id,
            title: newTask.title,
            description: newTask.description || '',
            lead_id: newTask.leadId || null,
            assigned_to: newTask.assignedTo || 'emp_rohan',
            due_date: newTask.dueDate || null,
            priority: newTask.priority || 'medium',
            status: 'pending',
            type: newTask.type || 'general'
          });
          if (error) {
            console.error('Failed to sync task to Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to sync task to Supabase:', err);
        }
      },

      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        }));

        try {
          const dbPayload = {};
          if (updates.title !== undefined) dbPayload.title = updates.title;
          if (updates.description !== undefined) dbPayload.description = updates.description;
          if (updates.leadId !== undefined) dbPayload.lead_id = updates.leadId;
          if (updates.assignedTo !== undefined) dbPayload.assigned_to = updates.assignedTo;
          if (updates.dueDate !== undefined) dbPayload.due_date = updates.dueDate;
          if (updates.priority !== undefined) dbPayload.priority = updates.priority;
          if (updates.status !== undefined) dbPayload.status = updates.status;
          if (updates.type !== undefined) dbPayload.type = updates.type;
          dbPayload.updated_at = new Date().toISOString();

          const { error } = await supabase.from('tasks').update(dbPayload).eq('id', id);
          if (error) {
            console.error('Failed to update task in Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to update task in Supabase:', err);
        }
      },

      toggleTaskStatus: async (id) => {
        const currentTask = get().tasks.find(t => t.id === id);
        if (!currentTask) return;
        const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';

        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, status: newStatus } : task
          )
        }));

        try {
          const { error } = await supabase.from('tasks').update({
            status: newStatus,
            updated_at: new Date().toISOString()
          }).eq('id', id);
          if (error) {
            console.error('Failed to toggle task status in Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to toggle task status in Supabase:', err);
        }
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));

        try {
          const { error } = await supabase.from('tasks').delete().eq('id', id);
          if (error) {
            console.error('Failed to delete task from Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to delete task from Supabase:', err);
        }
      }
    }),
    {
      name: 'propdesk-tasks'
    }
  )
);
