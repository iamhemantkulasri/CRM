import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, IndianRupee, Building2, User, Percent, CheckCircle } from 'lucide-react';
import { useDealStore } from '../store/dealStore';
import { useLeadStore } from '../store/leadStore';
import { usePropertyStore } from '../store/propertyStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';

export function DealModal({ isOpen, onClose, defaultLeadId = null }) {
  const { addDeal } = useDealStore();
  const { leads } = useLeadStore();
  const { properties } = usePropertyStore();
  const { employees } = useEmployeeStore();
  const { currentUser } = useAuthStore();

  const [leadId, setLeadId] = useState(defaultLeadId || '');
  const [propertyId, setPropertyId] = useState('');
  const [agentId, setAgentId] = useState(currentUser?.id || 'emp_admin');
  const [totalDealValueLakhs, setTotalDealValueLakhs] = useState('');
  const [brokeragePercentage, setBrokeragePercentage] = useState('2');
  const [status, setStatus] = useState('pending_invoice');

  // If defaultLeadId is passed and leadId changes
  React.useEffect(() => {
    if (defaultLeadId) {
      setLeadId(defaultLeadId);
      const matchedLead = leads.find(l => l.id === defaultLeadId);
      if (matchedLead?.requirements?.budgetMaxLakhs) {
        setTotalDealValueLakhs(matchedLead.requirements.budgetMaxLakhs);
      } else if (matchedLead?.requirements?.budgetMinLakhs) {
        setTotalDealValueLakhs(matchedLead.requirements.budgetMinLakhs);
      }
      if (matchedLead?.propertyId) {
        setPropertyId(matchedLead.propertyId);
      }
    }
  }, [defaultLeadId, leads]);

  const selectedProperty = properties.find(p => p.id === propertyId);
  const calculatedBrokerage = (Number(totalDealValueLakhs || 0) * Number(brokeragePercentage || 0)) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leadId || !totalDealValueLakhs) return;

    addDeal({
      leadId,
      propertyId: propertyId || null,
      agentId: agentId || 'emp_admin',
      totalDealValueLakhs: Number(totalDealValueLakhs),
      brokeragePercentage: Number(brokeragePercentage),
      brokerageAmount: calculatedBrokerage,
      status,
      property: selectedProperty || null
    });

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <Dialog.Title className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IndianRupee size={20} style={{ color: 'var(--color-success)' }} />
              Log Closed Deal
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Client / Lead *</label>
              <select required className="form-select" value={leadId} onChange={e => setLeadId(e.target.value)}>
                <option value="">Select closed lead...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.phone}) - {l.stage}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Purchased Property</label>
              <select className="form-select" value={propertyId} onChange={e => setPropertyId(e.target.value)}>
                <option value="">Direct / Unlisted Mandate</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.locality} (₹{p.priceLakhs}L)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Deal Value (₹ Lakhs) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 125"
                  value={totalDealValueLakhs}
                  onChange={e => setTotalDealValueLakhs(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brokerage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="form-input"
                  value={brokeragePercentage}
                  onChange={e => setBrokeragePercentage(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-muted)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>Gross Brokerage:</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)' }}>
                ₹{calculatedBrokerage.toFixed(2)} Lakhs
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Closing Agent</label>
                <select className="form-select" value={agentId} onChange={e => setAgentId(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payout Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending_invoice">Pending Invoice</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
                <CheckCircle size={15} /> Save Deal Record
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
