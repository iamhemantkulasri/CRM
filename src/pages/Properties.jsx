import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import {
  Building2,
  MapPin,
  Search,
  ExternalLink,
  Share2,
  Check,
  Eye,
  FileDown,
  Printer,
  X,
  PhoneCall,
  RotateCcw,
  Send,
  Sparkles,
  Lock,
  Globe,
  LayoutGrid,
  List
} from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { formatINR, formatArea } from '../utils/formatters';
import { PropertyModal } from '../components/PropertyModal';
import { PropertyShareModal } from '../components/PropertyShareModal';
import { CatalogModal } from '../components/CatalogModal';
import { ASSET_CATEGORIES, CITIES_BY_REGION } from '../utils/propertyTaxonomy';
import { printSingleProperty, printPropertyCatalog } from '../utils/propertyPdf';

const BUDGET_OPTIONS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'under_50', label: 'Under ₹50 L', min: 0, max: 50 },
  { id: '50_100', label: '₹50 L – ₹1 Cr', min: 50, max: 100 },
  { id: '100_200', label: '₹1 Cr – ₹2 Cr', min: 100, max: 200 },
  { id: '200_500', label: '₹2 Cr – ₹5 Cr', min: 200, max: 500 },
  { id: 'above_500', label: '₹5 Cr+', min: 500, max: 99999 }
];


export function Properties() {
  const navigate = useNavigate();
  const { properties } = usePropertyStore();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [sharingProperty, setSharingProperty] = useState(null);

  // Search and client call filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedConfig, setSelectedConfig] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(new Set());
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'luxury' | 'normal' | 'unlisted'
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all' | 'Residential' | 'Plots & Land' | 'Commercial'
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const openAdd = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const hasActiveFilters = searchQuery !== '' || selectedGroup !== 'all' || selectedType !== 'all' || selectedCity !== 'all' || selectedBudget !== 'all' || selectedConfig !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGroup('all');
    setSelectedType('all');
    setSelectedCity('all');
    setSelectedBudget('all');
    setSelectedConfig('all');
  };

  // Filter properties in real time
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Tier filter
      if (selectedTier === 'luxury' && prop.tier !== 'luxury') return false;
      if (selectedTier === 'normal' && prop.tier !== 'normal') return false;
      if (selectedTier === 'unlisted' && prop.visibility !== 'unlisted' && prop.visibility !== 'private') return false;

      // Group filter (Residential / Plots & Land / Commercial)
      if (selectedGroup !== 'all') {
        const groupMap = {
          'Residential': ['residential', 'villa', 'penthouse', 'builder_floor', 'studio', 'farmhouse'],
          'Plots & Land': ['plot', 'land', 'mixed_use_land', 'commercial_land', 'farmhouse_land', 'agricultural'],
          'Commercial': ['commercial', 'retail', 'sco', 'coworking', 'mixed_use', 'live_work', 'warehouse'],
        };
        if (!groupMap[selectedGroup]?.includes(prop.type)) return false;
      }

      // Type filter
      if (selectedType !== 'all' && prop.type !== selectedType) return false;

      // City filter
      if (selectedCity !== 'all' && prop.city !== selectedCity) {
        return false;
      }

      // Budget filter
      if (selectedBudget !== 'all') {
        const budgetRange = BUDGET_OPTIONS.find(b => b.id === selectedBudget);
        if (budgetRange) {
          const price = Number(prop.priceLakhs) || 0;
          if (price < budgetRange.min || price > budgetRange.max) return false;
        }
      }

      // Config filter
      if (selectedConfig !== 'all') {
        const configText = `${prop.configuration || ''} ${prop.bhk || ''} ${prop.type || ''}`.toLowerCase();
        const cv = selectedConfig;
        // Land / Plot group
        if (cv === '__land__') {
          const landTypes = ['plot', 'land', 'mixed_use_land', 'commercial_land', 'farmhouse_land', 'agricultural'];
          if (!landTypes.includes(prop.type)) return false;
        // Commercial group
        } else if (cv === '__commercial__') {
          const commTypes = ['commercial', 'retail', 'sco', 'coworking', 'mixed_use', 'live_work', 'warehouse'];
          if (!commTypes.includes(prop.type)) return false;
        // Residential group
        } else if (cv === '__residential__') {
          const resTypes = ['residential', 'villa', 'penthouse', 'builder_floor', 'studio', 'farmhouse'];
          if (!resTypes.includes(prop.type)) return false;
        // BHK / specific config label — substring match
        } else {
          if (!configText.includes(cv.toLowerCase())) return false;
        }
      }

      // Search query filter (Project, builder, locality, city, config, type)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = prop.name?.toLowerCase().includes(q);
      const builderMatch = prop.builder?.toLowerCase().includes(q);
      const localityMatch = prop.locality?.toLowerCase().includes(q);
      const cityMatch = prop.city?.toLowerCase().includes(q);
      const configMatch = (prop.configuration || prop.bhk || '').toLowerCase().includes(q);
      const typeMatch = (prop.type || '').toLowerCase().includes(q);

      return nameMatch || builderMatch || localityMatch || cityMatch || configMatch || typeMatch;
    });
  }, [properties, searchQuery, selectedGroup, selectedType, selectedCity, selectedBudget, selectedConfig, selectedTier]);

  const handleShareCard = async (e, prop) => {
    e.stopPropagation();
    const mapUrl = prop.locationLink || `https://maps.google.com/?q=${encodeURIComponent(prop.locality + ', ' + (prop.city || 'India'))}`;
    const shareUrl = `${window.location.origin}/app/properties/${prop.id}`;
    const shareText = `🏡 *${prop.name}* (${prop.configuration || prop.bhk})\n` +
      `📍 ${prop.locality}, ${prop.city || 'India'}\n` +
      `💰 ${formatINR(prop.priceLakhs)} | ${prop.areaSqFt ? prop.areaSqFt + ' sq.ft' : ''}\n` +
      `🗺️ Location: ${mapUrl}\n` +
      `Details: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: prop.name,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(prop.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const toggleSelectProperty = (id, e) => {
    e.stopPropagation();
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDownloadCatalogPdf = () => {
    // If agent checked specific properties, only generate catalog for those!
    const targetProperties = selectedPropertyIds.size > 0
      ? properties.filter(p => selectedPropertyIds.has(p.id))
      : filteredProperties;

    let filterDescription = [];
    if (selectedPropertyIds.size > 0) {
      filterDescription.push(`Handpicked Selection (${selectedPropertyIds.size} Units)`);
    } else {
      if (searchQuery) filterDescription.push(`Area: "${searchQuery}"`);
      if (selectedType !== 'all') filterDescription.push(`Type: ${selectedType}`);
      if (selectedBudget !== 'all') {
        const b = BUDGET_OPTIONS.find(x => x.id === selectedBudget);
        if (b) filterDescription.push(`Budget: ${b.label}`);
      }
      if (selectedConfig !== 'All') filterDescription.push(`Config: ${selectedConfig}`);
      if (selectedCity !== 'all') filterDescription.push(`City: ${selectedCity}`);
    }

    printPropertyCatalog(
      targetProperties,
      filterDescription.length > 0 ? filterDescription.join(' | ') : 'All Inventory Available'
    );
  };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Inventory</h1>
          <p className="page-subtitle">Instant client enquiry search, multi-criteria filtering, and PDF generation</p>
        </div>
        <div className="properties-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Secret Digital Dossier / Web Catalog button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCatalogModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderColor: '#059669',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}
            title="Create private client web link + WhatsApp message"
          >
            <Send size={15} />
            <span>
              {selectedPropertyIds.size > 0
                ? `Send Secret Web Catalog (${selectedPropertyIds.size})`
                : `Send Web Catalog (${filteredProperties.length})`}
            </span>
          </button>

          {filteredProperties.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadCatalogPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderColor: selectedPropertyIds.size > 0 ? '#10b981' : 'var(--color-border)',
                fontWeight: 600
              }}
              title="Generate printable PDF catalog for client"
            >
              <FileDown size={16} />
              <span>
                {selectedPropertyIds.size > 0
                  ? `Download PDF (${selectedPropertyIds.size})`
                  : `Download PDF (${filteredProperties.length})`}
              </span>
            </button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Property</button>
        </div>
      </div>

      {/* Tier Switcher Segmented Control (Fixed Dimension Non-Collapsing Double-Bezel) */}
      <div className="tier-switcher-container no-scrollbar" style={{
        margin: '0 0 20px 0',
        padding: '5px',
        background: 'rgba(241, 245, 253, 0.95)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        maxWidth: '100%',
        minHeight: '48px',
        height: '48px',
        flexShrink: 0,
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        {/* All Inventory Tab */}
        <button
          type="button"
          onClick={() => setSelectedTier('all')}
          style={{
            padding: '0 16px',
            height: '38px',
            flexShrink: 0,
            fontSize: '13px',
            fontWeight: selectedTier === 'all' ? 600 : 500,
            borderRadius: '12px',
            border: selectedTier === 'all' ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid transparent',
            background: selectedTier === 'all' ? '#FFFFFF' : 'transparent',
            color: selectedTier === 'all' ? 'var(--color-fg)' : 'var(--color-muted-fg)',
            boxShadow: selectedTier === 'all' ? '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            whiteSpace: 'nowrap'
          }}
          className="tier-btn"
        >
          <Building2 size={14} style={{ color: selectedTier === 'all' ? 'var(--color-primary)' : 'inherit', flexShrink: 0 }} />
          <span>All Units</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '20px',
            background: selectedTier === 'all' ? 'var(--color-muted)' : 'rgba(0, 0, 0, 0.05)',
            color: selectedTier === 'all' ? 'var(--color-primary)' : 'inherit',
            flexShrink: 0
          }}>
            {properties.length}
          </span>
        </button>

        {/* Luxury Tier Tab */}
        <button
          type="button"
          onClick={() => setSelectedTier('luxury')}
          style={{
            padding: '0 16px',
            height: '38px',
            flexShrink: 0,
            fontSize: '13px',
            fontWeight: selectedTier === 'luxury' ? 600 : 500,
            borderRadius: '12px',
            border: selectedTier === 'luxury' ? '1px solid rgba(217, 119, 6, 0.2)' : '1px solid transparent',
            background: selectedTier === 'luxury' ? '#FFFFFF' : 'transparent',
            color: selectedTier === 'luxury' ? '#b45309' : 'var(--color-muted-fg)',
            boxShadow: selectedTier === 'luxury' ? '0 2px 8px rgba(217, 119, 6, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            whiteSpace: 'nowrap'
          }}
          className="tier-btn"
        >
          <Sparkles size={14} fill={selectedTier === 'luxury' ? '#f59e0b' : 'none'} style={{ color: '#d97706', flexShrink: 0 }} />
          <span>✨ Luxury Tier (Live on Website)</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '20px',
            background: selectedTier === 'luxury' ? '#FEF3C7' : 'rgba(0, 0, 0, 0.05)',
            color: selectedTier === 'luxury' ? '#b45309' : 'inherit',
            flexShrink: 0
          }}>
            {properties.filter(p => p.tier === 'luxury').length}
          </span>
        </button>

        {/* Off-Market / Normal Tab */}
        <button
          type="button"
          onClick={() => setSelectedTier('normal')}
          style={{
            padding: '0 16px',
            height: '38px',
            flexShrink: 0,
            fontSize: '13px',
            fontWeight: selectedTier === 'normal' ? 600 : 500,
            borderRadius: '12px',
            border: selectedTier === 'normal' ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid transparent',
            background: selectedTier === 'normal' ? '#FFFFFF' : 'transparent',
            color: selectedTier === 'normal' ? '#334155' : 'var(--color-muted-fg)',
            boxShadow: selectedTier === 'normal' ? '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            whiteSpace: 'nowrap'
          }}
          className="tier-btn"
        >
          <Lock size={13} style={{ color: selectedTier === 'normal' ? '#475569' : 'inherit', flexShrink: 0 }} />
          <span>🔒 Off-Market (Private Link Only)</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '20px',
            background: selectedTier === 'normal' ? '#F1F5F9' : 'rgba(0, 0, 0, 0.05)',
            color: selectedTier === 'normal' ? '#334155' : 'inherit',
            flexShrink: 0
          }}>
            {properties.filter(p => p.tier === 'normal').length}
          </span>
        </button>
      </div>

      {/* Client Call Quick Search & Multi-Filters */}
      <div className="card properties-filter-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top search & dropdown row */}
        <div className="properties-filter-row" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Locality & Keyword Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-fg)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36, paddingRight: searchQuery ? 32 : 12 }}
              placeholder="Type area (e.g. Whitefield, Sector 150), project, builder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: 4, height: 'auto' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Config filter */}
          <div style={{ minWidth: 160, flex: '0 1 190px' }}>
            <select
              className="form-select"
              value={selectedConfig}
              onChange={(e) => setSelectedConfig(e.target.value)}
            >
              <option value="all">Any Config</option>
              <optgroup label="— Residential BHK">
                <option value="1 BHK">1 BHK</option>
                <option value="1.5 BHK">1.5 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="2.5 BHK">2.5 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="3.5 BHK">3.5 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="4.5 BHK">4.5 BHK</option>
                <option value="5+ BHK">5+ BHK</option>
                <option value="__residential__">All Residential</option>
              </optgroup>
              <optgroup label="— Plot &amp; Land">
                <option value="__land__">All Plot &amp; Land</option>
                <option value="Residential Plot">Residential Plot</option>
                <option value="Farmhouse Land">Farmhouse Land</option>
                <option value="Agricultural">Agricultural Land</option>
                <option value="Commercial Land">Commercial Land</option>
                <option value="Mixed-Use Land">Mixed-Use Land</option>
              </optgroup>
              <optgroup label="— Commercial">
                <option value="__commercial__">All Commercial</option>
                <option value="Office">Office Space</option>
                <option value="Retail">Retail / Showroom</option>
                <option value="SCO">SCO Plot</option>
                <option value="Coworking">Co-Working</option>
                <option value="Warehouse">Warehouse</option>
              </optgroup>
            </select>
          </div>

          {/* Budget filter */}
          <div style={{ minWidth: 150, flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
            >
              {BUDGET_OPTIONS.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* City filter */}
          <div style={{ minWidth: 140, flex: '0 1 160px' }}>
            <select
              className="form-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="all">All Cities</option>
              {CITIES_BY_REGION.map(reg => (
                <optgroup key={reg.region} label={reg.region}>
                  {reg.cities.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={resetFilters}
              style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-muted-fg)' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}

          {/* View Mode Toggle: Grid vs Table/List */}
          <div style={{ display: 'flex', background: 'var(--color-muted)', padding: '3px', borderRadius: 'var(--border-radius-md)', gap: 2, marginLeft: 'auto' }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-ghost' : 'btn-ghost'}`}
              style={viewMode === 'grid' ? { background: 'var(--color-card)', boxShadow: 'var(--shadow-sm)', fontWeight: 600, color: 'var(--color-fg)' } : { color: 'var(--color-muted-fg)' }}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
              <span style={{ fontSize: 12 }}>Grid</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-ghost' : 'btn-ghost'}`}
              style={viewMode === 'table' ? { background: 'var(--color-card)', boxShadow: 'var(--shadow-sm)', fontWeight: 600, color: 'var(--color-fg)' } : { color: 'var(--color-muted-fg)' }}
              onClick={() => setViewMode('table')}
              title="Table List View"
            >
              <List size={15} />
              <span style={{ fontSize: 12 }}>List</span>
            </button>
          </div>

          {/* Live matches info */}
          <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>
            <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'unit' : 'units'}
          </div>
        </div>

        {/* Category Group Pills */}
        <div className="properties-pills-row no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[{ id: 'all', label: '🏠 All Assets' }, { id: 'Residential', label: '🏢 Residential' }, { id: 'Plots & Land', label: '🌿 Plot & Land' }, { id: 'Commercial', label: '🏪 Commercial' }].map(g => (
            <button
              key={g.id}
              type="button"
              className={`filter-pill ${selectedGroup === g.id ? 'active' : ''}`}
              onClick={() => { setSelectedGroup(g.id); setSelectedType('all'); }}
              style={{ height: 30, fontSize: 12, fontWeight: selectedGroup === g.id ? 700 : 500 }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* TYPE sub-pills — scoped to selected group */}
        {selectedGroup !== 'all' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type:</span>
            <button
              type="button"
              className={`filter-pill ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedType('all')}
              style={{ height: 26, fontSize: 11 }}
            >
              All
            </button>
            {ASSET_CATEGORIES.filter(c => c.group === selectedGroup).map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${selectedType === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedType(cat.id)}
                style={{ height: 26, fontSize: 11 }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid or Table or Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12)' }}>
          <EmptyState
            icon={Building2}
            title={hasActiveFilters ? "No matching properties found" : "No Properties in Inventory"}
            description={hasActiveFilters ? "Try adjusting your area search query, budget range, or configuration." : "Add your first property to start matching with leads."}
            action={hasActiveFilters ? { label: "Reset All Filters", onClick: resetFilters } : { label: "Add Property", onClick: openAdd }}
          />
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE / LIST VIEW */
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 40 }}>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.size === filteredProperties.length && filteredProperties.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPropertyIds(new Set(filteredProperties.map(p => p.id)));
                        } else {
                          setSelectedPropertyIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>Property / Project</th>
                  <th>Type & Config</th>
                  <th>Price & Area</th>
                  <th>Location</th>
                  <th>Tier & Status</th>
                  <th>Website Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map(prop => {
                  const mapUrl = prop.locationLink || `https://maps.google.com/?q=${encodeURIComponent(prop.locality + ', ' + (prop.city || 'India'))}`;
                  const configDisplay = prop.configuration || prop.bhk || 'Standard';

                  return (
                    <tr
                      key={prop.id}
                      onClick={() => navigate(`/app/properties/${prop.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPropertyIds.has(prop.id)}
                          onChange={(e) => toggleSelectProperty(prop.id, e)}
                        />
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={prop.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60'}
                            alt={prop.name}
                            style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-fg)' }}>{prop.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>{prop.builder || 'Independent'}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{configDisplay}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', textTransform: 'capitalize' }}>{prop.type}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 14 }}>{formatINR(prop.priceLakhs)}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>{prop.areaSqFt ? formatArea(prop.areaSqFt) : 'Area TBD'}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{prop.locality}</div>
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 11, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                        >
                          {prop.city} <ExternalLink size={10} />
                        </a>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <button
                            type="button"
                            onClick={async () => {
                              await usePropertyStore.getState().toggleVisibility(prop.id);
                            }}
                            title="Click to toggle Public / Off-Market visibility"
                            style={{
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 12,
                              background: prop.visibility === 'public' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                              color: prop.visibility === 'public' ? '#2563eb' : '#475569',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              transition: 'all 150ms ease'
                            }}
                          >
                            {prop.visibility === 'public' ? (
                              <>
                                <Globe size={11} />
                                <span>🌐 Public (Live)</span>
                              </>
                            ) : (
                              <>
                                <Lock size={11} />
                                <span>🔒 Off-Market</span>
                              </>
                            )}
                          </button>
                          <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', textTransform: 'capitalize', paddingLeft: 4 }}>
                            {prop.status?.replace('_', ' ') || 'Available'}
                          </span>
                        </div>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={async () => {
                            await usePropertyStore.getState().toggleFeatured(prop.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: prop.is_featured ? '#d97706' : 'var(--color-muted-fg)',
                            fontSize: 12,
                            fontWeight: prop.is_featured ? 600 : 400
                          }}
                        >
                          <Sparkles size={14} fill={prop.is_featured ? '#d97706' : 'none'} />
                          <span>{prop.is_featured ? 'Featured' : 'No'}</span>
                        </button>
                      </td>

                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {prop.visibility === 'public' && (
                            <a
                              href={`http://localhost:3000/property/${(prop.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || prop.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-icon"
                              style={{ height: 30, width: 30, color: '#2563eb' }}
                              title="Preview on live website"
                            >
                              <Globe size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            onClick={() => printSingleProperty(prop)}
                            style={{ height: 30, width: 30 }}
                            title="Download PDF Sheet"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setEditingProperty(prop); setIsModalOpen(true); }}
                            style={{ height: 30, fontSize: 12, padding: '0 10px' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="properties-card-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: 'var(--space-5)',
          paddingBottom: 60
        }}>
          {filteredProperties.map(prop => {
            const mapUrl = prop.locationLink || `https://maps.google.com/?q=${encodeURIComponent(prop.locality + ', ' + (prop.city || 'India'))}`;
            const configDisplay = prop.configuration || prop.bhk || 'Standard';

            return (
              <div
                key={prop.id}
                className="card card-hoverable"
                onClick={() => navigate(`/app/properties/${prop.id}`)}
                style={{
                  padding: 0,
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  minHeight: 400,
                  borderRadius: 'var(--border-radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                  transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms ease-out'
                }}
              >
                {/* Image & Badges */}
                <div style={{ position: 'relative', height: 180, borderTopLeftRadius: 'var(--border-radius-lg)', borderTopRightRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: 'var(--color-muted)' }}>
                  <img
                    src={prop.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60'}
                    alt={prop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Checkbox for custom catalog compilation */}
                  <button
                    type="button"
                    onClick={(e) => toggleSelectProperty(prop.id, e)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: selectedPropertyIds.has(prop.id) ? '#10b981' : 'rgba(15, 23, 42, 0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: selectedPropertyIds.has(prop.id) ? '2px solid #fff' : '1.5px solid rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      zIndex: 5,
                      transition: 'all 0.15s ease'
                    }}
                    title={selectedPropertyIds.has(prop.id) ? "Remove from custom catalog" : "Select to bundle into custom catalog"}
                  >
                    {selectedPropertyIds.has(prop.id) ? <Check size={16} strokeWidth={3} /> : null}
                  </button>

                  {/* Property Type Badge & Tier Badge */}
                  <div style={{ position: 'absolute', top: 10, left: 44, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 12,
                      textTransform: 'capitalize'
                    }}>
                      {(prop.type || 'property').replace(/_/g, ' ')}
                    </span>

                    <span style={{
                      background: prop.tier === 'normal' ? 'rgba(71, 85, 105, 0.85)' : 'rgba(37, 99, 235, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 7px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {prop.tier === 'normal' ? '🔒 Off-Market' : '✨ Luxury'}
                    </span>
                  </div>

                  {/* PDF + Share quick action button group */}
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                    {/* PDF single property button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printSingleProperty(prop);
                      }}
                      className="btn btn-secondary btn-icon"
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        color: 'var(--color-primary)'
                      }}
                      title="Download/Print PDF property sheet"
                      aria-label="Download PDF"
                    >
                      <Printer size={14} />
                    </button>

                    {/* Send directly to Pipeline Lead */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingProperty(prop);
                      }}
                      className="btn btn-secondary btn-icon"
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        color: '#15803d'
                      }}
                      title="Send WhatsApp pitch directly to a lead"
                      aria-label="Send to Lead"
                    >
                      <Send size={13} />
                    </button>

                    {/* Share button */}
                    <button
                      type="button"
                      onClick={(e) => handleShareCard(e, prop)}
                      className="btn btn-secondary btn-icon"
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        color: copiedId === prop.id ? 'var(--color-success)' : 'var(--color-fg)'
                      }}
                      title="Share property link & summary"
                      aria-label="Share property"
                    >
                      {copiedId === prop.id ? <Check size={14} /> : <Share2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                    <h3 className="text-h3" style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}>
                      {prop.name}
                    </h3>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary)', whiteSpace: 'nowrap', fontSize: 15 }}>
                      {formatINR(prop.priceLakhs)}
                    </div>
                  </div>

                  <div style={{ color: 'var(--color-muted-fg)', fontSize: 13, marginBottom: 10 }}>
                    {prop.builder || 'Independent'}
                  </div>

                  {/* Badges: Configuration & Locality */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: 'var(--color-fg)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={14} className="text-muted" />
                      <span style={{ fontWeight: 500 }}>{configDisplay}</span>
                      {prop.areaSqFt && <span style={{ color: 'var(--color-muted-fg)', fontSize: 12 }}>({formatArea(prop.areaSqFt)})</span>}
                    </div>

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontSize: 12
                      }}
                      title="Open Google Maps location"
                    >
                      <MapPin size={13} />
                      <span className="truncate" style={{ maxWidth: 110 }}>{prop.locality}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  {/* Quick Admin Toggles: Featured & Live Website Link */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--color-border)', fontSize: 12 }}>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await usePropertyStore.getState().toggleFeatured(prop.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: prop.is_featured ? '#d97706' : 'var(--color-muted-fg)',
                        fontWeight: prop.is_featured ? 600 : 400
                      }}
                      title="Toggle Featured on tgvestates.com"
                    >
                      <Sparkles size={13} fill={prop.is_featured ? '#d97706' : 'none'} />
                      <span>{prop.is_featured ? 'Featured on Web' : 'Not Featured'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await usePropertyStore.getState().toggleVisibility(prop.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: prop.visibility === 'public' ? '#2563eb' : '#64748b',
                          backgroundColor: prop.visibility === 'public' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(100, 116, 139, 0.1)'
                        }}
                        title="Click to toggle Public / Off-Market"
                      >
                        {prop.visibility === 'public' ? (
                          <>
                            <Globe size={11} />
                            <span>🌐 Public</span>
                          </>
                        ) : (
                          <>
                            <Lock size={11} />
                            <span>🔒 Off-Market</span>
                          </>
                        )}
                      </button>

                      {prop.visibility === 'public' && (
                        <a
                          href={`http://localhost:3000/property/${(prop.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || prop.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: 'var(--color-primary)',
                            padding: '2px 4px',
                            borderRadius: 4
                          }}
                          title="Preview on live website"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                    <Link
                      to={`/app/properties/${prop.id}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, height: 34, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </Link>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => { setEditingProperty(prop); setIsModalOpen(true); }}
                      style={{ height: 34, fontSize: 13, padding: '0 12px' }}
                    >
                      Edit Studio
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProperty={editingProperty}
      />

      {/* 1-Click Send to Lead Modal */}
      <PropertyShareModal
        isOpen={Boolean(sharingProperty)}
        onClose={() => setSharingProperty(null)}
        property={sharingProperty}
      />

      {/* Secret Web Catalog Generator Modal */}
      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        selectedProperties={
          selectedPropertyIds.size > 0
            ? properties.filter(p => selectedPropertyIds.has(p.id))
            : filteredProperties
        }
      />
    </div>
  );
}
