import React from 'react';
import { clsx } from 'clsx';
import { PRIORITIES } from '../utils/constants';

export function PriorityBadge({ priorityId, className }) {
  const priority = PRIORITIES.find(p => p.id === priorityId);
  
  if (!priority) return null;

  return (
    <div 
      className={clsx('badge', className)}
      style={{ 
        backgroundColor: priority.bgColor,
        color: priority.fgColor
      }}
      title={`${priority.label} Priority`}
    >
      <span style={{ marginRight: '2px' }}>{priority.emoji}</span>
      {priority.label}
    </div>
  );
}
