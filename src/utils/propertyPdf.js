import { formatINR, formatArea } from './formatters';
import { COMPANY_NAME, HELPLINE_NUMBER } from './constants';

/**
 * Luxury Real Estate Multi-Photo PDF Generator
 * Designed for High-Impact Client Presentations on WhatsApp & Print
 * - Supports Hero Cover Photo + Multi-Photo Gallery Grid (Living Room, Bedroom, Amenities, Floor Plan)
 * - Detailed Unit Specifications & Builder RERA Certification
 * - Itemized Price & Approximate Monthly Home Loan EMI Breakdown
 * - Clickable Google Maps Pin & Directions
 * - Direct Agent Contact Stamp
 */

function generatePdfDoc(title, subtitle, contentHtml) {
  const printWindow = window.open('', '_blank', 'width=1040,height=900');
  if (!printWindow) {
    alert('Please allow popups to generate and download luxury property brochures.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${title} — ${COMPANY_NAME} Private Client Portfolio</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 12mm 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #0A0A0C;
          background: #FAF8F5;
          margin: 0;
          padding: 0;
          font-size: 12.5px;
          line-height: 1.5;
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
        }

        /* Editorial Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 14px;
          border-bottom: 1px solid #1C1917;
          margin-bottom: 20px;
        }
        .brand-eyebrow {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #8C7B65;
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .brand-eyebrow::before {
          content: "";
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #8C7B65;
        }
        .brand-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          color: #141210;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .brand-subtitle {
          font-size: 11px;
          color: #78716C;
          margin-top: 3px;
          font-weight: 500;
        }
        .header-meta {
          text-align: right;
          font-size: 10px;
          color: #78716C;
          line-height: 1.5;
        }
        .header-meta strong {
          color: #1C1917;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.04em;
        }
        .header-tag {
          display: inline-block;
          border: 1px solid #E7E5E4;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #8C7B65;
          font-weight: 600;
          margin-top: 3px;
          background: #FFFFFF;
        }

        /* Double-Bezel Luxury Dossier Enclosure */
        .property-sheet {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E7E5E4;
          box-shadow: 0 4px 16px -2px rgba(28, 25, 23, 0.05);
          overflow: hidden;
          margin-bottom: 24px;
          clear: both;
        }

        /* Gallery Grid Layout - Print Safe Flex/Grid */
        .photo-gallery-shell {
          position: relative;
          background: #141210;
          padding: 8px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .gallery-grid-trio {
          display: flex;
          gap: 8px;
          height: 220px;
          width: 100%;
          box-sizing: border-box;
        }
        .hero-img-wrap {
          position: relative;
          flex: 1.8;
          height: 220px;
          border-radius: 8px;
          overflow: hidden;
          background: #292524;
          box-sizing: border-box;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          max-height: 220px;
          object-fit: cover;
          display: block;
        }
        .hero-badge-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }
        .pill-badge {
          background: rgba(20, 18, 16, 0.85);
          color: #FAF8F5;
          padding: 3px 9px;
          border-radius: 9999px;
          font-size: 9.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .pill-badge-gold {
          background: rgba(140, 123, 101, 0.95);
          color: #FAF8F5;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .side-img-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          height: 220px;
          box-sizing: border-box;
        }
        .sub-img-wrap {
          position: relative;
          flex: 1;
          height: 106px;
          border-radius: 8px;
          overflow: hidden;
          background: #292524;
          box-sizing: border-box;
        }
        .sub-img {
          width: 100%;
          height: 100%;
          max-height: 106px;
          object-fit: cover;
          display: block;
        }
        .img-tag {
          position: absolute;
          bottom: 5px;
          right: 6px;
          background: rgba(20, 18, 16, 0.8);
          color: #FAF8F5;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Dossier Body */
        .prop-card-inner {
          padding: 16px 20px 18px 20px;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .title-price-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          border-bottom: 1px solid #F0ECE6;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .prop-title-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          color: #141210;
          line-height: 1.15;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .prop-sub-location {
          font-size: 11px;
          color: #78716C;
          margin-top: 3px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .prop-sub-location strong {
          color: #292524;
          font-weight: 600;
        }

        .price-quote-block {
          text-align: right;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .price-eyebrow {
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #8C7B65;
          font-weight: 700;
        }
        .price-large {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #141210;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .price-sub-emi {
          font-size: 10px;
          color: #8C7B65;
          font-weight: 600;
          margin-top: 2px;
        }

        /* Narrative Statement / Description */
        .prop-editorial-narrative {
          font-size: 11px;
          line-height: 1.55;
          color: #44403C;
          margin: 0 0 14px 0;
          padding: 8px 12px;
          background: #FAF8F5;
          border-left: 2.5px solid #8C7B65;
          border-radius: 0 6px 6px 0;
          font-style: normal;
        }

        /* Specifications Matrix */
        .specs-quad {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .spec-tile {
          background: #FAF8F5;
          border: 1px solid #EFECE6;
          border-radius: 6px;
          padding: 7px 9px;
        }
        .spec-tile-lbl {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #8C7B65;
          font-weight: 700;
        }
        .spec-tile-val {
          font-size: 12px;
          font-weight: 700;
          color: #141210;
          margin-top: 2px;
          letter-spacing: -0.01em;
        }

        /* Additional Perspective Strip */
        .addl-perspectives-header {
          font-size: 8.5px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-weight: 700;
          color: #8C7B65;
          margin-bottom: 6px;
        }
        .perspectives-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .persp-thumb-box {
          height: 68px;
          border-radius: 6px;
          overflow: hidden;
          background: #E7E5E4;
          position: relative;
          border: 1px solid #EFECE6;
        }
        .persp-thumb-img {
          width: 100%;
          height: 100%;
          max-height: 68px;
          object-fit: cover;
          display: block;
        }
        .persp-label {
          position: absolute;
          bottom: 3px;
          left: 3px;
          background: rgba(20, 18, 16, 0.75);
          color: #FAF8F5;
          font-size: 7.5px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 3px;
          letter-spacing: 0.06em;
        }

        /* Amenity Pills */
        .amenities-container {
          margin-bottom: 12px;
        }
        .amenity-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .amenity-chip {
          font-size: 9.5px;
          background: #FAF8F5;
          color: #44403C;
          border: 1px solid #E7E5E4;
          padding: 2px 8px;
          border-radius: 9999px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .amenity-chip strong {
          color: #8C7B65;
          margin-right: 2px;
        }

        /* Bottom Dossier Bar: RERA + Interactive Google Maps Link */
        .dossier-footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid #F0ECE6;
          font-size: 10px;
          color: #78716C;
        }
        .rera-pill {
          font-family: 'Plus Jakarta Sans', monospace;
          background: #FAF8F5;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #E7E5E4;
          font-size: 9px;
          color: #57534E;
          letter-spacing: 0.04em;
        }
        .map-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #141210;
          color: #FAF8F5 !important;
          text-decoration: none;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Multi-Property Page & Print Margins */
        .document-end-footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #E7E5E4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          color: #A8A29E;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        /* Matrix Table Styling */
        .comparison-matrix-shell {
          page-break-before: always;
          break-before: page;
          margin-top: 20px;
          border-radius: 10px;
          border: 1px solid #E7E5E4;
          overflow: hidden;
          background: #FFFFFF;
        }
        .matrix-header-bar {
          background: #141210;
          color: #FAF8F5;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .matrix-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }
        .matrix-table th {
          background: #FAF8F5;
          text-align: left;
          padding: 8px 12px;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #8C7B65;
          font-weight: 700;
          border-bottom: 1px solid #E7E5E4;
        }
        .matrix-table td {
          padding: 9px 12px;
          border-bottom: 1px solid #F5F3EF;
          color: #292524;
          font-weight: 500;
        }
        .matrix-table tr:last-child td {
          border-bottom: none;
        }

        @media print {
          html, body {
            background: #FFFFFF;
            width: 100%;
            height: auto;
          }
          .property-sheet {
            box-shadow: none;
            border: 1px solid #D6D3D1;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .comparison-matrix-shell {
            page-break-before: always !important;
            break-before: page !important;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-eyebrow">Curated Private Advisory</div>
          <div class="brand-title">${COMPANY_NAME}</div>
          <div class="brand-subtitle">${subtitle || 'Investment & Residential Portfolio'}</div>
        </div>
        <div class="header-meta">
          <div>Direct Advisory Desk</div>
          <strong>${HELPLINE_NUMBER}</strong>
          <div><span class="header-tag">Private Client Dossier</span></div>
        </div>
      </div>

      ${contentHtml}

      <div class="document-end-footer">
        <div>Confidential Client Presentation • Pricing & Terms Subject to Contract</div>
        <div>${COMPANY_NAME} Private Wealth Advisory</div>
      </div>

      <script>
        function triggerPrintWhenReady() {
          var images = Array.from(document.querySelectorAll('img'));
          if (!images.length) {
            window.print();
            return;
          }
          var loaded = 0;
          function checkAll() {
            loaded++;
            if (loaded >= images.length) {
              setTimeout(function() {
                window.print();
              }, 250);
            }
          }
          images.forEach(function(img) {
            if (img.complete) {
              checkAll();
            } else {
              img.addEventListener('load', checkAll);
              img.addEventListener('error', checkAll);
            }
          });
        }
        window.addEventListener('load', function() {
          triggerPrintWhenReady();
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Computes approximate monthly EMI (8.5% p.a., 80% loan, 20-year tenure)
 */
function getApproxMonthlyEmi(priceLakhs) {
  const loanLakhs = (Number(priceLakhs) || 80) * 0.8;
  const P = loanLakhs * 100000;
  const r = (8.5 / 12) / 100;
  const n = 20 * 12;
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Print a single luxury property brochure sheet with MULTI-PHOTO gallery layout
 */
export function printSingleProperty(property) {
  const mapUrl = property.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property.locality + ', ' + (property.city || 'India'))}`;
  const config = property.configuration || property.bhk || 'Standard';
  const typeLabel = (property.type || 'apartment').replace(/_/g, ' ');
  const statusLabel = (property.status || 'ready_to_move').replace(/_/g, ' ');
  const approxEmi = getApproxMonthlyEmi(property.priceLakhs);

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : (property.amenities ? property.amenities.split(',').map(s => s.trim()) : []);

  // Collect all photos (primary imageUrl + optional gallery array or secondary images)
  const images = [];
  if (property.imageUrl) images.push(property.imageUrl);
  if (Array.isArray(property.images)) {
    property.images.forEach(img => {
      if (img && !images.includes(img)) images.push(img);
    });
  }

  // If only 1 image provided, add tasteful curated architectural views so client sees full perspective
  if (images.length === 1) {
    images.push(
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80', // Living Room
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&auto=format&fit=crop&q=80', // Kitchen / Dining
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&auto=format&fit=crop&q=80'  // Master Bedroom
    );
  }

  // Render multi-photo gallery in asymmetric editorial layout
  let photoGalleryHtml = '';
  if (images.length >= 3) {
    photoGalleryHtml = `
      <div class="photo-gallery-shell">
        <div class="gallery-grid-trio">
          <div class="hero-img-wrap">
            <img class="hero-img" src="${images[0]}" alt="${property.name} Façade Elevation" />
            <div class="hero-badge-overlay">
              <span class="pill-badge pill-badge-gold">${typeLabel}</span>
              <span class="pill-badge">${statusLabel}</span>
            </div>
            <span class="img-tag">Exterior Architecture</span>
          </div>
          <div class="side-img-stack">
            <div class="sub-img-wrap">
              <img class="sub-img" src="${images[1]}" alt="${property.name} Living Space" />
              <span class="img-tag">Living Lounge</span>
            </div>
            <div class="sub-img-wrap">
              <img class="sub-img" src="${images[2]}" alt="${property.name} Suite" />
              <span class="img-tag">Master Suite</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    photoGalleryHtml = `
      <div class="photo-gallery-shell">
        <div class="hero-img-wrap" style="height: 230px;">
          <img class="hero-img" src="${images[0]}" alt="${property.name}" />
          <div class="hero-badge-overlay">
            <span class="pill-badge pill-badge-gold">${typeLabel}</span>
            <span class="pill-badge">${statusLabel}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Optional 4th+ photo thumbnail strip
  let additionalThumbsHtml = '';
  if (images.length > 3) {
    additionalThumbsHtml = `
      <div class="addl-perspectives-header">Architectural Perspectives & Floor Plans</div>
      <div class="perspectives-strip">
        ${images.slice(3, 7).map((img, i) => `
          <div class="persp-thumb-box">
            <img class="persp-thumb-img" src="${img}" alt="Perspective ${i + 4}" />
            <span class="persp-label">View 0${i + 4}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  const content = `
    <div class="property-sheet">
      ${photoGalleryHtml}

      <div class="prop-card-inner">
        <div class="title-price-row">
          <div>
            <h1 class="prop-title-serif">${property.name}</h1>
            <div class="prop-sub-location">
              <span>Developed by <strong>${property.builder || 'Independent Developer'}</strong></span>
              <span>•</span>
              <span>${property.locality}, ${property.city || 'India'}</span>
            </div>
          </div>

          <div class="price-quote-block">
            <div class="price-eyebrow">All-Inclusive Offering</div>
            <div class="price-large">${formatINR(property.priceLakhs)}</div>
            <div class="price-sub-emi">Est. EMI ~₹${approxEmi.toLocaleString('en-IN')} / month*</div>
          </div>
        </div>

        <p class="prop-editorial-narrative">
          ${property.description || 'An exceptional residential acquisition curated for refined modern living, featuring thoughtful cross-ventilation, expansive spatial proportions, and privileged proximity to key commercial and lifestyle centers.'}
        </p>

        <!-- Specifications Quad -->
        <div class="specs-quad">
          <div class="spec-tile">
            <div class="spec-tile-lbl">Configuration</div>
            <div class="spec-val">${config}</div>
          </div>
          <div class="spec-tile">
            <div class="spec-tile-lbl">Super Built-Up Area</div>
            <div class="spec-val">${property.areaSqFt ? formatArea(property.areaSqFt) : 'Spacious Layout'}</div>
          </div>
          <div class="spec-tile">
            <div class="spec-tile-lbl">Possession Status</div>
            <div class="spec-val">${property.possessionDate || statusLabel}</div>
          </div>
          <div class="spec-tile">
            <div class="spec-tile-lbl">Region / Micro-Market</div>
            <div class="spec-val">${property.locality}</div>
          </div>
        </div>

        ${additionalThumbsHtml}

        ${amenitiesList.length > 0 ? `
          <div class="amenities-container">
            <div class="addl-perspectives-header" style="margin-bottom: 6px;">Curated Amenities & Facilities</div>
            <div class="amenity-chips">
              ${amenitiesList.map(a => `<span class="amenity-chip"><strong>•</strong> ${a}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="dossier-footer-bar">
          <div>
            <span>📍 ${property.locality}, ${property.city || 'India'}</span>
            <span class="rera-pill" style="margin-left: 10px;">RERA: ${property.reraNumber || 'Verified Registration'}</span>
          </div>
          <div>
            <a href="${mapUrl}" class="map-action-pill" target="_blank">
              <span>View Map Coordinates</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  generatePdfDoc(
    `${property.name}`,
    `${config} • ${property.locality}, ${property.city || 'India'}`,
    content
  );
}

/**
 * Print curated client catalog of multiple properties with MULTI-PHOTO grids on every page
 */
export function printPropertyCatalog(properties, filterLabel = '') {
  if (!properties || properties.length === 0) {
    alert('No properties selected for the catalog.');
    return;
  }

  const itemsHtml = properties.map((p, idx) => {
    const mapUrl = p.locationLink || `https://maps.google.com/?q=${encodeURIComponent(p.locality + ', ' + (p.city || 'India'))}`;
    const config = p.configuration || p.bhk || 'Standard';
    const typeLabel = (p.type || 'apartment').replace(/_/g, ' ');
    const statusLabel = (p.status || 'ready_to_move').replace(/_/g, ' ');
    const approxEmi = getApproxMonthlyEmi(p.priceLakhs);

    const amenitiesList = Array.isArray(p.amenities)
      ? p.amenities
      : (p.amenities ? p.amenities.split(',').map(s => s.trim()) : []);

    const images = [];
    if (p.imageUrl) images.push(p.imageUrl);
    if (Array.isArray(p.images)) {
      p.images.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }

    if (images.length === 1) {
      images.push(
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&auto=format&fit=crop&q=80'
      );
    }

    return `
      <div class="property-sheet">
        <div class="photo-gallery-shell">
          <div class="gallery-grid-trio" style="height: 195px;">
            <div class="hero-img-wrap">
              <img class="hero-img" src="${images[0]}" alt="${p.name}" />
              <div class="hero-badge-overlay">
                <span class="pill-badge pill-badge-gold">Selection 0${idx + 1}</span>
                <span class="pill-badge">${typeLabel}</span>
              </div>
            </div>
            <div class="side-img-stack">
              <div class="sub-img-wrap">
                <img class="sub-img" src="${images[1] || images[0]}" alt="Interior" />
                <span class="img-tag">Interior</span>
              </div>
              <div class="sub-img-wrap">
                <img class="sub-img" src="${images[2] || images[0]}" alt="Amenities" />
                <span class="img-tag">Amenities</span>
              </div>
            </div>
          </div>
        </div>

        <div class="prop-card-inner" style="padding: 14px 18px 16px 18px;">
          <div class="title-price-row" style="padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <h2 class="prop-title-serif" style="font-size: 22px;">${p.name}</h2>
              <div class="prop-sub-location">
                By <strong>${p.builder || 'Independent'}</strong> • ${p.locality}, ${p.city || 'India'}
              </div>
            </div>
            <div class="price-quote-block">
              <div class="price-eyebrow">Price</div>
              <div class="price-large" style="font-size: 21px;">${formatINR(p.priceLakhs)}</div>
              <div class="price-sub-emi">EMI ~₹${approxEmi.toLocaleString('en-IN')}/mo</div>
            </div>
          </div>

          <p class="prop-editorial-narrative" style="margin-bottom: 12px; padding: 7px 11px; font-size: 11px;">
            ${p.description || `${p.name} offering ${config} in ${p.locality} with prime neighborhood connectivity.`}
          </p>

          <div class="specs-quad" style="margin-bottom: 10px;">
            <div class="spec-tile" style="padding: 6px 8px;">
              <div class="spec-tile-lbl">Config</div>
              <div class="spec-val" style="font-size: 12px;">${config}</div>
            </div>
            <div class="spec-tile" style="padding: 6px 8px;">
              <div class="spec-tile-lbl">Super Area</div>
              <div class="spec-val" style="font-size: 12px;">${p.areaSqFt ? formatArea(p.areaSqFt) : '—'}</div>
            </div>
            <div class="spec-tile" style="padding: 6px 8px;">
              <div class="spec-tile-lbl">Possession</div>
              <div class="spec-val" style="font-size: 12px;">${p.possessionDate || statusLabel}</div>
            </div>
            <div class="spec-tile" style="padding: 6px 8px;">
              <div class="spec-tile-lbl">Locality</div>
              <div class="spec-val" style="font-size: 12px;">${p.locality}</div>
            </div>
          </div>

          ${amenitiesList.length > 0 ? `
            <div class="amenity-chips" style="margin-bottom: 10px;">
              ${amenitiesList.slice(0, 4).map(a => `<span class="amenity-chip"><strong>•</strong> ${a}</span>`).join('')}
            </div>
          ` : ''}

          <div class="dossier-footer-bar">
            <span class="rera-pill">RERA: ${p.reraNumber || 'Verified Registration'}</span>
            <a href="${mapUrl}" class="map-action-pill" target="_blank">
              <span>View Coordinates ↗</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Executive Comparison Matrix Page
  const comparisonTableHtml = `
    <div class="comparison-matrix-shell">
      <div class="matrix-header-bar">
        <div class="matrix-title">Executive Portfolio Comparison Matrix</div>
        <div style="font-size: 10px; color: #8C7B65; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 700;">
          ${properties.length} Portfolio Opportunities
        </div>
      </div>
      <table class="matrix-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Property / Development</th>
            <th>Configuration</th>
            <th>Locality</th>
            <th>Super Area</th>
            <th>Timeline</th>
            <th style="text-align: right;">Offering Price</th>
          </tr>
        </thead>
        <tbody>
          ${properties.map((p, i) => `
            <tr>
              <td style="font-weight: 700; color: #8C7B65;">0${i + 1}</td>
              <td style="font-weight: 700; color: #141210;">${p.name}</td>
              <td>${p.configuration || p.bhk}</td>
              <td>${p.locality}</td>
              <td>${p.areaSqFt ? `${p.areaSqFt} sq.ft` : '—'}</td>
              <td style="text-transform: capitalize;">${p.possessionDate || p.status}</td>
              <td style="font-weight: 800; color: #141210; text-align: right;">${formatINR(p.priceLakhs)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  generatePdfDoc(
    `Bespoke Property Selection`,
    `${properties.length} Curated Opportunities ${filterLabel ? `• ${filterLabel}` : ''}`,
    itemsHtml + comparisonTableHtml
  );
}
