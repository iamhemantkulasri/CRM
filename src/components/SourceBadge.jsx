import React from 'react';
import { clsx } from 'clsx';
import { SOURCES } from '../utils/constants';

export function SourceBadge({ sourceId, className }) {
  const source = SOURCES.find(s => s.id === sourceId);
  
  if (!source) return null;

  return (
    <div 
      className={clsx('badge', className)}
      style={{ 
        backgroundColor: `${source.color}15`, // 15% opacity background
        color: source.color,
        border: `1px solid ${source.color}30`
      }}
    >
      <span style={{ marginRight: '4px' }}>{source.icon}</span>
      {source.label}
    </div>
  );
}
