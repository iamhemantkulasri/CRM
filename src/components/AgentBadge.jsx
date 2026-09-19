import React from 'react';
import { clsx } from 'clsx';
import { getInitials } from '../utils/formatters';

export function AgentBadge({ employee, size = 'md', showName = false, className }) {
  if (!employee) {
    return (
      <div className={clsx('flex-center gap-2', className)}>
        <div 
          className={clsx('avatar', `avatar-${size}`)}
          style={{ 
            backgroundColor: 'var(--agent-unassigned-bg)',
            color: 'var(--agent-unassigned-fg)',
            border: '1px solid var(--agent-unassigned-border)'
          }}
          title="Unassigned"
        >
          ??
        </div>
        {showName && <span className="text-body-sm text-muted">Unassigned</span>}
      </div>
    );
  }

  return (
    <div className={clsx('flex-center gap-2', className)}>
      <div 
        className={clsx('avatar', `avatar-${size}`)}
        style={{ 
          backgroundColor: employee.avatarColor,
          color: employee.avatarText || '#FFFFFF',
          border: employee.avatarBorder ? `1px solid ${employee.avatarBorder}` : 'none'
        }}
        title={employee.name}
      >
        {getInitials(employee.name)}
      </div>
      {showName && <span className="text-body-sm font-medium">{employee.name}</span>}
    </div>
  );
}
