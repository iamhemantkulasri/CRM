import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Building2, User, Phone, Mail, MapPin, ShieldCheck, FileText, Briefcase } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';

const BUILDER_TYPES = [
  { id: 'builder', label: '🏢 Builder / Developer' },
  { id: 'individual_seller', label: '👤 Individual Seller / Landowner' },
  { id: 'investor', label: '💼 Institutional Investor / Fund' },
  { id: 'landlord', label: '🏠 Landlord (Leasing Portfolio)' },
];

export function BuilderSellerModal({ isOpen, onClose, builderToEdit = null }) {
  const { addBuilder, updateBuilder } = useBuilderStore();
  const isEditMode = Boolean(builderToEdit);

  const initialFormState = {
    type: 'builder',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    city: 'Delhi NCR',
    locality: '',
    office_address: '',
    rera_reg_no: '',
    status: 'active',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (builderToEdit) {
      setFormData({
        type: builderToEdit.type || 'builder',
        name: builderToEdit.name || '',
        contact_person: builderToEdit.contact_person || '',
        phone: builderToEdit.phone || '',
        email: builderToEdit.email || '',
        city: builderToEdit.city || 'Delhi NCR',
        locality: builderToEdit.locality || '',
        office_address: builderToEdit.office_address || '',
        rera_reg_no: builderToEdit.rera_reg_no || '',
        status: builderToEdit.status || 'active',
        notes: builderToEdit.notes || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [builderToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && builderToEdit?.id) {
        await updateBuilder(builderToEdit.id, formData);
      } else {
        await addBuilder(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving builder/seller:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content 
          className="modal-content outline-none" 
          style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <Dialog.Title className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
                <span>{isEditMode ? 'Edit Builder / Seller Profile' : 'Register Builder or Seller'}</span>
              </Dialog.Title>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                {isEditMode ? `Update details for ${builderToEdit?.name}` : 'Record promoter or property seller details, contact numbers & RERA registration'}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Entity Classification */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={14} /> Entity Classification
              </h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category *</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    {BUILDER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Account Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="active">Active (Currently Transacting)</option>
                    <option value="inactive">Inactive / On Hold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile & Contact Details */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Profile & Direct Contacts
              </h3>
              
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">
                    {formData.type === 'builder' ? 'Developer / Company Name *' : 'Seller / Owner Name *'}
                  </label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder={formData.type === 'builder' ? 'e.g. DLF Limited, Godrej Properties' : 'e.g. Rajesh Khurana'} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Contact Person</label>
                  <input 
                    type="text" 
                    name="contact_person" 
                    value={formData.contact_person} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="e.g. Amit Singhal (Sales VP)" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp Number *</label>
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
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="sales@developer.com" 
                  />
                </div>
              </div>

              {/* City & Locality */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Operating City</label>
                  <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Noida">Noida / Greater Noida</option>
                    <option value="Faridabad">Faridabad</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Locality / Area *</label>
                  <input 
                    type="text" 
                    name="locality" 
                    value={formData.locality} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="e.g. Golf Course Road, Sector 42, Greater Kailash" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Office / Site Address</label>
                <input 
                  type="text" 
                  name="office_address" 
                  value={formData.office_address} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="e.g. DLF CyberCity, Tower B, 8th Floor, Gurugram" 
                />
              </div>
            </div>

            {/* RERA & Compliance */}
            <div className="form-section">
              <h3 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} /> RERA & Legal Registration
              </h3>

              <div className="form-group">
                <label className="form-label">Promoter / Project RERA Reg. No.</label>
                <input 
                  type="text" 
                  name="rera_reg_no" 
                  value={formData.rera_reg_no} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="e.g. HRERA-PKL-GGM-1248-2024 / DLRERA2024P0001" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Remarks</label>
                <textarea 
                  name="notes" 
                  rows={3} 
                  value={formData.notes} 
                  onChange={handleChange} 
                  className="form-input" 
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Direct promoter relationship, key POC for site visits: Mr. Verma (9811000000)." 
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 8 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Profile...' : (isEditMode ? 'Update Profile' : 'Register Builder / Seller')}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
