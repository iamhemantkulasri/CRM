import React from 'react';
import { PropertyShareModal } from './PropertyShareModal';

/**
 * ShareBrochure Component (Phase 6 deliverable: src/components/ShareBrochure.jsx)
 * Enables instant WhatsApp property brochure pitch sharing and PDF catalog download.
 */
export function ShareBrochure({ property, isOpen, onClose }) {
  return (
    <PropertyShareModal 
      property={property} 
      isOpen={isOpen} 
      onClose={onClose} 
    />
  );
}

export default ShareBrochure;
