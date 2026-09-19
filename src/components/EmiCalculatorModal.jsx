import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calculator, Send, Copy, Check, Percent, Clock, IndianRupee, ShieldAlert, Sparkles } from 'lucide-react';
import { calculateEMI, formatEmiWhatsAppText } from '../utils/emiCalculator';
import { formatINR } from '../utils/formatters';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';

export function EmiCalculatorModal({
  isOpen,
  onClose,
  initialPriceLakhs = 85,
  propertyName = '',
  clientName = '',
  clientPhone = '',
  leadId = null
}) {
  const { currentUser } = useAuthStore();
  const [priceLakhs, setPriceLakhs] = useState(initialPriceLakhs || 85);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [copied, setCopied] = useState(false);

  // Sync if initialPriceLakhs changes
  React.useEffect(() => {
    if (initialPriceLakhs) {
      setPriceLakhs(initialPriceLakhs);
    }
  }, [initialPriceLakhs]);

  const downPaymentLakhs = Math.round((priceLakhs * (downPaymentPercent / 100)) * 10) / 10;
  const loanAmountLakhs = Math.max(0, priceLakhs - downPaymentLakhs);
  const loanAmountRupees = loanAmountLakhs * 100000;

  const result = useMemo(() => {
    return calculateEMI(loanAmountRupees, interestRate, tenureYears);
  }, [loanAmountRupees, interestRate, tenureYears]);

  const handleCopyEstimate = () => {
    const text = formatEmiWhatsAppText({
      clientName,
      propertyName,
      priceLakhs,
      downPaymentLakhs,
      loanAmountLakhs,
      rate: interestRate,
      tenureYears,
      emi: result.monthlyEMI
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const text = formatEmiWhatsAppText({
      clientName,
      propertyName,
      priceLakhs,
      downPaymentLakhs,
      loanAmountLakhs,
      rate: interestRate,
      tenureYears,
      emi: result.monthlyEMI
    });

    if (leadId) {
      useActivityStore.getState().logActivity(
        leadId,
        'WHATSAPP_SENT',
        `Sent EMI calculation estimate (~₹${result.monthlyEMI.toLocaleString('en-IN')}/mo) to ${clientName || 'lead'} via WhatsApp`,
        currentUser?.id || 'agent'
      );
    }

    const cleanPhone = (clientPhone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content
          className="modal-content"
          style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={20} />
              </div>
              <div>
                <Dialog.Title className="text-h2" style={{ margin: 0, fontSize: 17 }}>
                  Home Loan & EMI Calculator
                </Dialog.Title>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                  {propertyName ? `For: ${propertyName}` : 'Instant buyer loan affordability estimator'}
                </div>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
            {/* Property Price Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Property Value / Budget</label>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatINR(priceLakhs)}
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={500}
                step={5}
                value={priceLakhs}
                onChange={(e) => setPriceLakhs(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                <span>₹15 Lakhs</span>
                <span>₹2.5 Cr</span>
                <span>₹5.0 Cr</span>
              </div>
            </div>

            {/* Down Payment Percentage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Down Payment</label>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {downPaymentPercent}% ({formatINR(downPaymentLakhs)})
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[10, 15, 20, 25, 30].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1.5px solid ${downPaymentPercent === pct ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: downPaymentPercent === pct ? 'rgba(37,99,235,0.08)' : 'transparent',
                      color: downPaymentPercent === pct ? 'var(--color-primary)' : 'var(--color-fg)',
                      cursor: 'pointer'
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Amount Summary */}
            <div style={{ background: 'var(--color-muted)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--color-muted-fg)' }}>Eligible Loan Principal:</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{formatINR(loanAmountLakhs)}</span>
            </div>

            {/* Interest Rate & Tenure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 6 }}>
                  Interest Rate (% p.a.)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.1"
                    min="6"
                    max="16"
                    className="form-input"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ fontWeight: 600 }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)', display: 'block', marginBottom: 6 }}>
                  Tenure (Years)
                </label>
                <select
                  className="form-input"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  style={{ fontWeight: 600 }}
                >
                  {[10, 15, 20, 25, 30].map(yr => (
                    <option key={yr} value={yr}>{yr} Years ({yr * 12} mo)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 12,
              padding: 16
            }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estimated Monthly EMI
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', marginTop: 4 }}>
                  ₹{result.monthlyEMI.toLocaleString('en-IN')}
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-muted-fg)' }}> / month</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--color-muted-fg)' }}>Total Interest Payable:</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{formatINR(result.totalInterest / 100000)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-muted-fg)' }}>Total Amount (Principal + Int):</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{formatINR(result.totalAmount / 100000)}</div>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: 4, background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 6, color: '#92400e', fontSize: 11 }}>
                  💡 <strong>Agent Rule of Thumb:</strong> Buyer household monthly income should be at least <strong>₹{result.minIncomeRequired.toLocaleString('en-IN')}/mo</strong> for seamless bank approval (50% FOIR).
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCopyEstimate}
                style={{ flex: 1, gap: 6, justifyContent: 'center' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied Pitch!' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendWhatsApp}
                style={{ flex: 1.3, gap: 6, justifyContent: 'center', background: '#16a34a', borderColor: '#16a34a' }}
              >
                <Send size={14} />
                <span>Send WhatsApp Estimate</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
