import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Phone,
  Building,
  FileText,
  Trash2,
  User,
  AlertTriangle
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { TaskModal } from '../components/TaskModal';
import { LeadDrawer } from '../components/LeadDrawer';

export function Tasks() {
  const { tasks, toggleTaskStatus, deleteTask, fetchTasks } = useTaskStore();
  const { leads } = useLeadStore();
  const { employees } = useEmployeeStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'my' | 'pending' | 'completed'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Filter tasks
  let filtered = tasks.filter(task => {
    if (filterType === 'my' && currentUser) return task.assignedTo === currentUser.id;
    if (filterType === 'pending') return task.status === 'pending';
    if (filterType === 'completed') return task.status === 'completed';
    return true;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return <Phone size={14} style={{ color: '#2563eb' }} />;
      case 'visit': return <Building size={14} style={{ color: '#f59e0b' }} />;
      case 'document': return <FileText size={14} style={{ color: '#8b5cf6' }} />;
      default: return <CheckSquare size={14} style={{ color: '#10b981' }} />;
    }
  };

  return (
    <div className="page" style={{ height: '100%', overflowY: 'auto' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={22} style={{ color: 'var(--color-primary)' }} />
            Tasks & Follow-ups
          </h1>
          <p className="page-subtitle">Track agent daily activities, client callbacks, and deadlines</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsTaskModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${tasks.length})` },
            { id: 'my', label: 'My Tasks' },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: `1.5px solid ${filterType === tab.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: filterType === tab.id ? 'var(--color-primary)' : 'transparent',
                color: filterType === tab.id ? '#fff' : 'var(--color-muted-fg)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 240, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-muted-fg)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13, height: 34 }}
          />
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: 'var(--color-card)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, fontSize: 14 }}>No tasks found</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4 }}>
              You're completely caught up on your follow-up duties!
            </div>
          </div>
        ) : (
          filtered.map(task => {
            const isDone = task.status === 'completed';
            const agent = employees.find(e => e.id === task.assignedTo);
            const lead = leads.find(l => l.id === task.leadId);
            const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());

            return (
              <div
                key={task.id}
                style={{
                  background: 'var(--color-card)',
                  border: `1px solid ${isOverdue ? '#fca5a5' : 'var(--color-border)'}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s',
                  opacity: isDone ? 0.6 : 1
                }}
              >
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDone ? 'var(--color-success)' : 'var(--color-muted-fg)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isDone ? 'Mark Pending' : 'Mark Completed'}
                >
                  {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'var(--color-muted)',
                      color: 'var(--color-fg)'
                    }}>
                      {getTypeIcon(task.type)}
                      <span className="capitalize">{task.type}</span>
                    </span>

                    {task.priority === 'high' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 6 }}>
                        High Priority
                      </span>
                    )}

                    {isOverdue && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: 'rgba(220,38,38,0.15)', padding: '1px 6px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <AlertTriangle size={10} /> Overdue
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4 }}>
                      {task.description}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 11, color: 'var(--color-muted-fg)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> Due: {task.dueDate || 'No date'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> Assigned: {agent?.name || 'Agent'}
                    </span>
                    {lead && (
                      <span
                        onClick={() => setSelectedLead(lead)}
                        style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
                        title="Open lead drawer"
                      >
                        👤 Lead: {lead.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  style={{ color: '#ef4444', opacity: 0.7 }}
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      {/* Lead Drawer if linked lead is clicked */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}

export default Tasks;
