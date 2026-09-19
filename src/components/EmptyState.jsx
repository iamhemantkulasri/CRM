import React from 'react';
import { clsx } from 'clsx';

export function EmptyState({ title, description, icon: Icon, action, className }) {
  return (
    <div className={clsx('empty-state', className)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center', height: '100%' }}>
      {Icon && (
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--color-muted-fg)' }}>
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-h2" style={{ marginBottom: 8 }}>{title}</h3>
      {description && <p className="text-body" style={{ color: 'var(--color-muted-fg)', marginBottom: 24, maxWidth: 400 }}>{description}</p>}
      {action && (
        <div>
          {React.isValidElement(action) ? (
            action
          ) : action.label && action.onClick ? (
            <button type="button" className="btn btn-primary" onClick={action.onClick}>
              {action.label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
