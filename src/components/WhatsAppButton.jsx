import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { COMPANY_NAME } from '../utils/constants';

const TEMPLATES = [
  { id: 'intro', label: 'Introduction', text: (lead) => `Hi ${lead.name}, I am reaching out from ${COMPANY_NAME}. I understand you are looking for a ${lead.requirements.bhk || 'property'} in ${lead.requirements.preferredLocalities?.[0] || 'your area'}. Can we schedule a quick call?` },
  { id: 'share', label: 'Share Property', text: (lead) => `Hi ${lead.name}, I have found a property that perfectly matches your requirement for a ${lead.requirements.bhk || 'home'}. Let me know if you are interested in a site visit.` },
  { id: 'visit', label: 'Visit Confirm', text: (lead) => `Hi ${lead.name}, this is to confirm our site visit scheduled for tomorrow. Our executive will meet you at the location.` },
  { id: 'followup', label: 'Follow Up', text: (lead) => `Hi ${lead.name}, just following up regarding your property search. Are you still looking?` },
];

export function WhatsAppButton({ lead, className, style }) {
  const [open, setOpen] = useState(false);

  const handleSend = (templateFn) => {
    const text = encodeURIComponent(templateFn(lead));
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Invisible overlay to close on click outside */}
      {open && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
          onClick={() => setOpen(false)}
        />
      )}
      
      <button 
        className={`btn btn-outline ${className || ''}`}
        style={{ width: '100%', borderColor: '#25D366', color: '#25D366', ...style }}
        onClick={() => setOpen(!open)}
      >
        <MessageCircle size={16} /> WhatsApp
      </button>

      <div 
        className="whatsapp-popover" 
        data-state={open ? "open" : "closed"}
      >
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSend(t.text)}
            className="template-btn"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
