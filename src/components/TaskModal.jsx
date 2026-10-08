import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckSquare, Calendar, User, AlertCircle, FileText, Phone, Building } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';

export function TaskModal({ isOpen, onClose, defaultLeadId = null }) {
  const { addTask } = useTaskStore();
  const { employees } = useEmployeeStore();
  const { leads } = useLeadStore();
  const { currentUser } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('call');
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || 'emp_admin');
  const [leadId, setLeadId] = useState(defaultLeadId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      type,
      assignedTo,
      leadId: leadId || null
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={18} />
              </div>
              <Dialog.Title className="text-h2" style={{ margin: 0, fontSize: 16 }}>Create New Task</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                Task Title *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Call client for site visit confirmation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                Description / Notes
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Specific instructions or discussion points..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                  Task Type
                </label>
                <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="call">📞 Phone Call</option>
                  <option value="visit">🏡 Site Visit</option>
                  <option value="document">📑 Document / Cost Sheet</option>
                  <option value="general">📋 General Follow-up</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                  Priority
                </label>
                <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🔵 Low Priority</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                  Assign To Agent
                </label>
                <select className="form-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 4 }}>
                Related Lead (Optional)
              </label>
              <select className="form-input" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
                <option value="">-- No specific lead linked --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} ({lead.phone})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Task</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
