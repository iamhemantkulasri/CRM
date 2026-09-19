import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, User, MapPin, Tag } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useActivityStore } from '../store/activityStore';
import { SOURCES, PRIORITIES } from '../utils/constants';

export function LeadModal({ isOpen, onClose, leadToEdit = null }) {
  const { addLead, updateLead } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { getActiveAgents } = useEmployeeStore();
  const { logActivity } = useActivityStore();
  const agents = getActiveAgents();

  const isEditMode = Boolean(leadToEdit);

  const initialFormState = {
    name: '',
    phone: '',
    email: '',
    source: 'instagram',
    priority: 'warm',
    assignedTo: currentUser?.id || '',
    note: '',
    requirements: {
      propertyType: 'apartment',
      bhk: '',
      budgetMinLakhs: '',
      budgetMaxLakhs: '',
      preferredLocalities: '',
      possessionStatus: 'Any'
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editing an existing lead or creating new
  useEffect(() => {
    if (leadToEdit) {
      const firstNoteText = Array.isArray(leadToEdit.notes) && leadToEdit.notes.length > 0
        ? leadToEdit.notes[0]?.text || ''
        : '';

      const localitiesStr = Array.isArray(leadToEdit.requirements?.preferredLocalities)
        ? leadToEdit.requirements.preferredLocalities.join(', ')
        : (leadToEdit.requirements?.preferredLocalities || '');

      setFormData({
        name: leadToEdit.name || '',
        phone: leadToEdit.phone || '',
        email: leadToEdit.email || '',
        source: leadToEdit.source || 'instagram',
        priority: leadToEdit.priority || 'warm',
        assignedTo: leadToEdit.assignedTo || '',
        note: firstNoteText,
        requirements: {
          propertyType: leadToEdit.requirements?.propertyType || 'apartment',
          bhk: leadToEdit.requirements?.bhk || '',
          budgetMinLakhs: leadToEdit.requirements?.budgetMinLakhs ?? '',
          budgetMaxLakhs: leadToEdit.requirements?.budgetMaxLakhs ?? '',
          preferredLocalities: localitiesStr,
          possessionStatus: leadToEdit.requirements?.possessionStatus || 'Any'
        }
      });
    } else {
      setFormData({
        ...initialFormState,
        assignedTo: currentUser?.id || ''
      });
    }
  }, [leadToEdit, isOpen, currentUser]);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const localities = formData.requirements.preferredLocalities
      ? formData.requirements.preferredLocalities
          .split(',')
          .map(loc => loc.trim())
          .filter(loc => loc.length > 0)
      : [];

    const constructedRequirements = {
      ...formData.requirements,
      preferredLocalities: localities,
      budgetMinLakhs: Number(formData.requirements.budgetMinLakhs) || 0,
      budgetMaxLakhs: Number(formData.requirements.budgetMaxLakhs) || 0,
    };

    try {
      if (isEditMode && leadToEdit?.id) {
        // Prepare notes array
        let updatedNotes = Array.isArray(leadToEdit.notes) ? [...leadToEdit.notes] : [];
        if (formData.note && formData.note.trim()) {
          if (updatedNotes.length > 0) {
            updatedNotes[0] = {
              ...updatedNotes[0],
              text: formData.note.trim(),
              timestamp: new Date().toISOString()
            };
          } else {
            updatedNotes.push({
              id: `note_${Date.now()}`,
              text: formData.note.trim(),
              addedBy: currentUser?.id || 'admin',
              timestamp: new Date().toISOString()
            });
          }
        }

        await updateLead(leadToEdit.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          source: formData.source,
          priority: formData.priority,
          assignedTo: formData.assignedTo || null,
          requirements: constructedRequirements,
          notes: updatedNotes
        });

        logActivity(
          leadToEdit.id,
          'LEAD_UPDATED',
          `Lead details updated for ${formData.name}`,
          currentUser?.id || 'system'
        );
      } else {
        // Create new lead
        const initialNotes = formData.note && formData.note.trim() ? [{
          id: `note_${Date.now()}`,
          text: formData.note.trim(),
          addedBy: currentUser?.id || 'admin',
          timestamp: new Date().toISOString()
        }] : [];

        const newLeadPayload = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          source: formData.source,
          priority: formData.priority,
          assignedTo: formData.assignedTo || null,
          stage: 'new',
          requirements: constructedRequirements,
          notes: initialNotes
        };

        const savedLead = await addLead(newLeadPayload);

        if (savedLead?.id) {
          logActivity(
            savedLead.id,
            'LEAD_CREATED',
            `New lead created via ${formData.source.toUpperCase()} for ${formData.name}`,
            currentUser?.id || 'system'
          );
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content outline-none" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
          
          <div className="modal-header">
            <div>
              <Dialog.Title className="modal-title">
                {isEditMode ? 'Edit Lead Details' : 'Add New Lead'}
              </Dialog.Title>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                {isEditMode ? `Update details & notes for ${leadToEdit?.name}` : 'Record a new buyer inquiry or walk-in client'}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Contact Info */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Contact Details
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="e.g. Rahul Sharma" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              </div>

              <div className="form-row cols-3">
                <div className="form-group">
                  <label className="form-label">Source *</label>
                  <select name="source" value={formData.source} onChange={handleChange} className="form-select">
                    {SOURCES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="form-select">
                    <option value="">⚠️ Unassigned</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label className="form-label">Email (Optional)</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="e.g. client@email.com" 
                  />
                </div>
              </div>
            </div>

            {/* Note of Lead (Address, Referral source, Memory notes) */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> Note / Address / Referral Context
              </h3>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Notes (Who sent, Client address, Special remarks)</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Saved to lead memory</span>
                </label>
                <textarea 
                  name="note" 
                  rows={3} 
                  value={formData.note} 
                  onChange={handleChange} 
                  className="form-input" 
                  style={{ resize: 'vertical', lineHeight: 1.5 }}
                  placeholder="e.g. Sent by Sharma ji from Lajpat Nagar / Address: C-42 South Ext / Interested in corner unit facing green park" 
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} /> Property Requirements
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select name="propertyType" value={formData.requirements.propertyType} onChange={(e) => handleChange(e, 'requirements')} className="form-select">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="builder_floor">Builder Floor</option>
                    <option value="plot">Plot / Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">BHK</label>
                  <select name="bhk" value={formData.requirements.bhk} onChange={(e) => handleChange(e, 'requirements')} className="form-select">
                    <option value="">Any BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4+ BHK">4+ BHK</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Min Budget (Lakhs)</label>
                  <input type="number" name="budgetMinLakhs" value={formData.requirements.budgetMinLakhs} onChange={(e) => handleChange(e, 'requirements')} className="form-input" placeholder="e.g. 50" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Budget (Lakhs)</label>
                  <input type="number" name="budgetMaxLakhs" value={formData.requirements.budgetMaxLakhs} onChange={(e) => handleChange(e, 'requirements')} className="form-input" placeholder="e.g. 150" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Localities (comma separated)</label>
                <input type="text" name="preferredLocalities" value={formData.requirements.preferredLocalities} onChange={(e) => handleChange(e, 'requirements')} className="form-input" placeholder="e.g. Lodhi Colony, Defence Colony, Greater Kailash" />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 8 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Lead...' : (isEditMode ? 'Update Lead' : 'Create Lead')}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
