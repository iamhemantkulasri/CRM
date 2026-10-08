import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, Search, Plus, Phone, Mail, 
  MapPin, Percent, FileText, ExternalLink, Edit2, 
  Trash2, ShieldCheck, Briefcase, ChevronRight, LayoutGrid, List, Home, X
} from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';
import { usePropertyStore } from '../store/propertyStore';
import { toApprovalUpdate } from '../store/partnerAdmin.js';
import { BuilderSellerModal } from '../components/BuilderSellerModal';
import { formatINR } from '../utils/formatters';
import { Link } from 'react-router-dom';

export function BuildersSellers() {
  const { builders, fetchBuilders, deleteBuilder, isLoading } = useBuilderStore();
  const { properties, updateProperty } = usePropertyStore();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'builder' | 'individual_seller' | 'investor' | 'channel_partner' | 'approvals'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [builderToEdit, setBuilderToEdit] = useState(null);
  const [selectedBuilderForInventory, setSelectedBuilderForInventory] = useState(null);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  // Compute linked property inventory count for each builder
  const builderInventoryMap = useMemo(() => {
    const map = {};
    (properties || []).forEach(prop => {
      // Check builder_id match or builder name match
      if (prop.builder_id) {
        map[prop.builder_id] = (map[prop.builder_id] || 0) + 1;
      }
      if (prop.builder) {
        const normalized = prop.builder.trim().toLowerCase();
        map[normalized] = (map[normalized] || 0) + 1;
      }
    });
    return map;
  }, [properties]);

  // Filter builders
  const filteredBuilders = useMemo(() => {
    return (builders || []).filter(item => {
      if (activeTab !== 'all' && item.type !== activeTab) return false;
      if (selectedCity !== 'all' && item.city !== selectedCity) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesContact = item.contact_person?.toLowerCase().includes(q);
        const matchesPhone = item.phone?.includes(q);
        const matchesRera = item.rera_reg_no?.toLowerCase().includes(q);
        const matchesLocality = item.locality?.toLowerCase().includes(q);
        return matchesName || matchesContact || matchesPhone || matchesRera || matchesLocality;
      }
      return true;
    });
  }, [builders, activeTab, selectedCity, searchQuery]);

  // Quick stats
  const totalBuilders = (builders || []).filter(b => b.type === 'builder').length;
  const totalIndividualSellers = (builders || []).filter(b => b.type === 'individual_seller').length;
  const reraRegistered = (builders || []).filter(b => b.rera_reg_no && b.rera_reg_no.trim() !== '').length;

  const handleEdit = (builder) => {
    setBuilderToEdit(builder);
    setIsModalOpen(true);
  };

  const handleDelete = (builder) => {
    if (window.confirm(`Are you sure you want to permanently delete profile "${builder.name}"?`)) {
      deleteBuilder(builder.id);
    }
  };

  // Get properties linked to the currently selected builder
  const linkedProperties = useMemo(() => {
    if (!selectedBuilderForInventory) return [];
    return (properties || []).filter(prop => 
      prop.builder_id === selectedBuilderForInventory.id || 
      (prop.builder && prop.builder.trim().toLowerCase() === selectedBuilderForInventory.name.trim().toLowerCase())
    );
  }, [selectedBuilderForInventory, properties]);

  // ── Approvals inbox (folded in from the retired Partners page) ──
  const pendingApprovals = useMemo(
    () => (properties || []).filter(p => p.approval_status === 'pending'),
    [properties]
  );
  const partnerNameById = useMemo(() => {
    const m = {};
    (builders || []).forEach(b => { m[b.id] = b.name; });
    return m;
  }, [builders]);
  const [commissions, setCommissions] = useState({});
  const [websiteFlags, setWebsiteFlags] = useState({});
  const [reasons, setReasons] = useState({});
  const [rejectError, setRejectError] = useState('');

  const handleApprove = async (row) => {
    await updateProperty(row.id, toApprovalUpdate({
      commission_pct: commissions[row.id] ?? null,
      show_on_website: websiteFlags[row.id] ?? false,
    }));
  };

  const handleReject = async (row) => {
    if (!String(reasons[row.id] ?? '').trim()) {
      setRejectError('Rejection reason required');
      return;
    }
    setRejectError('');
    await updateProperty(row.id, toApprovalUpdate({ decision: 'rejected', reason: reasons[row.id] ?? '' }));
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={24} style={{ color: 'var(--color-primary)' }} />
            <span>Builders & Sellers</span>
          </h1>
          <p className="page-subtitle">
            Manage developers, individual sellers, investor partnerships & property inventory
          </p>
        </div>

        <div className="page-actions">
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--color-muted)', padding: '4px', borderRadius: 'var(--border-radius-md)' }}>
            <button 
              className="btn btn-sm btn-ghost"
              style={viewMode === 'grid' ? { background: 'var(--color-card)', boxShadow: 'var(--shadow-sm)' } : {}}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className="btn btn-sm btn-ghost"
              style={viewMode === 'table' ? { background: 'var(--color-card)', boxShadow: 'var(--shadow-sm)' } : {}}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setBuilderToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> Add Builder / Seller
          </button>
        </div>
      </div>

      {/* Metric Counters Banner */}
      {/* Metric Counters Banner */}
      <div className="builders-stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 12, 
        marginBottom: 16 
      }}>
        <div className="stat-card" style={{ padding: '12px 16px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontWeight: 600 }}>Total Profiles</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{builders.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '12px 16px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontWeight: 600 }}>🏢 Builders / Developers</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4 }}>{totalBuilders}</div>
        </div>
        <div className="stat-card" style={{ padding: '12px 16px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontWeight: 600 }}>👤 Individual Sellers</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6', marginTop: 4 }}>{totalIndividualSellers}</div>
        </div>
        <div className="stat-card" style={{ padding: '12px 16px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', fontWeight: 600 }}>🛡️ RERA Registered</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{reraRegistered}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="builders-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Category Tabs */}
        <div className="builders-tabs-row no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: 'All Profiles' },
            { id: 'builder', label: '🏢 Builders' },
            { id: 'individual_seller', label: '👤 Individual Sellers' },
            { id: 'investor', label: '💼 Investors' },
            { id: 'channel_partner', label: '🤝 Channel Partners' },
            { id: 'approvals', label: `✅ Approvals (${pendingApprovals.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & City Filter */}
        <div className="builders-search-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: 260 }}>
          <div className="search-bar" style={{ maxWidth: 260, margin: 0, flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, phone, RERA..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="form-select"
            style={{ height: 34, fontSize: 12, width: 130 }}
          >
            <option value="all">All Cities</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="South Delhi">South Delhi</option>
            <option value="Gurugram">Gurugram</option>
            <option value="Noida">Noida</option>
            <option value="Faridabad">Faridabad</option>
          </select>
        </div>
      </div>

      {/* Content View */}
      {activeTab === 'approvals' ? (
        <div className="table-container">
          {rejectError && (
            <div style={{ padding: '8px 16px', color: '#ef4444', fontSize: 13 }}>{rejectError}</div>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Partner</th>
                <th>Price (₹L)</th>
                <th>City / Sector</th>
                <th>Commission %</th>
                <th>Website</th>
                <th>Reject reason</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name || row.title}</td>
                  <td style={{ fontSize: 12 }}>{(row.builder_id && partnerNameById[row.builder_id]) || row.builder || '—'}</td>
                  <td>{row.priceLakhs ?? row.price_lakhs}</td>
                  <td>{[row.city ?? row.location_city, row.locality ?? row.location_sector].filter(Boolean).join(' / ')}</td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80, height: 30 }}
                      value={commissions[row.id] ?? ''}
                      onChange={(e) => setCommissions((c) => ({ ...c, [row.id]: e.target.value }))}
                      placeholder="%"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={websiteFlags[row.id] ?? false}
                      onChange={(e) => setWebsiteFlags((f) => ({ ...f, [row.id]: e.target.checked }))}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: 160, height: 30 }}
                      value={reasons[row.id] ?? ''}
                      onChange={(e) => setReasons((r) => ({ ...r, [row.id]: e.target.value }))}
                      placeholder="Rejection reason"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleApprove(row)}>Approve</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={() => handleReject(row)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingApprovals.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
              No pending partner listings.
            </div>
          )}
        </div>
      ) : filteredBuilders.length === 0 ? (
        <div style={{ 
          padding: 48, 
          textAlign: 'center', 
          background: 'var(--color-card)', 
          border: '1px dashed var(--color-border)', 
          borderRadius: 12 
        }}>
          <Building2 size={40} style={{ margin: '0 auto 12px', color: 'var(--color-muted-fg)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>No builders or sellers found</h3>
          <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', margin: '0 0 16px' }}>
            Register your first developer or individual seller profile to manage commissions and property inventory.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setBuilderToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Builder / Seller
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 16 
        }}>
          {filteredBuilders.map(item => {
            const linkedCount = builderInventoryMap[item.id] || builderInventoryMap[item.name.trim().toLowerCase()] || 0;
            const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            return (
              <div 
                key={item.id}
                className="drawer-card"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: item.type === 'builder' ? 'rgba(37,99,235,0.1)' : 'rgba(139,92,246,0.1)',
                        color: item.type === 'builder' ? 'var(--color-primary)' : '#8b5cf6'
                      }}>
                        {item.type === 'builder' ? '🏢 Developer' : item.type === 'individual_seller' ? '👤 Seller' : item.type === 'channel_partner' ? '🤝 Channel Partner' : '💼 Investor'}
                      </span>
                      {item.auth_user_id && (
                        <span
                          title="Portal login enabled"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: 'rgba(16,185,129,0.12)',
                            color: '#059669'
                          }}
                        >
                          🔑 login
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-fg)' }}>
                      {item.name}
                    </h3>
                    {item.contact_person && (
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                        Contact: <strong>{item.contact_person}</strong>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button 
                      className="btn-icon" 
                      style={{ padding: 6, color: 'var(--color-muted-fg)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Edit Profile"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="btn-icon" 
                      style={{ padding: 6, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Delete Profile"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Key Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--color-muted-fg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-fg)', fontWeight: 600 }}>{item.phone}</span>
                  </div>

                  {item.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} />
                      <span className="truncate">{item.email}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} />
                    <span>
                      {item.locality ? <strong style={{ color: 'var(--color-fg)' }}>{item.locality}</strong> : null}
                      {item.locality && item.city ? `, ${item.city}` : (item.city || 'Delhi NCR')}
                      {item.office_address ? ` · ${item.office_address}` : ''}
                    </span>
                  </div>

                  {item.rera_reg_no && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={13} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-fg)' }}>RERA: {item.rera_reg_no}</span>
                    </div>
                  )}
                </div>

                {/* Inventory Link Badge */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted-fg)' }}>
                    <Building2 size={14} />
                    <span>Portfolio Status</span>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-ghost"
                    style={{ height: 26, fontSize: 11, padding: '0 8px', gap: 4 }}
                    onClick={() => setSelectedBuilderForInventory(item)}
                  >
                    <Home size={12} />
                    <span>{linkedCount} Properties</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                {/* Notes if present */}
                {item.notes && (
                  <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', background: 'var(--color-muted)', padding: '6px 10px', borderRadius: 6, fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{item.notes}"
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${item.contact_person || item.name}, this is regarding properties and client bookings from TGV Estates.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, height: 32, fontSize: 12, textDecoration: 'none', justifyContent: 'center' }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${item.phone}`}
                    className="btn btn-primary"
                    style={{ flex: 1, height: 32, fontSize: 12, textDecoration: 'none', justifyContent: 'center' }}
                  >
                    Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company / Seller Name</th>
                <th>Category</th>
                <th>Contact Details</th>
                <th>City & Locality</th>
                <th>Locality / Area</th>
                <th>Linked Inventory</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuilders.map(item => {
                const linkedCount = builderInventoryMap[item.id] || builderInventoryMap[item.name.trim().toLowerCase()] || 0;
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{item.name}</span>
                        {item.auth_user_id && (
                          <span
                            title="Portal login enabled"
                            style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', color: '#059669' }}
                          >
                            🔑 login
                          </span>
                        )}
                      </div>
                      {item.contact_person && (
                        <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>POC: {item.contact_person}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{item.phone}</div>
                      {item.email && <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>{item.email}</div>}
                    </td>
                    <td>
                      <div>{item.city}</div>
                      {item.rera_reg_no && <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>🛡️ RERA: {item.rera_reg_no}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: item.locality ? 'var(--color-fg)' : 'var(--color-muted-fg)' }}>
                        {item.locality || '—'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ height: 26, fontSize: 12, gap: 4 }}
                        onClick={() => setSelectedBuilderForInventory(item)}
                      >
                        <Home size={12} /> {linkedCount} listings
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ height: 28, fontSize: 12 }}
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ height: 28, fontSize: 12, color: '#ef4444' }}
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Linked Properties Drawer / Inspection Modal */}
      {selectedBuilderForInventory && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedBuilderForInventory(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--color-bg)',
              height: '100%',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  {selectedBuilderForInventory.name}
                </h2>
                <span style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>
                  Linked Properties & Units ({linkedProperties.length})
                </span>
              </div>
              <button 
                className="btn btn-ghost btn-icon"
                onClick={() => setSelectedBuilderForInventory(null)}
              >
                <X size={18} />
              </button>
            </div>

            {linkedProperties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted-fg)' }}>
                <Home size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 13 }}>No active inventory linked to this builder yet.</p>
                <Link to="/app/properties" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Go to Properties & Assign
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {linkedProperties.map(prop => (
                  <div 
                    key={prop.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-card)',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center'
                    }}
                  >
                    <img 
                      src={prop.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200'} 
                      alt={prop.name}
                      style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }} className="truncate">
                        {prop.name}
                      </h4>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                        {prop.locality}, {prop.city} · {prop.bhk || prop.configuration}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        {formatINR(prop.priceLakhs)}
                      </div>
                    </div>
                    <Link to={`/app/properties/${prop.id}`} className="btn btn-ghost btn-icon" title="View Property">
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Profile Modal */}
      <BuilderSellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        builderToEdit={builderToEdit}
      />
    </div>
  );
}
