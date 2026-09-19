import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { formatINR, formatArea } from '../utils/formatters';
import { PropertyModal } from '../components/PropertyModal';
import { PropertyShareModal } from '../components/PropertyShareModal';
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
  Calculator
} from 'lucide-react';
import { printSingleProperty } from '../utils/propertyPdf';
import { useLeadStore } from '../store/leadStore';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import { findMatchingLeads } from '../utils/matchingEngine';
import { EmiCalculatorModal } from '../components/EmiCalculatorModal';

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = usePropertyStore();
  const { leads } = useLeadStore();
  const { currentUser } = useAuthStore();
  const property = getProperty(id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  // Find interested buyers whose requirements match this property
  const matchedLeads = property ? findMatchingLeads(property, leads) : [];

  const handleSendToBuyer = (lead) => {
    const mapUrl = property.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property.locality + ', ' + (property.city || 'India'))}`;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${lead.name}, I found an ideal match for your property requirement:\n\n` +
      `🏡 *${property.name}* (${property.configuration || property.bhk})\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `💰 Price: ${formatINR(property.priceLakhs)} | Super Area: ${property.areaSqFt ? property.areaSqFt + ' sq.ft' : 'Spacious'}\n` +
      `🗺️ Location: ${mapUrl}\n\n` +
      `Can we schedule a quick site visit for you?`;

    useActivityStore.getState().logActivity(
      lead.id,
      currentUser?.id,
      'WHATSAPP_SENT',
      `Shared property "${property.name}" via WhatsApp from Inventory Dossier`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!property) {
    return (
      <div className="page" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <h2 className="text-h2" style={{ marginBottom: 12 }}>Property Not Found</h2>
        <p className="text-muted" style={{ marginBottom: 20 }}>The requested property listing could not be found or has been removed.</p>
        <Link to="/app/properties" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Inventory
        </Link>
      </div>
    );
  }

  const mapUrl = property.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property.locality + ', ' + (property.city || 'India'))}`;

  const handleShare = async () => {
    const shareText = `🏡 *${property.name}* by ${property.builder || 'Builder'}\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `📐 Config: ${property.configuration || property.bhk} (${property.areaSqFt ? property.areaSqFt + ' sq.ft' : 'Spacious'})\n` +
      `💰 Price: ${formatINR(property.priceLakhs)}\n` +
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
        // User cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setShareFeedback('Listing copied to clipboard!');
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
      `💰 ${formatINR(property.priceLakhs)} | ${property.areaSqFt ? property.areaSqFt + ' sq.ft' : ''}\n` +
      `🗺️ Map: ${mapUrl}\n` +
      `More info: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${property.name}"?`)) {
      deleteProperty(property.id);
      navigate('/app/properties');
    }
  };

  const formattedType = (property.type || 'property').replace(/_/g, ' ');
  const statusLabel = (property.status || 'ready_to_move').replace(/_/g, ' ');

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
        <Link
          to="/app/properties"
          className="btn btn-ghost"
          style={{ paddingLeft: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={18} />
          <span>Back to Inventory</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {shareFeedback && (
            <span style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> {shareFeedback}
            </span>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => printSingleProperty(property)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: '#2563EB', color: '#2563EB' }}
            title="Download or print luxury PDF property brochure"
          >
            <Printer size={16} />
            <span>Download PDF Brochure</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEmiOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}
            title="Calculate monthly home loan EMI for this property"
          >
            <Calculator size={15} />
            <span>Calculate EMI</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsShareModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
            title="Pick a lead from pipeline to send this property via WhatsApp"
          >
            <Send size={15} />
            <span>Send to Lead</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleWhatsAppShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
            title="Share via WhatsApp"
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleShare}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Copy share link & summary"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Copied!' : 'Share Listing'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleDelete}
            style={{ color: 'var(--color-destructive)' }}
            title="Delete property"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero card / Showcase banner */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
        <div style={{ position: 'relative', height: 320, width: '100%', backgroundColor: 'var(--color-muted)' }}>
          <img
            src={property.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80'}
            alt={property.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)'
          }} />

          {/* Badges on hero image */}
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(15,23,42,0.75)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 20,
              textTransform: 'capitalize',
              letterSpacing: '0.3px'
            }}>
              {formattedType}
            </span>
            <span style={{
              background: property.status === 'ready_to_move' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 20,
              textTransform: 'capitalize'
            }}>
              {statusLabel}
            </span>
          </div>

          {/* Property Name & Highlights over banner */}
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                {property.name}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                By <strong style={{ color: '#fff' }}>{property.builder || 'Independent'}</strong> • {property.locality}, {property.city}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Quote</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#38BDF8' }}>
                {formatINR(property.priceLakhs)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Main Info + Side details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left column: Key Specs & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Quick Stats bar */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="text-h3" style={{ marginBottom: 16 }}>Configuration & Dimensions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-muted)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={14} /> Type
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, textTransform: 'capitalize' }}>
                  {formattedType}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-muted)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Layers size={14} /> Configuration
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                  {property.configuration || property.bhk || '—'}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-muted)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>Super Built-up Area</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                  {property.areaSqFt ? formatArea(property.areaSqFt) : '—'}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-muted)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> Possession
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                  {property.possessionDate || statusLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="text-h3" style={{ marginBottom: 12 }}>Property Overview</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-fg)', margin: 0 }}>
              {property.description || `${property.name} is a prime ${formattedType} offering situated in ${property.locality}, ${property.city}. Featuring modern amenities, excellent connectivity, and thoughtfully planned ${property.configuration || property.bhk} layout.`}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="text-h3" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} className="text-primary" /> Key Amenities
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(Array.isArray(property.amenities) ? property.amenities : property.amenities.split(',')).map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--color-muted)',
                      color: 'var(--color-fg)',
                      fontSize: 13,
                      padding: '6px 12px',
                      borderRadius: 'var(--border-radius-full)',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    ✓ {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery (Multi-photo showcase) */}
          {((property.images && property.images.length > 0) || property.imageUrl) && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="text-h3" style={{ margin: 0 }}>
                  Photo Gallery ({property.images?.length || (property.imageUrl ? 1 : 0)})
                </h3>
                <button
                  type="button"
                  onClick={() => printSingleProperty(property)}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: '4px 8px', height: 'auto', color: 'var(--color-primary)' }}
                >
                  <Printer size={13} style={{ marginRight: 4 }} /> Print Luxury Multi-Photo PDF
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {(property.images && property.images.length > 0 ? property.images : [property.imageUrl]).map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: 100,
                      borderRadius: 8,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-muted)'
                    }}
                    onClick={() => window.open(img, '_blank')}
                    title="Click to view full image in new tab"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#fff',
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 600
                    }}>
                      {idx === 0 ? 'Cover' : `Photo ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="text-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} className="text-primary" />
                <span>Matching Prospective Buyers ({matchedLeads.length})</span>
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Ranked by Budget & Preference</span>
            </div>

            {matchedLeads.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', margin: 0 }}>
                No active leads currently looking for this configuration/budget. New inbound leads will appear here automatically.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchedLeads.slice(0, 5).map(({ lead, matchScore }) => (
                  <div
                    key={lead.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--color-muted)',
                      gap: 10
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{lead.name}</span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 10,
                          background: matchScore >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                          color: matchScore >= 80 ? 'var(--color-success)' : 'var(--color-primary)'
                        }}>
                          {matchScore}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                        Looking for: {lead.requirements.bhk || 'Any'} in {lead.requirements.preferredLocalities?.join(', ') || 'Any Area'}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSendToBuyer(lead)}
                      style={{ height: 30, fontSize: 12, padding: '0 10px', gap: 4, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                      title="Send this property to lead via WhatsApp"
                    >
                      <Send size={12} />
                      <span>Pitch</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Location & Legal / Action widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Location & Navigation Link */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="text-h3" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} className="text-primary" /> Location & Map
            </h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{property.locality}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>{property.city}, India</div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={16} />
            </a>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-muted-fg)', wordBreak: 'break-all' }}>
              Link: <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{mapUrl}</a>
            </div>
          </div>

          {/* RERA & Compliance */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 className="text-h3" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} className="text-success" /> RERA & Regulatory
            </h3>

            <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>Registered RERA ID</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {property.reraNumber || 'Verification in progress / Applied'}
            </div>

            <div style={{ marginTop: 16, padding: 12, borderRadius: 6, background: 'var(--color-muted)', fontSize: 12, color: 'var(--color-muted-fg)', lineHeight: 1.4 }}>
              💡 Share this property directly with prospective leads in your pipeline to accelerate site visits.
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <PropertyModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingProperty={property}
      />

      {/* 1-Click Send to Pipeline Lead Modal */}
      <PropertyShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        property={property}
      />

      {/* Instant Property EMI Calculator */}
      <EmiCalculatorModal
        isOpen={isEmiOpen}
        onClose={() => setIsEmiOpen(false)}
        initialPriceLakhs={property.priceLakhs}
        propertyName={property.name}
      />
    </div>
  );
}
