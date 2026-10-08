import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { usePropertyStore } from '../store/propertyStore';
import { useLeadStore } from '../store/leadStore';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import { useBuilderStore } from '../store/builderStore';
import { formatINR, formatArea } from '../utils/formatters';
import { PropertyModal } from '../components/PropertyModal';
import { PropertyShareModal } from '../components/PropertyShareModal';
import { EmiCalculatorModal } from '../components/EmiCalculatorModal';
import { printSingleProperty } from '../utils/propertyPdf';
import { findMatchingLeads } from '../utils/matchingEngine';
import { getAssetArchetype } from '../utils/propertyTaxonomy';
import './PropertyDetails.css';

import {
  ArrowLeft,
  MapPin,
  Building2,
  ExternalLink,
  Share2,
  Edit,
  Trash2,
  Check,
  Calendar,
  ShieldCheck,
  Layers,
  Sparkles,
  MessageCircle,
  Copy,
  Printer,
  Users,
  Send,
  Calculator,
  BedDouble,
  Bath,
  Compass,
  Car,
  FileText,
  Download,
  Maximize2,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Video,
  Scale,
  Landmark,
  FileCheck2,
  Info,
  Flame,
  AlertCircle
} from 'lucide-react';

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = usePropertyStore();
  const { leads } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { builders } = useBuilderStore();
  const property = getProperty(id);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  // Tab & variant states
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'blueprints' | 'legal' | 'transit' | 'media'
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Lightbox & media modal states
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [activeBlueprintSrc, setActiveBlueprintSrc] = useState('');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryActiveIdx, setGalleryActiveIdx] = useState(0);
  const [activeGalleryTag, setActiveGalleryTag] = useState('All');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [virtualTourModalOpen, setVirtualTourModalOpen] = useState(false);

  if (!property) {
    return (
      <div className="page" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <Building2 size={48} style={{ color: 'var(--color-muted-fg)', margin: '0 auto 16px' }} />
          <h2 className="text-h2" style={{ marginBottom: 12 }}>Property Dossier Not Found</h2>
          <p className="text-muted" style={{ marginBottom: 24, fontSize: 14 }}>
            The requested inventory listing could not be found or may have been archived.
          </p>
          <Link to="/app/properties" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  // Archetype & Taxonomy Intelligence
  const archetype = getAssetArchetype(property.type || '', property.name || '');
  const isPlot = archetype === 'plot';
  const isCommercial = archetype === 'commercial' || archetype === 'industrial';
  const isResidential = archetype === 'residential' || archetype === 'estate';

  // Area & Financial Calculations
  const areaUnit = property.area_unit || (isPlot ? 'sqyd' : 'sqft');
  const unitLabel = areaUnit === 'sqyd' ? 'Sq.Yd' : areaUnit === 'acre' ? 'Acre' : 'Sq.Ft';
  const displayArea = property.areaSqFt ? Number(property.areaSqFt).toLocaleString() : '—';
  const ratePerUnit = property.priceLakhs && property.areaSqFt && Number(property.areaSqFt) > 0
    ? Math.round((Number(property.priceLakhs) * 100000) / Number(property.areaSqFt))
    : null;

  // Variants & Room Dimensions
  const variants = Array.isArray(property.variants) && property.variants.length > 0 ? property.variants : [];
  const activeVariant = variants[selectedVariantIdx] || null;
  const currentBlueprint = activeVariant?.floor_plan_url || property.floor_plan_url || '';
  const currentDimensions = activeVariant?.custom_dimensions?.length > 0
    ? activeVariant.custom_dimensions
    : (Array.isArray(property.custom_dimensions) ? property.custom_dimensions : []);

  // Executive Highlights (Visible only)
  const highlights = Array.isArray(property.key_highlights)
    ? property.key_highlights.filter(h => (typeof h === 'string' ? true : h.is_visible !== false))
    : [];

  // RERA & Diligence Matrix
  const reraBlocks = Array.isArray(property.rera_blocks)
    ? property.rera_blocks.filter(b => b.is_visible !== false)
    : [];

  // Commute points
  const commutePoints = Array.isArray(property.custom_commute_points)
    ? property.custom_commute_points
    : [];

  // Photos & Tags
  const rawImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop']);
  const imageTags = Array.isArray(property.image_tags) ? property.image_tags : [];
  const uniqueTags = ['All', ...new Set(imageTags.filter(Boolean))];
  const filteredImages = activeGalleryTag === 'All'
    ? rawImages
    : rawImages.filter((_, idx) => imageTags[idx] === activeGalleryTag);

  // Registered Builder Lookup
  const registeredBuilder = property.builder_id
    ? builders.find(b => b.id === property.builder_id)
    : null;

  // Matching Prospective Buyer Leads
  const matchedLeads = findMatchingLeads(property, leads) || [];

  // Google Maps URL
  const mapUrl = property.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property.locality + ', ' + (property.city || 'India'))}`;

  // WhatsApp Pitch Handler
  const handleSendToBuyer = (lead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${lead.name}, I have shortlisted a prime verified asset matching your requirement:\n\n` +
      `🏡 *${property.name}* (${property.configuration || property.bhk || ''})\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `💰 Price: ${formatINR(property.priceLakhs)} ${ratePerUnit ? `(₹${ratePerUnit.toLocaleString('en-IN')}/${unitLabel})` : ''}\n` +
      `📐 Super Area: ${displayArea} ${unitLabel}\n` +
      (property.reraNumber ? `🛡️ RERA: ${property.reraNumber}\n` : '') +
      `🗺️ Location: ${mapUrl}\n\n` +
      `Can we schedule a private site visit for you this week?`;

    useActivityStore.getState().logActivity(
      lead.id,
      currentUser?.id,
      'WHATSAPP_SENT',
      `Shared luxury property "${property.name}" via WhatsApp from Property Dossier`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = async () => {
    const shareText = `🏡 *${property.name}* by ${property.builder || 'Builder'}\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `📐 Config: ${property.configuration || property.bhk} (${displayArea} ${unitLabel})\n` +
      `💰 Price: ${formatINR(property.priceLakhs)} ${ratePerUnit ? `(₹${ratePerUnit.toLocaleString('en-IN')}/${unitLabel})` : ''}\n` +
      `🗺️ Location: ${mapUrl}\n` +
      `🔗 View details: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.name,
          text: shareText,
          url: window.location.href
        });
        setShareFeedback('Shared successfully');
        setTimeout(() => setShareFeedback(''), 2500);
        return;
      } catch (err) {
        // User cancelled share
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setShareFeedback('Listing summary copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShareFeedback('');
      }, 2500);
    } catch (e) {
      setShareFeedback('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🏡 *${property.name}* (${property.configuration || property.bhk})\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `💰 ${formatINR(property.priceLakhs)} | ${displayArea} ${unitLabel}\n` +
      `🗺️ Map: ${mapUrl}\n` +
      `More info: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete "${property.name}" from CRM & Website?`)) {
      deleteProperty(property.id);
      navigate('/app/properties');
    }
  };

  const formattedType = (property.type || 'residential').replace(/_/g, ' ');
  const statusLabel = (property.status || 'ready_to_move').replace(/_/g, ' ');

  return (
    <div className="page property-dossier-page">
      {/* ── Top Action Command Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
        <Link
          to="/app/properties"
          className="btn btn-ghost"
          style={{ paddingLeft: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Inventory Master</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {shareFeedback && (
            <span style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> {shareFeedback}
            </span>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => printSingleProperty(property)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            title="Download Luxury Print-Ready Property Brochure PDF"
          >
            <Printer size={15} />
            <span>PDF Brochure</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEmiOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Calculate monthly home loan EMI"
          >
            <Calculator size={15} />
            <span>EMI Calculator</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsShareModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
            title="Shortlist and send to pipeline lead via WhatsApp"
          >
            <Send size={15} />
            <span>Pitch to Lead</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleWhatsAppShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Edit size={15} />
            <span>Edit Property</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleDelete}
            style={{ color: 'var(--color-destructive)' }}
            title="Delete listing"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Panoramic Hero Showcase ── */}
      <div className="dossier-hero-card">
        <img
          src={rawImages[0]}
          alt={property.name}
          className="dossier-hero-bg"
        />
        <div className="dossier-hero-overlay" />

        {/* Floating Top Eyebrow Badges */}
        <div style={{ position: 'absolute', top: 18, left: 20, display: 'flex', gap: 8, flexWrap: 'wrap', zIndex: 2 }}>
          <span className="dossier-eyebrow dossier-eyebrow-accent">
            <Building2 size={12} />
            <span>{formattedType}</span>
          </span>

          <span className={`dossier-eyebrow ${property.status === 'ready_to_move' ? 'dossier-eyebrow-emerald' : 'dossier-eyebrow-amber'}`}>
            <Calendar size={12} />
            <span>{property.possession_timeline || statusLabel}</span>
          </span>

          {property.tier === 'luxury' && (
            <span className="dossier-eyebrow dossier-eyebrow-glass" style={{ color: '#fef08a', borderColor: 'rgba(254, 240, 138, 0.4)' }}>
              <Sparkles size={12} />
              <span>Luxury Collection</span>
            </span>
          )}

          {property.is_featured && (
            <span className="dossier-eyebrow dossier-eyebrow-glass" style={{ background: 'rgba(239, 68, 68, 0.85)' }}>
              <Flame size={12} />
              <span>Featured Hero Spotlight</span>
            </span>
          )}

          {property.purpose === 'rent' ? (
            <span className="dossier-eyebrow dossier-eyebrow-glass">For Lease / High-End Rent</span>
          ) : (
            <span className="dossier-eyebrow dossier-eyebrow-glass">For Outright Sale</span>
          )}

          {property.show_rera !== false && property.reraNumber && (
            <span className="dossier-eyebrow dossier-eyebrow-emerald">
              <ShieldCheck size={12} />
              <span>RERA Registered</span>
            </span>
          )}
        </div>

        {/* Hero Bottom Bar */}
        <div className="dossier-hero-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {property.visibility === 'unlisted' && (
                <span style={{ background: '#f59e0b', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                  Off-Market Mandate
                </span>
              )}
            </div>

            <h1 className="dossier-hero-title">{property.name}</h1>

            <div className="dossier-hero-subtitle">
              <span>By <strong style={{ color: '#fff' }}>{property.builder || 'Independent Developer'}</strong></span>
              {registeredBuilder && (
                <span style={{ fontSize: 11, background: 'rgba(37,99,235,0.4)', padding: '2px 6px', borderRadius: 4, color: '#93c5fd' }}>
                  Verified Partner Profile
                </span>
              )}
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} style={{ color: '#38bdf8' }} />
                <span>{property.locality}, {property.city}</span>
              </span>
            </div>
          </div>

          {/* Price Quote + Rate/sqft */}
          <div className="dossier-hero-price-box">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Price Quote
            </div>
            <div className="dossier-hero-price-quote">
              {formatINR(property.priceLakhs)}
            </div>
            {ratePerUnit && (
              <div className="dossier-hero-rate">
                ₹{ratePerUnit.toLocaleString('en-IN')} / {unitLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Executive Highlights ("Why Consider This Asset") ── */}
      {highlights.length > 0 && (
        <div className="dossier-highlights-strip">
          <div className="dossier-highlights-header">
            <div className="dossier-highlights-title">
              <Sparkles size={16} />
              <span>Executive Highlights &amp; Investment Thesis</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', fontWeight: 600 }}>
              {highlights.length} Key Highlights Configured
            </span>
          </div>

          <div className="dossier-highlights-grid">
            {highlights.map((hl, idx) => {
              const text = typeof hl === 'string' ? hl : hl.text;
              return (
                <div key={hl.id || idx} className="dossier-highlight-item">
                  <div className="dossier-highlight-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="dossier-highlight-text">{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Dossier Grid: 2-Column (Tabs on Left, Deal Cockpit on Right) ── */}
      <div className="property-dossier-grid">
        {/* Left Column: Segmented Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minWidth: 0 }}>
          
          {/* Segmented Tab Bar */}
          <div className="dossier-tabs-nav no-scrollbar">
            <button
              type="button"
              className={`dossier-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              <Building2 size={16} />
              <span>Specs &amp; Overview</span>
            </button>

            <button
              type="button"
              className={`dossier-tab-btn ${activeTab === 'blueprints' ? 'active' : ''}`}
              onClick={() => setActiveTab('blueprints')}
            >
              <Layers size={16} />
              <span>Layouts &amp; Blueprints</span>
              {variants.length > 0 && (
                <span className="dossier-tab-badge">{variants.length} Sizes</span>
              )}
            </button>

            <button
              type="button"
              className={`dossier-tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
              onClick={() => setActiveTab('legal')}
            >
              <ShieldCheck size={16} />
              <span>RERA &amp; Title Diligence</span>
              {reraBlocks.length > 0 && (
                <span className="dossier-tab-badge">{reraBlocks.length} Blocks</span>
              )}
            </button>

            <button
              type="button"
              className={`dossier-tab-btn ${activeTab === 'transit' ? 'active' : ''}`}
              onClick={() => setActiveTab('transit')}
            >
              <Navigation size={16} />
              <span>Transit &amp; Commute</span>
              {commutePoints.length > 0 && (
                <span className="dossier-tab-badge">{commutePoints.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`dossier-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              <Video size={16} />
              <span>Gallery &amp; Media</span>
              <span className="dossier-tab-badge">{rawImages.length}</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════
              TAB 1: SPECS & OVERVIEW (Adaptive by Archetype)
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'specs' && (
            <div className="dossier-double-bezel">
              <div className="dossier-double-bezel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={18} className="text-primary" />
                    <span>Property Specifications ({formattedType})</span>
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>
                    Category Archetype: <strong style={{ color: 'var(--color-fg)', textTransform: 'capitalize' }}>{archetype}</strong>
                  </span>
                </div>

                {/* Adaptive Spec Grid */}
                <div className="dossier-spec-grid">
                  {/* Common: Super Area */}
                  <div className="dossier-spec-tile">
                    <div className="dossier-spec-label">
                      <Layers size={13} /> Super Built-up Area
                    </div>
                    <div className="dossier-spec-value">
                      {displayArea} {unitLabel}
                    </div>
                    {ratePerUnit && (
                      <div className="dossier-spec-hint">
                        ₹{ratePerUnit.toLocaleString('en-IN')} / {unitLabel}
                      </div>
                    )}
                  </div>

                  {/* Residential Specifics */}
                  {isResidential && (
                    <>
                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <BedDouble size={13} /> Configuration
                        </div>
                        <div className="dossier-spec-value">
                          {property.configuration || property.bhk || `${property.bedrooms || 3} BHK`}
                        </div>
                        <div className="dossier-spec-hint">
                          {property.bedrooms || 3} Beds • {property.bathrooms || 3} Baths
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Layers size={13} /> Carpet Area
                        </div>
                        <div className="dossier-spec-value">
                          {property.carpet_sqft ? `${Number(property.carpet_sqft).toLocaleString()} Sq.Ft` : (property.areaSqFt ? `~${Math.round(property.areaSqFt * 0.74).toLocaleString()} Sq.Ft` : '—')}
                        </div>
                        <div className="dossier-spec-hint">
                          Space efficiency: ~74%
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Building2 size={13} /> Floor Positioning
                        </div>
                        <div className="dossier-spec-value">
                          {property.floor_number !== undefined && property.floor_number !== '' ? `${property.floor_number}${property.total_floors ? ` of ${property.total_floors}` : ''} Floors` : (property.total_floors ? `G + ${property.total_floors}` : '—')}
                        </div>
                        {property.balconies !== undefined && property.balconies !== '' && (
                          <div className="dossier-spec-hint">
                            {property.balconies} Balconies
                          </div>
                        )}
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Compass size={13} /> Facing &amp; Orientation
                        </div>
                        <div className="dossier-spec-value">
                          {property.facing || 'North-East'}
                        </div>
                        <div className="dossier-spec-hint">
                          Optimal Vastu &amp; Sunpath
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Car size={13} /> Dedicated Parking
                        </div>
                        <div className="dossier-spec-value">
                          {property.parking || '2 Covered Parking'}
                        </div>
                        <div className="dossier-spec-hint">
                          EV Charging Provision
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Sparkles size={13} /> Furnishing Status
                        </div>
                        <div className="dossier-spec-value" style={{ textTransform: 'capitalize' }}>
                          {property.furnishing_status || 'Semi-Furnished'}
                        </div>
                        <div className="dossier-spec-hint">
                          Italian Marble &amp; Modular
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Calculator size={13} /> Maintenance
                        </div>
                        <div className="dossier-spec-value">
                          {property.maintenance_charges || '₹4.5 / sq.ft'}
                        </div>
                        <div className="dossier-spec-hint">
                          Monthly maintenance charge
                        </div>
                      </div>
                    </>
                  )}

                  {/* Commercial / Industrial Specifics */}
                  {isCommercial && (
                    <>
                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Building2 size={13} /> Tenancy / Occupancy
                        </div>
                        <div className="dossier-spec-value">
                          {property.occupancy_status || 'Vacant for Self-Use'}
                        </div>
                        <div className="dossier-spec-hint">
                          Immediate Possession
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Sparkles size={13} /> Fit-out Condition
                        </div>
                        <div className="dossier-spec-value" style={{ textTransform: 'capitalize' }}>
                          {property.furnishing_status || 'Warm Shell'}
                        </div>
                        <div className="dossier-spec-hint">
                          Central HVAC &amp; Flooring
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Building2 size={13} /> Cabins &amp; Pantry
                        </div>
                        <div className="dossier-spec-value">
                          {property.cabins ? `${property.cabins} Executive Cabins` : 'Open Floorplate'}
                        </div>
                        <div className="dossier-spec-hint">
                          {property.pantry ? 'Pantry Provision Available' : 'No Pantry'}
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Layers size={13} /> Power Load &amp; Backup
                        </div>
                        <div className="dossier-spec-value">
                          {property.power_load_kva ? `${property.power_load_kva} KVA` : '100% DG Backup'}
                        </div>
                        <div className="dossier-spec-hint">
                          Dual Source Grid Provision
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Building2 size={13} /> Frontage Width
                        </div>
                        <div className="dossier-spec-value">
                          {property.frontage_ft ? `${property.frontage_ft} Ft.` : 'Wide High-Street'}
                        </div>
                        <div className="dossier-spec-hint">
                          High Footfall Visibility
                        </div>
                      </div>
                    </>
                  )}

                  {/* Plot & Land Specifics */}
                  {isPlot && (
                    <>
                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Compass size={13} /> Approach Road Width
                        </div>
                        <div className="dossier-spec-value">
                          {property.road_width_ft ? `${property.road_width_ft} Ft. Road` : '60 Ft. Sector Road'}
                        </div>
                        <div className="dossier-spec-hint">
                          Arterial Sector Frontage
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Layers size={13} /> Plot Dimensions (L × B)
                        </div>
                        <div className="dossier-spec-value">
                          {property.dimensions_ft || 'Rectangular Demarcated'}
                        </div>
                        <div className="dossier-spec-hint">
                          Immediate Registry Boundary
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <Building2 size={13} /> Permissible FAR / FSI
                        </div>
                        <div className="dossier-spec-value">
                          {property.far_fsi || '2.64 Permissible'}
                        </div>
                        <div className="dossier-spec-hint">
                          Authority Sanctioned Limit
                        </div>
                      </div>

                      <div className="dossier-spec-tile">
                        <div className="dossier-spec-label">
                          <ShieldCheck size={13} /> Boundary Wall &amp; Perimeter
                        </div>
                        <div className="dossier-spec-value">
                          {property.boundary_wall ? 'Gated & Walled Perimeter' : 'Open Demarcated Plot'}
                        </div>
                        <div className="dossier-spec-hint">
                          Clear Demarcation Pillars
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Editorial Narrative / Overview */}
                <div style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 18 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-fg)' }}>
                    Editorial Description &amp; Architectural Brief
                  </h4>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-fg)', margin: 0 }}>
                    {property.description || `${property.name} is a prime ${formattedType} offering situated in ${property.locality}, ${property.city}. Featuring modern infrastructure, high aesthetic standards, and thoughtfully engineered layouts designed for discerning occupants.`}
                  </p>
                </div>

                {/* Curated Amenities Checklist */}
                {property.amenities && (
                  <div style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 18 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} className="text-primary" />
                      <span>Curated Luxury Amenities &amp; Services</span>
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(Array.isArray(property.amenities) ? property.amenities : property.amenities.split(',')).map((item, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--color-muted)',
                            color: 'var(--color-fg)',
                            fontSize: 12,
                            padding: '6px 14px',
                            borderRadius: 'var(--border-radius-full)',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
                          <span>{item.trim()}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: LAYOUTS & BLUEPRINTS (Variants & Dimensions)
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'blueprints' && (
            <div className="dossier-double-bezel">
              <div className="dossier-double-bezel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Layers size={18} className="text-primary" />
                      <span>Architectural Blueprints &amp; Unit Sizes</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                      Interactive layout studio with dedicated floor plans and room dimensions schedule.
                    </p>
                  </div>

                  {currentBlueprint && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, gap: 6 }}
                      onClick={() => {
                        setActiveBlueprintSrc(currentBlueprint);
                        setBlueprintModalOpen(true);
                      }}
                    >
                      <Maximize2 size={13} />
                      <span>Zoom Blueprint</span>
                    </button>
                  )}
                </div>

                {/* Multi-Size Variant Selector Cards */}
                {variants.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-fg)', marginBottom: 8 }}>
                      Select Unit Layout Variant ({variants.length} available)
                    </div>
                    <div className="variant-selector-cards">
                      {variants.map((v, idx) => {
                        const isSelected = selectedVariantIdx === idx;
                        return (
                          <div
                            key={v.id || idx}
                            className={`variant-selector-card ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedVariantIdx(idx)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{v.name || `Variant #${idx + 1}`}</span>
                              {idx === 0 && (
                                <span style={{ fontSize: 9, background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                                  Base
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>
                              {v.price_lakhs ? formatINR(v.price_lakhs) : 'Quote on Request'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                              {v.sqft?.toLocaleString()} Sq.Ft • {v.bedrooms ? `${v.bedrooms} BHK` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Blueprint Architectural Preview */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-fg)', marginBottom: 8 }}>
                    Architectural Layout Plan {activeVariant ? `(${activeVariant.name})` : '(Master Floor Plan)'}
                  </div>

                  {currentBlueprint ? (
                    <div
                      className="blueprint-preview-box"
                      onClick={() => {
                        setActiveBlueprintSrc(currentBlueprint);
                        setBlueprintModalOpen(true);
                      }}
                      title="Click to view high-resolution floor plan"
                    >
                      <img src={currentBlueprint} alt="Floor Plan" />
                      <div className="blueprint-enlarge-badge">
                        <Maximize2 size={14} />
                        <span>Click to Inspect High-Res Blueprint</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '36px 20px', borderRadius: 14, background: 'var(--color-muted)', textAlign: 'center', border: '1.5px dashed var(--color-border)' }}>
                      <Layers size={36} style={{ color: 'var(--color-muted-fg)', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fg)' }}>No Architectural Blueprint Attached</div>
                      <p style={{ margin: '4px auto 0', fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: 380 }}>
                        Click &quot;Edit Property&quot; to upload an architectural blueprint image or paste a high-resolution floor plan link.
                      </p>
                    </div>
                  )}
                </div>

                {/* Custom Room Dimensions Schedule */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-fg)', marginBottom: 8 }}>
                    Room Dimensions Schedule ({currentDimensions.length} rooms listed)
                  </div>

                  {currentDimensions.length > 0 ? (
                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <table className="dimensions-table">
                        <thead>
                          <tr>
                            <th>Room / Space Name</th>
                            <th>Dimensions (L × B)</th>
                            <th>Architectural Remarks / Fitment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentDimensions.map((d, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{d.room || d.room_name}</td>
                              <td style={{ color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {d.dimension || d.dimensions}
                              </td>
                              <td style={{ color: 'var(--color-muted-fg)' }}>{d.note || d.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', margin: 0 }}>
                      Standard room dimensions applied by architectural layout. Custom room-by-room sizes can be configured in the listing wizard.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: LEGAL, RERA & COMPLIANCE (4-Block Diligence)
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'legal' && (
            <div className="dossier-double-bezel">
              <div className="dossier-double-bezel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldCheck size={18} className="text-success" />
                      <span>{property.rera_custom_title || 'Institutional RERA Compliance & Legal Diligence'}</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                      Statutory regulatory clearance records, title certifications, and banking approvals.
                    </p>
                  </div>

                  {property.show_rera !== false && (
                    <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.15)', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                      Verified Clear Title
                    </span>
                  )}
                </div>

                {/* Primary RERA Credentials Banner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(37,99,235,0.05) 100%)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: 'var(--color-muted-fg)' }}>
                        Official RERA Registration Number
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                        {property.reraNumber || 'Applied / In Process of Allotment'}
                      </div>
                      {property.rera_authority && (
                        <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                          Jurisdiction: <strong style={{ color: 'var(--color-fg)' }}>{property.rera_authority}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {property.rera_portal_url && (
                        <a
                          href={property.rera_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, height: 34, gap: 6, color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                        >
                          <ExternalLink size={13} />
                          <span>Verify on Govt Portal</span>
                        </a>
                      )}

                      {property.rera_document_url && (
                        <a
                          href={property.rera_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, height: 34, gap: 6, color: '#059669', borderColor: 'rgba(16,185,129,0.4)', background: '#f0fdf4' }}
                        >
                          <Download size={13} />
                          <span>Download RERA Cert PDF</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {property.legal_status_tag && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(16,185,129,0.3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                      <span>Legal Title Status: <strong>{property.legal_status_tag}</strong></span>
                    </div>
                  )}

                  {property.legal_remarks && (
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-muted-fg)', lineHeight: 1.4 }}>
                      Audit Remarks: {property.legal_remarks}
                    </div>
                  )}

                  {property.rera_details_text && (
                    <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: '#ffffff', fontSize: 12, color: 'var(--color-fg)', border: '1px solid var(--color-border)', lineHeight: 1.5 }}>
                      {property.rera_details_text}
                    </div>
                  )}
                </div>

                {/* Dynamic 4-Block Diligence Module */}
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-fg)', marginBottom: 8 }}>
                  Institutional Diligence Checks ({reraBlocks.length} Pillars Verified)
                </div>

                <div className="rera-diligence-grid">
                  {reraBlocks.map((block, idx) => (
                    <div key={block.id || idx} className="rera-diligence-block">
                      <div className="rera-block-header">
                        <div className="rera-block-icon-wrap">
                          {block.icon_type === 'scale' ? <Scale size={16} /> :
                           block.icon_type === 'bank' ? <Landmark size={16} /> :
                           block.icon_type === 'shield' ? <ShieldCheck size={16} /> :
                           <FileCheck2 size={16} />}
                        </div>
                        <span className="rera-block-status-badge">
                          {block.status || 'Verified Clear'}
                        </span>
                      </div>
                      <div className="rera-block-title">{block.title}</div>
                      <div className="rera-block-desc">{block.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: TRANSIT & COMMUTE MATRIX
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'transit' && (
            <div className="dossier-double-bezel">
              <div className="dossier-double-bezel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Navigation size={18} className="text-primary" />
                      <span>Transit, Metro &amp; Strategic Connectivity</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                      Drive times and distance benchmarks to expressways, metro lines, business CBDs &amp; airports.
                    </p>
                  </div>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: 12, gap: 6 }}
                  >
                    <MapPin size={13} />
                    <span>Open in Google Maps</span>
                  </a>
                </div>

                {/* Commute Landmarks Matrix */}
                {commutePoints.length > 0 ? (
                  <div className="commute-matrix-grid" style={{ marginBottom: 24 }}>
                    {commutePoints.map((point, idx) => (
                      <div key={idx} className="commute-landmark-card">
                        <div className="commute-category-icon">
                          <Navigation size={18} />
                        </div>
                        <div>
                          <div className="commute-landmark-name">{point.landmark}</div>
                          <div className="commute-landmark-metrics">
                            ⚡ {point.time_mins} mins drive {point.distance_km ? `(${point.distance_km} km)` : ''}
                          </div>
                          <span style={{ fontSize: 10, background: 'var(--color-muted)', padding: '1px 6px', borderRadius: 4, color: 'var(--color-muted-fg)', textTransform: 'capitalize' }}>
                            {point.category || 'Transit'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 24, borderRadius: 12, background: 'var(--color-muted)', marginBottom: 20, textAlign: 'center' }}>
                    <Navigation size={32} style={{ color: 'var(--color-muted-fg)', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>No Strategic Commute Landmarks Configured</div>
                    <p style={{ margin: '4px auto 0', fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: 400 }}>
                      Add commute milestones (e.g. Rapid Metro, Cyber Hub, IGI Airport) in the listing editor to provide drive-time badges.
                    </p>
                  </div>
                )}

                {/* Location Pin & Address Box */}
                <div style={{ background: 'var(--color-muted)', borderRadius: 12, padding: 16, border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted-fg)' }}>
                        Micro-Market &amp; Address
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                        {property.locality}, {property.city}, India
                      </div>
                    </div>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ height: 34, fontSize: 12, gap: 6 }}
                    >
                      <span>Navigate via GPS</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: GALLERY & MEDIA (Photo Room Tags, 360°, Video)
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'media' && (
            <div className="dossier-double-bezel">
              <div className="dossier-double-bezel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Video size={18} className="text-primary" />
                      <span>Photo Gallery &amp; Virtual Media Hub ({rawImages.length} Photos)</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                      High-resolution visual assets categorized by room and view orientation.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {property.virtual_tour_url && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setVirtualTourModalOpen(true)}
                        style={{ fontSize: 12, gap: 6, color: '#7c3aed', borderColor: '#ddd6fe', background: '#faf5ff' }}
                      >
                        <Compass size={14} />
                        <span>360° Virtual Tour</span>
                      </button>
                    )}

                    {property.video_url && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setVideoModalOpen(true)}
                        style={{ fontSize: 12, gap: 6, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                      >
                        <Video size={14} />
                        <span>Video Tour</span>
                      </button>
                    )}

                    {property.brochure_url && (
                      <a
                        href={property.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: 12, gap: 6, color: 'var(--color-primary)' }}
                      >
                        <FileText size={14} />
                        <span>Brochure PDF</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Room Tag Filters */}
                {uniqueTags.length > 1 && (
                  <div className="gallery-filter-chips no-scrollbar">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`gallery-filter-chip ${activeGalleryTag === tag ? 'active' : ''}`}
                        onClick={() => setActiveGalleryTag(tag)}
                      >
                        {tag} {tag === 'All' ? `(${rawImages.length})` : ''}
                      </button>
                    ))}
                  </div>
                )}

                {/* Photo Grid */}
                <div className="gallery-photo-grid">
                  {filteredImages.map((img, idx) => {
                    const originalIdx = rawImages.indexOf(img);
                    const tag = imageTags[originalIdx] || (originalIdx === 0 ? 'Cover Photo' : 'Gallery Photo');
                    return (
                      <div
                        key={idx}
                        className="gallery-photo-item"
                        onClick={() => {
                          setGalleryActiveIdx(originalIdx);
                          setGalleryModalOpen(true);
                        }}
                        title="Click to view full image in lightbox"
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} />
                        <span className="gallery-photo-tag">{tag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Right Column: Sticky Deal Cockpit ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Asset Deal Card */}
          <div className="dossier-double-bezel">
            <div className="dossier-double-bezel-inner" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-fg)' }}>
                Commercial Valuation
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 2px' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                  {formatINR(property.priceLakhs)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>
                  ({Number(property.priceLakhs).toLocaleString()} Lakhs)
                </span>
              </div>

              {ratePerUnit && (
                <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 16 }}>
                  ₹{ratePerUnit.toLocaleString('en-IN')} per {unitLabel}
                </div>
              )}

              {/* Quick Specs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted-fg)' }}>Asset Type:</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{formattedType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted-fg)' }}>Super Area:</span>
                  <span style={{ fontWeight: 600 }}>{displayArea} {unitLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted-fg)' }}>Possession:</span>
                  <span style={{ fontWeight: 600 }}>{property.possession_timeline || statusLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted-fg)' }}>Facing:</span>
                  <span style={{ fontWeight: 600 }}>{property.facing || 'North-East'}</span>
                </div>
                {property.reraNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-muted-fg)' }}>RERA ID:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {property.reraNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Pitch / Action Island Button */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className="btn-island-primary"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{ width: '100%' }}
                >
                  <span>Pitch Property to Pipeline Lead</span>
                  <span className="btn-island-trailing-icon">
                    <Send size={13} />
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => printSingleProperty(property)}
                  style={{ width: '100%', fontSize: 12, height: 36, gap: 6 }}
                >
                  <Printer size={14} />
                  <span>Download Luxury PDF Dossier</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matched Buyer Leads Box */}
          <div className="dossier-double-bezel">
            <div className="dossier-double-bezel-inner" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} className="text-primary" />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Matching Prospective Buyers</span>
                </div>
                <span style={{ fontSize: 11, background: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  {matchedLeads.length}
                </span>
              </div>

              {matchedLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--color-muted-fg)', fontSize: 12 }}>
                  <Users size={28} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                  <div>No active leads matching this budget &amp; location currently.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matchedLeads.slice(0, 5).map(({ lead, matchScore }) => (
                    <div
                      key={lead.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'var(--color-muted)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.name}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 8,
                            background: matchScore >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                            color: matchScore >= 80 ? 'var(--color-success)' : 'var(--color-primary)'
                          }}>
                            {matchScore}%
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Looking for: {lead.requirements?.bhk || 'Any'} in {lead.requirements?.preferredLocalities?.[0] || property.locality}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleSendToBuyer(lead)}
                        style={{ height: 30, fontSize: 11, padding: '0 10px', gap: 4, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4', flexShrink: 0 }}
                        title="Pitch via WhatsApp"
                      >
                        <Send size={11} />
                        <span>Pitch</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Location & Direct Links Card */}
          <div className="dossier-double-bezel">
            <div className="dossier-double-bezel-inner" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <MapPin size={16} className="text-primary" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Direct Asset Links</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: '100%', height: 34, fontSize: 12, justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} /> Google Maps Direction
                  </span>
                  <ExternalLink size={12} />
                </a>

                {property.brochure_url && (
                  <a
                    href={property.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', height: 34, fontSize: 12, justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={13} /> Property PDF Brochure
                    </span>
                    <Download size={12} />
                  </a>
                )}

                {property.virtual_tour_url && (
                  <a
                    href={property.virtual_tour_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', height: 34, fontSize: 12, justifyContent: 'space-between', color: '#7c3aed' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Compass size={13} /> 360° Virtual Walkthrough
                    </span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Dialog Modals ── */}

      {/* 1. Fullscreen Blueprint Lightbox Modal */}
      <Dialog.Root open={blueprintModalOpen} onOpenChange={setBlueprintModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-backdrop" />
          <Dialog.Content className="modal-content lightbox-modal-content">
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Architectural Blueprint &amp; Layout Plan
                </Dialog.Title>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                  {property.name} {activeVariant ? `— ${activeVariant.name}` : ''}
                </p>
              </div>
              <Dialog.Close asChild>
                <button className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
            <div className="lightbox-image-container">
              {activeBlueprintSrc ? (
                <img src={activeBlueprintSrc} alt="Floor Plan High-Res" />
              ) : null}
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>
                Scale plan inspection
              </span>
              {activeBlueprintSrc && (
                <a
                  href={activeBlueprintSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: 12, height: 32, gap: 6 }}
                >
                  <ExternalLink size={13} />
                  <span>Open Full Size in New Tab</span>
                </a>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 2. Fullscreen Photo Gallery Lightbox */}
      <Dialog.Root open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-backdrop" />
          <Dialog.Content className="modal-content lightbox-modal-content">
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Property Gallery ({galleryActiveIdx + 1} of {rawImages.length})
                </Dialog.Title>
                <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                  {imageTags[galleryActiveIdx] || 'Visual Asset'}
                </span>
              </div>
              <Dialog.Close asChild>
                <button className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
            <div className="lightbox-image-container" style={{ position: 'relative' }}>
              <img src={rawImages[galleryActiveIdx]} alt={`Gallery ${galleryActiveIdx + 1}`} />

              {rawImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryActiveIdx(prev => (prev > 0 ? prev - 1 : rawImages.length - 1))}
                    style={{ position: 'absolute', left: 16, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Previous Photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryActiveIdx(prev => (prev < rawImages.length - 1 ? prev + 1 : 0))}
                    style={{ position: 'absolute', right: 16, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Next Photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 3. 360° Virtual Walkthrough Modal */}
      {property.virtual_tour_url && (
        <Dialog.Root open={virtualTourModalOpen} onOpenChange={setVirtualTourModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="modal-backdrop" />
            <Dialog.Content className="modal-content lightbox-modal-content" style={{ maxWidth: 1000 }}>
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  360° Virtual Walkthrough
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </div>
              <div style={{ height: 540, background: '#000' }}>
                <iframe
                  src={property.virtual_tour_url}
                  title="360 Tour"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="fullscreen; vr"
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* 4. Video Tour Modal */}
      {property.video_url && (
        <Dialog.Root open={videoModalOpen} onOpenChange={setVideoModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="modal-backdrop" />
            <Dialog.Content className="modal-content lightbox-modal-content" style={{ maxWidth: 840 }}>
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Video Walkthrough
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="btn btn-ghost btn-icon" style={{ borderRadius: '50%' }}>
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </div>
              <div style={{ height: 460, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {property.video_url.includes('youtube.com') || property.video_url.includes('youtu.be') ? (
                  <iframe
                    src={property.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Video Walkthrough"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#fff', padding: 20 }}>
                    <p style={{ marginBottom: 12 }}>Open video in external player:</p>
                    <a href={property.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <ExternalLink size={14} style={{ marginRight: 6 }} /> Open Video
                    </a>
                  </div>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* 5. Edit Modal (Integrated) */}
      <PropertyModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingProperty={property}
      />

      {/* 6. Send to Pipeline Lead Modal */}
      <PropertyShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        property={property}
      />

      {/* 7. EMI Calculator Modal */}
      <EmiCalculatorModal
        isOpen={isEmiOpen}
        onClose={() => setIsEmiOpen(false)}
        initialPriceLakhs={property.priceLakhs}
        propertyName={property.name}
      />
    </div>
  );
}
