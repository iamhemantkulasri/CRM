import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, User, Mail, Phone, Shield, UserPlus, CheckCircle2 } from 'lucide-react';
import { useEmployeeStore } from '../store/employeeStore';

export function AgentModal({ isOpen, onClose, employeeToEdit = null }) {
  const { addEmployee, updateEmployee } = useEmployeeStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('agent');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name || '');
      setEmail(employeeToEdit.email || '');
      setPhone(employeeToEdit.phone || '');
      setRole(employeeToEdit.role || 'agent');
      setStatus(employeeToEdit.status || 'active');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('agent');
      setStatus('active');
    }
  }, [employeeToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (employeeToEdit) {
        await updateEmployee(employeeToEdit.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          status
        });
      } else {
        await addEmployee({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          status
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 440 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={18} />
              </div>
              <div>
                <Dialog.Title className="text-h2" style={{ margin: 0, fontSize: 16 }}>
                  {employeeToEdit ? 'Edit Agent Profile' : 'Add New Agent'}
                </Dialog.Title>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                  {employeeToEdit ? 'Update details and permissions' : 'Add team member to CRM & lead routing'}
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <User size={13} /> Full Name *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@tgvestates.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Phone size={13} /> Phone Number *
              </label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Shield size={13} /> Role
                </label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ height: 38 }}
                >
                  <option value="agent">Sales Agent</option>
                  <option value="admin">Admin / Owner</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <CheckCircle2 size={13} /> Status
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ height: 38 }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Saving...' : employeeToEdit ? 'Save Changes' : 'Create Agent'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
