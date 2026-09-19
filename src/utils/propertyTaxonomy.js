// Property Taxonomy and dynamic configurations for CRM & Website parity
// Exact match with TGV Estates website architecture

export const ASSET_CATEGORIES = [
  // Residential
  { id: "residential", name: "Apartment / High-Rise", group: "Residential", defaultBedrooms: 3 },
  { id: "villa", name: "Luxury Villa / Bungalow", group: "Residential", defaultBedrooms: 4 },
  { id: "penthouse", name: "Penthouse / Sky Villa", group: "Residential", defaultBedrooms: 4 },
  { id: "builder_floor", name: "Independent Builder Floor", group: "Residential", defaultBedrooms: 3 },
  { id: "studio", name: "Studio / Serviced Apartment", group: "Residential", defaultBedrooms: 1 },

  // Commercial
  { id: "commercial", name: "Commercial Office / IT Park", group: "Commercial", defaultBedrooms: 0 },
  { id: "retail", name: "High-Street Retail / Showroom", group: "Commercial", defaultBedrooms: 0 },
  { id: "sco", name: "SCO Plot (Shop-Cum-Office)", group: "Commercial", defaultBedrooms: 0 },
  { id: "coworking", name: "Co-Working & Managed Office", group: "Commercial", defaultBedrooms: 0 },

  // Mixed-Use (Commercial + Residential)
  { id: "mixed_use", name: "Mixed-Use Development", group: "Commercial", defaultBedrooms: 2 },
  { id: "live_work", name: "Live-Work Unit / SOHO", group: "Commercial", defaultBedrooms: 1 },

  // Plots & Land
  { id: "plot", name: "Residential Plot / Land", group: "Plots & Land", defaultBedrooms: 0 },
  { id: "land", name: "General Land Parcel", group: "Plots & Land", defaultBedrooms: 0 },
  { id: "mixed_use_land", name: "Mixed-Use Land (MLU Plot)", group: "Plots & Land", defaultBedrooms: 0 },
  { id: "commercial_land", name: "Commercial & Institutional Land", group: "Plots & Land", defaultBedrooms: 0 },
  { id: "farmhouse_land", name: "Farmhouse Land", group: "Plots & Land", defaultBedrooms: 0 },
  { id: "agricultural", name: "Agricultural / Farm Land", group: "Plots & Land", defaultBedrooms: 0 },

  // Luxury Estates
  { id: "farmhouse", name: "Luxury Farmhouse & Estate", group: "Luxury Estates", defaultBedrooms: 4 },

  // Industrial
  { id: "warehouse", name: "Industrial & Warehousing", group: "Industrial", defaultBedrooms: 0 },
];

export const CONFIGURATIONS_BY_CATEGORY = {
  residential: [
    { label: "1 BHK", bedrooms: 1 },
    { label: "2 BHK", bedrooms: 2 },
    { label: "2.5 BHK", bedrooms: 2 },
    { label: "3 BHK", bedrooms: 3 },
    { label: "3.5 BHK", bedrooms: 3 },
    { label: "4 BHK", bedrooms: 4 },
    { label: "4.5 BHK", bedrooms: 4 },
    { label: "5+ BHK", bedrooms: 5 },
    { label: "Duplex Apartment", bedrooms: 4 },
  ],
  villa: [
    { label: "3 BHK Villa", bedrooms: 3 },
    { label: "4 BHK Luxury Villa", bedrooms: 4 },
    { label: "5 BHK Estate Villa", bedrooms: 5 },
    { label: "6+ BHK Mansion", bedrooms: 6 },
    { label: "Triplex Villa", bedrooms: 5 },
  ],
  penthouse: [
    { label: "3 BHK Sky Suite", bedrooms: 3 },
    { label: "4 BHK Duplex Penthouse", bedrooms: 4 },
    { label: "5 BHK Triplex Penthouse", bedrooms: 5 },
    { label: "Iconic Sky Villa with Pool", bedrooms: 5 },
  ],
  builder_floor: [
    { label: "2 BHK Floor", bedrooms: 2 },
    { label: "3 BHK Luxury Floor", bedrooms: 3 },
    { label: "4 BHK Full Floor", bedrooms: 4 },
    { label: "5 BHK Duplex Floor", bedrooms: 5 },
  ],
  studio: [
    { label: "Studio 1 RK", bedrooms: 1 },
    { label: "1 BHK Studio Suite", bedrooms: 1 },
    { label: "Serviced 1 BHK", bedrooms: 1 },
  ],
  commercial: [
    { label: "Bare Shell Office Plate", bedrooms: 0 },
    { label: "Warm Shell Office (HVAC + Ceiling)", bedrooms: 0 },
    { label: "Plug & Play (10 - 30 Seats)", bedrooms: 0 },
    { label: "Corporate Office (50 - 100 Seats)", bedrooms: 0 },
    { label: "HQ Whole Floorplate (200+ Seats)", bedrooms: 0 },
  ],
  retail: [
    { label: "Ground Floor High-Street Retail", bedrooms: 0 },
    { label: "Anchor Retail Showroom", bedrooms: 0 },
    { label: "Corner Retail Shop", bedrooms: 0 },
    { label: "Food Court / QSR Space", bedrooms: 0 },
  ],
  sco: [
    { label: "SCO Plot (Basement + G + 4)", bedrooms: 0 },
    { label: "Commercial SCO Booth", bedrooms: 0 },
    { label: "Pre-Leased SCO Building", bedrooms: 0 },
  ],
  coworking: [
    { label: "Private Dedicated Team Cabin", bedrooms: 0 },
    { label: "Custom Enterprise Managed Office", bedrooms: 0 },
  ],
  mixed_use: [
    { label: "Ground Retail + Residential Above", bedrooms: 2 },
    { label: "Commercial-cum-Residential Suite", bedrooms: 2 },
    { label: "Mixed-Use Tower Floorplate", bedrooms: 0 },
    { label: "Studio / Office Dual-Purpose", bedrooms: 1 },
  ],
  live_work: [
    { label: "1 BHK Live-Work Studio", bedrooms: 1 },
    { label: "2 BHK Executive SOHO Suite", bedrooms: 2 },
    { label: "Loft Live-Work Workspace", bedrooms: 1 },
    { label: "Duplex Studio / Professional Office", bedrooms: 2 },
  ],
  plot: [
    { label: "100 - 150 Sq.Yds (Gaj)", bedrooms: 0 },
    { label: "180 - 250 Sq.Yds", bedrooms: 0 },
    { label: "300 - 500 Sq.Yds", bedrooms: 0 },
    { label: "1,000+ Sq.Yds (Kanal)", bedrooms: 0 },
    { label: "Gated Township Villa Plot", bedrooms: 0 },
  ],
  land: [
    { label: "500 - 1,000 Sq.Yds Land Parcel", bedrooms: 0 },
    { label: "1 - 2 Acres Land", bedrooms: 0 },
    { label: "2 - 5 Acres Development Land", bedrooms: 0 },
    { label: "5 - 10 Acres Land Parcel", bedrooms: 0 },
    { label: "10+ Acres Mega Land Parcel", bedrooms: 0 },
  ],
  mixed_use_land: [
    { label: "Mixed Land Use Plot (500 - 1,000 Sq.Yds)", bedrooms: 0 },
    { label: "Commercial + Residential Zoned Land", bedrooms: 0 },
    { label: "1 - 3 Acres Mixed-Use Township Parcel", bedrooms: 0 },
    { label: "Main Highway Mixed Land Use Parcel", bedrooms: 0 },
    { label: "5+ Acres Integrated Development Land", bedrooms: 0 },
  ],
  commercial_land: [
    { label: "Commercial Plot (500 - 1,000 Sq.Yds)", bedrooms: 0 },
    { label: "Institutional / School Plot", bedrooms: 0 },
    { label: "Hotel / Hospital Land Parcel", bedrooms: 0 },
    { label: "2 - 10 Acres Commercial Land", bedrooms: 0 },
  ],
  farmhouse_land: [
    { label: "1 Acre Farmhouse Land Parcel", bedrooms: 0 },
    { label: "1.5 - 2 Acres Farmhouse Land", bedrooms: 0 },
    { label: "2.5 - 5 Acres Country Farm Parcel", bedrooms: 0 },
    { label: "5+ Acres Gated Farmhouse Land", bedrooms: 0 },
    { label: "Custom Land Parcel (Bigha / Kanal)", bedrooms: 0 },
  ],
  agricultural: [
    { label: "1 - 2 Acres Farm Land", bedrooms: 0 },
    { label: "2 - 5 Acres Agricultural Land", bedrooms: 0 },
    { label: "5+ Acres Farm Estate", bedrooms: 0 },
  ],
  farmhouse: [
    { label: "1 Acre Gated Farmhouse", bedrooms: 4 },
    { label: "2.5 Acre Country Estate", bedrooms: 5 },
    { label: "4 BHK Pool Farmhouse", bedrooms: 4 },
    { label: "5+ BHK Luxury Country Villa", bedrooms: 5 },
  ],
  warehouse: [
    { label: "10,000 - 25,000 Sq.Ft Industrial Shed", bedrooms: 0 },
    { label: "50,000+ Sq.Ft Logistics Warehouse", bedrooms: 0 },
    { label: "Cold Storage Facility", bedrooms: 0 },
  ],
};

export const CITIES_BY_REGION = [
  {
    region: "Delhi NCR",
    cities: [
      { name: "Gurgaon", state: "Haryana" },
      { name: "Noida", state: "Uttar Pradesh" },
      { name: "Greater Noida", state: "Uttar Pradesh" },
      { name: "Delhi", state: "Delhi" },
      { name: "Ghaziabad", state: "Uttar Pradesh" },
      { name: "Faridabad", state: "Haryana" },
    ],
  },
  {
    region: "North India",
    cities: [
      { name: "Chandigarh", state: "Punjab / Haryana" },
      { name: "Jaipur", state: "Rajasthan" },
      { name: "Dehradun", state: "Uttarakhand" },
      { name: "Ayodhya", state: "Uttar Pradesh" },
      { name: "Lucknow", state: "Uttar Pradesh" },
    ],
  },
  {
    region: "West India",
    cities: [
      { name: "Mumbai", state: "Maharashtra" },
      { name: "Navi Mumbai", state: "Maharashtra" },
      { name: "Thane", state: "Maharashtra" },
      { name: "Pune", state: "Maharashtra" },
      { name: "Goa", state: "Goa" },
      { name: "Ahmedabad", state: "Gujarat" },
    ],
  },
  {
    region: "South India",
    cities: [
      { name: "Bengaluru", state: "Karnataka" },
      { name: "Hyderabad", state: "Telangana" },
      { name: "Chennai", state: "Tamil Nadu" },
      { name: "Kochi", state: "Kerala" },
    ],
  },
  {
    region: "East India",
    cities: [
      { name: "Kolkata", state: "West Bengal" },
      { name: "Bhubaneswar", state: "Odisha" },
    ],
  },
];

export function getAssetArchetype(propertyType = "", title = "") {
  const pType = (propertyType || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (
    pType === "plot" ||
    pType === "land" ||
    pType === "mixed_use_land" ||
    pType === "commercial_land" ||
    pType === "farmhouse_land" ||
    pType === "agricultural" ||
    pType.includes("land") ||
    pType.includes("plot") ||
    t.includes(" plot") ||
    t.includes(" land")
  ) {
    return "plot";
  }

  if (pType === "farmhouse" || t.includes("farmhouse") || t.includes("estate")) {
    return "estate";
  }

  if (pType === "warehouse" || t.includes("warehouse") || t.includes("industrial")) {
    return "industrial";
  }

  if (pType === "mixed_use" || pType === "live_work" || t.includes("mixed-use") || t.includes("mixed use") || t.includes("soho") || t.includes("live-work")) {
    return "mixed_use";
  }

  if (
    pType === "commercial" ||
    pType === "retail" ||
    pType === "sco" ||
    pType === "coworking" ||
    pType.includes("office") ||
    pType.includes("retail") ||
    pType.includes("sco") ||
    t.includes("office") ||
    t.includes("retail") ||
    t.includes("sco") ||
    t.includes("shop") ||
    t.includes("showroom")
  ) {
    return "commercial";
  }

  return "residential";
}

export function getDefaultHighlights(propertyType = "residential", context = {}) {
  const arch = getAssetArchetype(propertyType, context.title || "");
  const list = [];

  // 1. RERA / Clear Title
  if (context.reraNumber && context.reraNumber.trim() && context.reraNumber !== 'HRERA-GGM-2024-') {
    list.push({
      id: 'hl-rera',
      text: `RERA Registered & Title Diligenced (${context.reraNumber.split('-').slice(0, 3).join('-')})`,
      is_visible: true,
      is_custom: false
    });
  } else {
    list.push({
      id: 'hl-title',
      text: context.legal_status_tag || "100% Freehold Immediate Registry & Clear Title",
      is_visible: true,
      is_custom: false
    });
  }

  // 2. Facing / Orientation
  list.push({
    id: 'hl-facing',
    text: `Favorable ${context.facing || 'North-East Facing'} with cross-ventilation`,
    is_visible: true,
    is_custom: false
  });

  // 3. Parking & Infrastructure
  list.push({
    id: 'hl-parking',
    text: `${context.parking || '2 Covered Parking'} with dedicated EV charging provision`,
    is_visible: true,
    is_custom: false
  });

  // 4. Archetype-specific layout
  if (arch === 'plot') {
    list.push({
      id: 'hl-plot-layout',
      text: "High-appreciation sector with immediate boundary demarcation",
      is_visible: true,
      is_custom: false
    });
    list.push({
      id: 'hl-plot-road',
      text: "Wide sector arterial road frontage for seamless ingress",
      is_visible: true,
      is_custom: false
    });
  } else if (arch === 'commercial') {
    list.push({
      id: 'hl-comm-front',
      text: "Grade-A commercial frontage with institutional floor plates",
      is_visible: true,
      is_custom: false
    });
    list.push({
      id: 'hl-comm-footfall',
      text: "High footfall catchment with corporate anchor tenants nearby",
      is_visible: true,
      is_custom: false
    });
  } else {
    list.push({
      id: 'hl-res-density',
      text: "Low-density master layout ensuring privacy and expansive greens",
      is_visible: true,
      is_custom: false
    });
    list.push({
      id: 'hl-res-volume',
      text: "High 8'0\" grand entrance door and optimal floor-to-ceiling volume",
      is_visible: true,
      is_custom: false
    });
  }

  return list;
}

export function getDefaultReraBlocks(context = {}) {
  return [
    {
      id: 'block-title',
      title: 'Title Deed & Clear Ownership',
      desc: '100% Freehold title verified with registry records. Clear ownership chain with zero third-party encumbrances.',
      status: 'Verified Clear',
      icon_type: 'scale',
      is_visible: true,
      is_custom: false
    },
    {
      id: 'block-sanctions',
      title: 'Statutory Sanctions & Approvals',
      desc: 'Authority sanctioned architectural layout plan with active building permits and environmental clearances.',
      status: context.legal_status_tag || 'Clear Title Registry',
      icon_type: 'sanction',
      is_visible: true,
      is_custom: false
    },
    {
      id: 'block-encumbrance',
      title: 'Encumbrance Status',
      desc: '30-year search report certified by empanelled High Court legal counsel. Nil encumbrance certificate issued.',
      status: 'Nil Encumbrance',
      icon_type: 'shield',
      is_visible: true,
      is_custom: false
    },
    {
      id: 'block-banking',
      title: 'Tier-1 Banking Approvals',
      desc: 'Pre-approved for instant priority home loans and attractive interest rates with leading institutional lenders.',
      status: 'SBI • HDFC • ICICI',
      icon_type: 'bank',
      is_visible: true,
      is_custom: false
    }
  ];
}
