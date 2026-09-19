import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { IndianRupee, FileText } from 'lucide-react';
import { useDealStore } from '../store/dealStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { usePropertyStore } from '../store/propertyStore';
import { formatINR } from '../utils/formatters';

export function Deals() {
  const { deals, updateDealStatus } = useDealStore();
  const { getLead } = useLeadStore();
  const { getEmployee } = useEmployeeStore();
  const { getProperty } = usePropertyStore();

  const totalBrokerage = deals.reduce((acc, deal) => acc + deal.brokerageAmount, 0);

  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Deals & Finance</h1>
          <p className="page-subtitle">Track closed deals and commission payouts</p>
        </div>
        
        <div style={{ background: 'var(--color-success)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--border-radius-md)', fontWeight: 'bold' }}>
          Total Revenue: ₹{totalBrokerage.toFixed(2)}L
        </div>
      </div>
      
      {deals.length === 0 ? (
        <div className="card h-[calc(100%-100px)] flex">
          <EmptyState 
            icon={IndianRupee}
            title="No Deals Yet"
            description="Move a lead to the 'Booked / Won' stage to log a deal."
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Agent</th>
                  <th>Deal Value</th>
                  <th>Brokerage (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => {
                  const lead = getLead(deal.leadId);
                  const agent = getEmployee(deal.agentId);
                  const property = getProperty(deal.propertyId);
                  
                  return (
                    <tr key={deal.id}>
                      <td>{new Date(deal.closedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 600 }}>{lead?.name || 'Unknown'}</td>
                      <td>{property?.name || 'Unknown Property'}</td>
                      <td>{agent?.name || 'Unassigned'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatINR(deal.totalDealValueLakhs)}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>₹{deal.brokerageAmount.toFixed(2)}L</td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: deal.status === 'paid' ? 'var(--color-success)' : deal.status === 'invoiced' ? 'var(--color-primary)' : 'var(--color-warning)',
                          color: deal.status === 'warning' ? '#000' : '#fff', border: 'none'
                        }}>
                          {deal.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="form-select" 
                          style={{ padding: '2px 8px', fontSize: 12, height: 'auto' }}
                          value={deal.status}
                          onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                        >
                          <option value="pending_invoice">Pending Invoice</option>
                          <option value="invoiced">Invoiced</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
