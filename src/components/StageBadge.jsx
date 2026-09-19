import React from 'react';
import { clsx } from 'clsx';
import { STAGES } from '../utils/constants';

export function StageBadge({ stageId, className }) {
  const stage = STAGES.find(s => s.id === stageId);
  
  if (!stage) return null;

  return (
    <div 
      className={clsx('badge', className)}
      style={{ 
        backgroundColor: `var(--stage-${stageId})`,
        color: '#FFFFFF'
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50" style={{ marginRight: '4px' }}></span>
      {stage.label}
    </div>
  );
}
