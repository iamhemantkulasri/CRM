import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, ExternalLink, Upload, Plus, Trash2, CheckCircle2, 
  Sparkles, Layers, Navigation, ShieldCheck, Image as ImageIcon,
  Building2, Eye, EyeOff, Sliders, Check, Info, Scale, Landmark, FileCheck2
} from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { useBuilderStore } from '../store/builderStore';
import { PROPERTY_STATUSES } from '../utils/constants';
import { 
  ASSET_CATEGORIES, 
  CONFIGURATIONS_BY_CATEGORY, 
  CITIES_BY_REGION, 
  getAssetArchetype,
  getDefaultHighlights,
  getDefaultReraBlocks
} from '../utils/propertyTaxonomy';

// Luxury photo presets from TGV Estates website for 1-click addition
const PRESET_IMAGES = [
  { label: "Ultra Penthouse", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" },
  { label: "Modern Luxury Villa", url: "https://images.unsplash.com/photo-1600607687931-cecebd802404?q=80&w=2000&auto=format&fit=crop" },
  { label: "South Delhi Builder Floor", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" },
  { label: "High-Rise Golf View", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" },
  { label: "Grade-A Commercial Tower", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" },
  { label: "Retail / SCO Hub", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" }
];

// Popular Luxury Amenities tags
const POPULAR_AMENITIES = [
  "Swimming Pool", "Club House", "100% Power Backup", "24/7 Gated Security",
  "Gymnasium", "Private Lift", "EV Charging Station", "Kids Play Area",
  "Landscaped Gardens", "Jogging Track", "Tennis Court", "Dedicated Covered Parking",
  "CCTV Surveillance", "Rooftop Sky Lounge", "Freehold Legal Title"
];

const TABS = [
  { id: 'overview', label: '1. Overview & Pricing', icon: Building2 },
  { id: 'media', label: '2. Media & Assets', icon: ImageIcon },
  { id: 'variants', label: '3. Variants & Floor Plans', icon: Layers },
  { id: 'transit', label: '4. Transit & Commute', icon: Navigation },
  { id: 'legal', label: '5. Legal Diligence & Badges', icon: ShieldCheck }
];

export function PropertyModal({ isOpen, onClose, editingProperty }) {
  const { addProperty, updateProperty } = usePropertyStore();
  const { builders } = useBuilderStore();
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    name: '',
    builder: '',
    builder_id: '',
    type: 'residential',
    configuration: '3 BHK',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: '',
    carpet_sqft: '',
    priceLakhs: '',
    locality: '',
    city: 'Gurgaon',
    custom_city: '',
    status: 'ready_to_move',
    possessionDate: 'Ready to Move',
    facing: 'North-East Facing',
    parking: '2 Covered Parking',
    furnishing_status: 'semi-furnished',
    purpose: 'buy',
    reraNumber: 'HRERA-GGM-2024-',
    locationLink: '',
    description: '',
    amenities: 'Swimming Pool, Club House, 100% Power Backup, 24/7 Gated Security, Gymnasium',
    tier: 'luxury',
    visibility: 'public',
    is_featured: false,
    show_rera: true,
    show_floor_plan: true,
    show_transit: true,
    imageUrl: PRESET_IMAGES[0].url,
    images: [PRESET_IMAGES[0].url],
    brochure_url: '',
    video_url: '',
    virtual_tour_url: '',
    floor_plan_url: '',
    rera_portal_url: '',
    legal_status_tag: 'Freehold Immediate Registry',
    legal_remarks: '30-year search report completed; Nil-encumbrance certificate verified by legal counsel.',
    rera_authority: '',
    rera_custom_title: '',
    rera_details_text: '',
    rera_document_url: '',
    possession_timeline: 'Ready to Move',
    floor_number: '',
    total_floors: '',
    balconies: '',
    maintenance_charges: '',
    road_width_ft: '',
    dimensions_ft: '',
    boundary_wall: false,
    far_fsi: '',
    frontage_ft: '',
    occupancy_status: 'Vacant',
    power_load_kva: '',
    variants: [],
    custom_dimensions: [],
    custom_commute_points: [],
    key_highlights: getDefaultHighlights('residential'),
    rera_blocks: getDefaultReraBlocks()
  });

  // Temporary row input states for inline matrix builders
  const [newVariantInput, setNewVariantInput] = useState({
    name: '',
    sqft: '',
    price_lakhs: '',
    bedrooms: 3,
    bathrooms: 3,
    floor_plan_url: ''
  });

  const [newRoomInput, setNewRoomInput] = useState({
    room_name: '',
    dimensions: '',
    notes: ''
  });

  const [newCommuteInput, setNewCommuteInput] = useState({
    landmark: '',
    distance_km: '',
    time_mins: '',
    category: 'Transit'
  });

  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [activeDimensionScope, setActiveDimensionScope] = useState('master'); // 'master' or variant index number (e.g. 0, 1, 2)
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setValidationError(null);
    }

    if (editingProperty) {
      const existingImages = Array.isArray(editingProperty.images) && editingProperty.images.length > 0
        ? editingProperty.images
        : (editingProperty.imageUrl ? [editingProperty.imageUrl] : []);

      const propType = editingProperty.type || editingProperty.property_type || 'residential';
      const parsedBedrooms = editingProperty.bedrooms !== undefined ? Number(editingProperty.bedrooms) : (parseInt(editingProperty.configuration || editingProperty.bhk) || 0);
      const parsedBathrooms = editingProperty.bathrooms !== undefined ? Number(editingProperty.bathrooms) : (parsedBedrooms > 1 ? parsedBedrooms - 1 : 1);

      // Parse existing key_highlights or fallback to defaults
      let loadedHighlights = [];
      if (Array.isArray(editingProperty.key_highlights) && editingProperty.key_highlights.length > 0) {
        loadedHighlights = editingProperty.key_highlights.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              id: `hl-${idx}-${Date.now()}`,
              text: item,
              is_visible: true,
              is_custom: true
            };
          }
          return {
            id: item.id || `hl-${idx}-${Date.now()}`,
            text: item.text || '',
            is_visible: item.is_visible !== false,
            is_custom: Boolean(item.is_custom)
          };
        });
      } else if (typeof editingProperty.key_highlights === 'string' && editingProperty.key_highlights.trim()) {
        loadedHighlights = editingProperty.key_highlights.split(',').map((s, idx) => ({
          id: `hl-${idx}-${Date.now()}`,
          text: s.trim(),
          is_visible: true,
          is_custom: true
        })).filter(h => h.text);
      } else {
        loadedHighlights = getDefaultHighlights(propType, {
          title: editingProperty.name || editingProperty.title,
          facing: editingProperty.facing,
          parking: editingProperty.parking,
          reraNumber: editingProperty.reraNumber || editingProperty.rera_number,
          legal_status_tag: editingProperty.legal_status_tag
        });
      }

      // Parse existing rera_blocks or fallback to defaults
      let loadedReraBlocks = [];
      if (Array.isArray(editingProperty.rera_blocks) && editingProperty.rera_blocks.length > 0) {
        loadedReraBlocks = editingProperty.rera_blocks.map((b, idx) => ({
          id: b.id || `block-${idx}-${Date.now()}`,
          title: b.title || '',
          desc: b.desc || '',
          status: b.status || 'Verified',
          icon_type: b.icon_type || 'scale',
          is_visible: b.is_visible !== false,
          is_custom: Boolean(b.is_custom)
        }));
      } else {
        loadedReraBlocks = getDefaultReraBlocks({
          legal_status_tag: editingProperty.legal_status_tag
        });
      }

      setFormData({
        ...editingProperty,
        type: propType,
        configuration: editingProperty.configuration || editingProperty.bhk || '3 BHK',
        bedrooms: parsedBedrooms,
        bathrooms: parsedBathrooms,
        carpet_sqft: editingProperty.carpet_sqft || '',
        facing: editingProperty.facing || 'North-East Facing',
        parking: editingProperty.parking || '2 Covered Parking',
        furnishing_status: editingProperty.furnishing_status || 'semi-furnished',
        purpose: editingProperty.purpose || 'buy',
        city: editingProperty.city || editingProperty.location_city || 'Gurgaon',
        custom_city: editingProperty.custom_city || '',
        show_rera: editingProperty.show_rera === false || editingProperty.show_rera === 'false' || editingProperty.show_rera === 0 || editingProperty.show_rera === '0' ? false : true,
        show_floor_plan: editingProperty.show_floor_plan === false || editingProperty.show_floor_plan === 'false' || editingProperty.show_floor_plan === 0 || editingProperty.show_floor_plan === '0' ? false : true,
        show_transit: editingProperty.show_transit === false || editingProperty.show_transit === 'false' || editingProperty.show_transit === 0 || editingProperty.show_transit === '0' ? false : true,
        amenities: Array.isArray(editingProperty.amenities) ? editingProperty.amenities.join(', ') : (editingProperty.amenities || ''),
        key_highlights: loadedHighlights,
        rera_blocks: loadedReraBlocks,
        locationLink: editingProperty.locationLink || '',
        images: existingImages,
        tier: editingProperty.tier || 'luxury',
        visibility: editingProperty.visibility || (editingProperty.tier === 'normal' ? 'unlisted' : 'public'),
        is_featured: Boolean(editingProperty.is_featured),
        imageUrl: editingProperty.imageUrl || existingImages[0] || '',
        brochure_url: editingProperty.brochure_url || '',
        video_url: editingProperty.video_url || '',
        virtual_tour_url: editingProperty.virtual_tour_url || '',
        floor_plan_url: editingProperty.floor_plan_url || '',
        rera_portal_url: editingProperty.rera_portal_url || '',
        legal_status_tag: editingProperty.legal_status_tag || 'Freehold Immediate Registry',
        legal_remarks: editingProperty.legal_remarks || '',
        rera_authority: editingProperty.rera_authority || '',
        rera_custom_title: editingProperty.rera_custom_title || '',
        rera_details_text: editingProperty.rera_details_text || '',
        rera_document_url: editingProperty.rera_document_url || '',
        possession_timeline: editingProperty.possession_timeline || editingProperty.possessionDate || 'Ready to Move',
        floor_number: editingProperty.floor_number !== undefined && editingProperty.floor_number !== null ? editingProperty.floor_number : '',
        total_floors: editingProperty.total_floors !== undefined && editingProperty.total_floors !== null ? editingProperty.total_floors : '',
        balconies: editingProperty.balconies !== undefined && editingProperty.balconies !== null ? editingProperty.balconies : '',
        maintenance_charges: editingProperty.maintenance_charges || '',
        road_width_ft: editingProperty.road_width_ft !== undefined && editingProperty.road_width_ft !== null ? editingProperty.road_width_ft : '',
        dimensions_ft: editingProperty.dimensions_ft || '',
        boundary_wall: Boolean(editingProperty.boundary_wall),
        far_fsi: editingProperty.far_fsi || '',
        frontage_ft: editingProperty.frontage_ft !== undefined && editingProperty.frontage_ft !== null ? editingProperty.frontage_ft : '',
        occupancy_status: editingProperty.occupancy_status || 'Vacant',
        power_load_kva: editingProperty.power_load_kva !== undefined && editingProperty.power_load_kva !== null ? editingProperty.power_load_kva : '',
        variants: Array.isArray(editingProperty.variants) ? editingProperty.variants : [],
        custom_dimensions: Array.isArray(editingProperty.custom_dimensions) ? editingProperty.custom_dimensions : [],
        custom_commute_points: Array.isArray(editingProperty.custom_commute_points) ? editingProperty.custom_commute_points : []
      });
    } else {
      setFormData({
        name: '',
        builder: '',
        type: 'residential',
        configuration: '3 BHK',
        bedrooms: 3,
        bathrooms: 3,
        areaSqFt: '',
        carpet_sqft: '',
        priceLakhs: '',
        locality: '',
        city: 'Gurgaon',
        custom_city: '',
        status: 'ready_to_move',
        possessionDate: 'Ready to Move',
        facing: 'North-East Facing',
        parking: '2 Covered Parking',
        furnishing_status: 'semi-furnished',
        purpose: 'buy',
        reraNumber: 'HRERA-GGM-2024-',
        locationLink: '',
        description: '',
        amenities: 'Swimming Pool, Club House, 100% Power Backup, 24/7 Gated Security, Gymnasium',
        tier: 'luxury',
        visibility: 'public',
        is_featured: false,
        show_rera: true,
        show_floor_plan: true,
        show_transit: true,
        imageUrl: PRESET_IMAGES[0].url,
        images: [PRESET_IMAGES[0].url],
        brochure_url: '',
        video_url: '',
        virtual_tour_url: '',
        floor_plan_url: '',
        rera_portal_url: '',
        legal_status_tag: 'Freehold Immediate Registry',
        legal_remarks: '30-year search report completed; Nil-encumbrance certificate verified by legal counsel.',
        variants: [],
        custom_dimensions: [],
        custom_commute_points: [],
        key_highlights: getDefaultHighlights('residential'),
        rera_blocks: getDefaultReraBlocks()
      });
    }
  }, [editingProperty, isOpen]);

  const handleTypeChange = (newType) => {
    const cat = ASSET_CATEGORIES.find(c => c.id === newType);
    const configs = CONFIGURATIONS_BY_CATEGORY[newType] || [];
    const defaultConfig = configs[0]?.label || 'Standard';
    const nextArch = getAssetArchetype(newType, '');
    const defaultBedrooms = nextArch === 'plot' || nextArch === 'commercial' || nextArch === 'industrial'
      ? 0
      : (configs[0]?.bedrooms ?? cat?.defaultBedrooms ?? 3);
    const defaultBathrooms = defaultBedrooms > 1 ? defaultBedrooms - 1 : (defaultBedrooms === 1 ? 1 : 0);

    setFormData(prev => {
      const nextVars = prev.variants.length > 0 ? prev.variants.map(v => ({
        ...v,
        bedrooms: defaultBedrooms,
        bathrooms: defaultBathrooms
      })) : [];

      // If existing highlights are all auto-generated (or empty), update them for the new category!
      const existingHighlights = Array.isArray(prev.key_highlights) ? prev.key_highlights : [];
      const hasCustom = existingHighlights.some(h => h.is_custom);
      const nextHighlights = hasCustom
        ? existingHighlights
        : getDefaultHighlights(newType, {
            title: prev.name,
            facing: prev.facing,
            parking: prev.parking,
            reraNumber: prev.reraNumber,
            legal_status_tag: prev.legal_status_tag
          });

      return {
        ...prev,
        type: newType,
        configuration: defaultConfig,
        bedrooms: defaultBedrooms,
        bathrooms: defaultBathrooms,
        facing: prev.facing || 'North-East Facing',
        furnishing_status: nextArch === 'plot' ? 'unfurnished' : prev.furnishing_status,
        variants: nextVars,
        key_highlights: nextHighlights
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setFormData(prev => {
          const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
          if (!currentImages.includes(base64)) {
            currentImages.push(base64);
          }
          return {
            ...prev,
            imageUrl: prev.imageUrl || base64,
            images: currentImages
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = (url) => {
    if (!url || !url.trim()) return;
    const trimmed = url.trim();
    setFormData(prev => {
      const current = Array.isArray(prev.images) ? [...prev.images] : [];
      if (!current.includes(trimmed)) current.push(trimmed);
      return {
        ...prev,
        imageUrl: prev.imageUrl || trimmed,
        images: current
      };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const updated = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || ''
      };
    });
  };

  const handleSetCoverImage = (index) => {
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      const selected = imgs.splice(index, 1)[0];
      imgs.unshift(selected);
      return {
        ...prev,
        images: imgs,
        imageUrl: selected
      };
    });
  };

  const toggleAmenity = (amenity) => {
    const currentList = typeof formData.amenities === 'string'
      ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : (formData.amenities || []);

    const exists = currentList.includes(amenity);
    const updated = exists ? currentList.filter(a => a !== amenity) : [...currentList, amenity];

    setFormData(prev => ({
      ...prev,
      amenities: updated.join(', ')
    }));
  };

  // Unit Variants helper
  const handleAddVariant = () => {
    if (!newVariantInput.name && !newVariantInput.sqft) return;
    const isPlot = formData.type === 'plot' || formData.type === 'land' || formData.type === 'commercial_land' || formData.type === 'farmhouse_land' || formData.type === 'agricultural';
    const isCommercial = formData.type === 'commercial' || formData.type === 'retail' || formData.type === 'sco' || formData.type === 'warehouse';
    const isMixedUse = formData.type === 'mixed_use' || formData.type === 'live_work';
    const fallbackBeds = isPlot || isCommercial ? 0 : (Number(newVariantInput.bedrooms) || Number(formData.bedrooms) || (isMixedUse ? 2 : 3));
    const fallbackBaths = isPlot || isCommercial ? 0 : (Number(newVariantInput.bathrooms) || Number(formData.bathrooms) || fallbackBeds || (isMixedUse ? 2 : 3));

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: newVariantInput.name || (isPlot ? 'Custom Plot' : isCommercial ? 'Commercial Unit' : `${fallbackBeds} BHK Unit`),
          sqft: Number(newVariantInput.sqft) || Number(prev.areaSqFt) || 0,
          price_lakhs: Number(newVariantInput.price_lakhs) || Number(prev.priceLakhs) || 0,
          bedrooms: fallbackBeds,
          bathrooms: fallbackBaths,
          carpet_sqft: Number(newVariantInput.carpet_sqft) || Math.round((Number(newVariantInput.sqft) || Number(prev.areaSqFt) || 0) * (isPlot ? 1 : 0.74)),
          floor_plan_url: newVariantInput.floor_plan_url || ''
        }
      ]
    }));
    setNewVariantInput({ name: '', sqft: '', price_lakhs: '', bedrooms: 3, bathrooms: 3, carpet_sqft: '', floor_plan_url: '' });
  };

  const updateVariant = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleVariantPlanUpload = (idx, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is larger than 5MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      updateVariant(idx, 'floor_plan_url', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleNewVariantPlanUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is larger than 5MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewVariantInput(prev => ({ ...prev, floor_plan_url: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeVariant = (idx) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  // Room Dimensions helper (supports both Master and Variant-Specific dimensions)
  const handleAddRoom = () => {
    if (!newRoomInput.room_name.trim() || !newRoomInput.dimensions.trim()) return;

    if (activeDimensionScope === 'master') {
      setFormData(prev => ({
        ...prev,
        custom_dimensions: [...prev.custom_dimensions, { ...newRoomInput }]
      }));
    } else {
      const vIdx = Number(activeDimensionScope);
      setFormData(prev => {
        const nextVariants = [...prev.variants];
        const targetVar = nextVariants[vIdx];
        if (targetVar) {
          const currentDims = Array.isArray(targetVar.custom_dimensions) ? targetVar.custom_dimensions : [];
          nextVariants[vIdx] = {
            ...targetVar,
            custom_dimensions: [...currentDims, { ...newRoomInput }]
          };
        }
        return { ...prev, variants: nextVariants };
      });
    }

    setNewRoomInput({ room_name: '', dimensions: '', notes: '' });
  };

  const removeRoom = (idx) => {
    if (activeDimensionScope === 'master') {
      setFormData(prev => ({
        ...prev,
        custom_dimensions: prev.custom_dimensions.filter((_, i) => i !== idx)
      }));
    } else {
      const vIdx = Number(activeDimensionScope);
      setFormData(prev => {
        const nextVariants = [...prev.variants];
        const targetVar = nextVariants[vIdx];
        if (targetVar && Array.isArray(targetVar.custom_dimensions)) {
          nextVariants[vIdx] = {
            ...targetVar,
            custom_dimensions: targetVar.custom_dimensions.filter((_, i) => i !== idx)
          };
        }
        return { ...prev, variants: nextVariants };
      });
    }
  };

  // Commute Points helper
  const handleAddCommute = () => {
    if (!newCommuteInput.landmark.trim() || !newCommuteInput.time_mins) return;
    setFormData(prev => ({
      ...prev,
      custom_commute_points: [...prev.custom_commute_points, { ...newCommuteInput }]
    }));
    setNewCommuteInput({ landmark: '', distance_km: '', time_mins: '', category: 'Transit' });
  };

  const removeCommute = (idx) => {
    setFormData(prev => ({
      ...prev,
      custom_commute_points: prev.custom_commute_points.filter((_, i) => i !== idx)
    }));
  };

  // Dynamic Highlights CRUD & Visibility Toggles
  const handleToggleHighlightVisibility = (id) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: (Array.isArray(prev.key_highlights) ? prev.key_highlights : []).map(h => 
        h.id === id ? { ...h, is_visible: !h.is_visible } : h
      )
    }));
  };

  const handleUpdateHighlightText = (id, text) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: (Array.isArray(prev.key_highlights) ? prev.key_highlights : []).map(h => 
        h.id === id ? { ...h, text, is_custom: true } : h
      )
    }));
  };

  const handleAddCustomHighlight = () => {
    if (!newHighlightInput.trim()) return;
    const newItem = {
      id: `hl-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newHighlightInput.trim(),
      is_visible: true,
      is_custom: true
    };

    setFormData(prev => ({
      ...prev,
      key_highlights: [...(Array.isArray(prev.key_highlights) ? prev.key_highlights : []), newItem]
    }));
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (id) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: (Array.isArray(prev.key_highlights) ? prev.key_highlights : []).filter(h => h.id !== id)
    }));
  };

  // Dynamic RERA 4-Block CRUD & Visibility Toggles
  const handleToggleReraBlockVisibility = (id) => {
    setFormData(prev => ({
      ...prev,
      rera_blocks: (Array.isArray(prev.rera_blocks) ? prev.rera_blocks : []).map(b => 
        b.id === id ? { ...b, is_visible: !b.is_visible } : b
      )
    }));
  };

  const handleUpdateReraBlock = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      rera_blocks: (Array.isArray(prev.rera_blocks) ? prev.rera_blocks : []).map(b => 
        b.id === id ? { ...b, [field]: value } : b
      )
    }));
  };

  const handleAddReraBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Custom Legal Clearance',
      desc: 'Verified compliance documentation and institutional diligence completed.',
      status: 'Verified',
      icon_type: 'scale',
      is_visible: true,
      is_custom: true
    };

    setFormData(prev => ({
      ...prev,
      rera_blocks: [...(Array.isArray(prev.rera_blocks) ? prev.rera_blocks : []), newBlock]
    }));
  };

  const handleRemoveReraBlock = (id) => {
    setFormData(prev => ({
      ...prev,
      rera_blocks: (Array.isArray(prev.rera_blocks) ? prev.rera_blocks : []).filter(b => b.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    // JavaScript validation so inactive tabs never lock submission silently
    if (!formData.name || !formData.name.trim()) {
      setActiveTab('overview');
      setValidationError('Property / Project Title is required.');
      return;
    }

    if (!formData.priceLakhs || Number(formData.priceLakhs) <= 0) {
      setActiveTab('overview');
      setValidationError('Please enter a valid price in ₹ Lakhs.');
      return;
    }

    if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
      setActiveTab('overview');
      setValidationError('Please enter a valid Super / Plot Area in Sq.Ft.');
      return;
    }

    if (!formData.locality || !formData.locality.trim()) {
      setActiveTab('overview');
      setValidationError('Sector / Locality is required.');
      return;
    }

    const effectiveCity = formData.city === 'custom'
      ? (formData.custom_city?.trim() || 'Delhi NCR')
      : (formData.city || 'Gurgaon');

    const cleanImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : (formData.imageUrl ? [formData.imageUrl] : [PRESET_IMAGES[0].url]);

    const payload = {
      ...formData,
      city: effectiveCity,
      images: cleanImages,
      imageUrl: cleanImages[0] || formData.imageUrl || PRESET_IMAGES[0].url,
      bhk: formData.configuration,
      bedrooms: Number(formData.bedrooms) || (parseInt(formData.configuration) || 0),
      bathrooms: Number(formData.bathrooms) || ((Number(formData.bedrooms) || 1) > 1 ? (Number(formData.bedrooms) || 2) - 1 : 1),
      areaSqFt: Number(formData.areaSqFt) || 0,
      carpet_sqft: formData.carpet_sqft !== '' && formData.carpet_sqft !== undefined && formData.carpet_sqft !== null ? Number(formData.carpet_sqft) : undefined,
      priceLakhs: Number(formData.priceLakhs) || 0,
      floor_number: formData.floor_number !== '' && formData.floor_number !== undefined && formData.floor_number !== null ? Number(formData.floor_number) : undefined,
      total_floors: formData.total_floors !== '' && formData.total_floors !== undefined && formData.total_floors !== null ? Number(formData.total_floors) : undefined,
      balconies: formData.balconies !== '' && formData.balconies !== undefined && formData.balconies !== null ? Number(formData.balconies) : undefined,
      road_width_ft: formData.road_width_ft !== '' && formData.road_width_ft !== undefined && formData.road_width_ft !== null ? Number(formData.road_width_ft) : undefined,
      frontage_ft: formData.frontage_ft !== '' && formData.frontage_ft !== undefined && formData.frontage_ft !== null ? Number(formData.frontage_ft) : undefined,
      power_load_kva: formData.power_load_kva !== '' && formData.power_load_kva !== undefined && formData.power_load_kva !== null ? Number(formData.power_load_kva) : undefined,
      show_rera: Boolean(formData.show_rera),
      show_floor_plan: Boolean(formData.show_floor_plan),
      show_transit: Boolean(formData.show_transit),
      amenities: typeof formData.amenities === 'string'
        ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(formData.amenities) ? formData.amenities : []),
      key_highlights: Array.isArray(formData.key_highlights) ? formData.key_highlights : [],
      rera_blocks: Array.isArray(formData.rera_blocks) ? formData.rera_blocks : [],
      locationLink: formData.locationLink || `https://maps.google.com/?q=${encodeURIComponent(formData.locality + ', ' + effectiveCity)}`
    };

    if (editingProperty) {
      updateProperty(editingProperty.id, payload);
    } else {
      addProperty(payload);
    }
    onClose();
  };

  const configOptions = (CONFIGURATIONS_BY_CATEGORY[formData.type] || []).map(c => c.label);
  const currentHighlightsList = Array.isArray(formData.key_highlights) ? formData.key_highlights : [];
  const currentReraBlocks = Array.isArray(formData.rera_blocks) ? formData.rera_blocks : [];

  const currentAmenitiesList = typeof formData.amenities === 'string'
    ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
    : (formData.amenities || []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content 
          className="modal-content" 
          style={{ 
            maxWidth: 780, 
            maxHeight: '92vh', 
            overflowY: 'auto',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header */}
          <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <Dialog.Title className="text-h2" style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{editingProperty ? 'Edit Property & Website Listing' : 'Add Property to Website & CRM Inventory'}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', fontWeight: 600 }}>
                  5-Tab Listing Engine
                </span>
              </Dialog.Title>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                Full parity with TGV Estates admin: multi-size variants, granular RERA toggles & transit landmarks
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          {/* Emil Design Eng: Segmented Tab Bar */}
          <div style={{ paddingTop: 12, paddingBottom: 6 }}>
            {validationError && (
              <div style={{
                marginBottom: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>⚠️ {validationError}</span>
              </div>
            )}

            <div className="segmented-tab-nav">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`segmented-tab-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
            
            {/* ========================================================
                TAB 1: OVERVIEW & PRICING
                ======================================================== */}
            {activeTab === 'overview' && (
              <>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Property / Project Title *</label>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. The Camellias Ultra Luxury Penthouse"
                    />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Builder / Seller Mandate</label>
                      {builders && builders.length > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--color-primary)' }}>
                          {builders.length} Registered
                        </span>
                      )}
                    </div>
                    {builders && builders.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          className="form-select"
                          style={{ flex: 1.2, height: 38 }}
                          value={formData.builder_id || ''}
                          onChange={e => {
                            const selectedId = e.target.value;
                            if (!selectedId) {
                              setFormData(prev => ({ ...prev, builder_id: '', builder: '' }));
                            } else {
                              const found = builders.find(b => b.id === selectedId);
                              if (found) {
                                setFormData(prev => ({
                                  ...prev,
                                  builder_id: found.id,
                                  builder: found.name,
                                  reraNumber: found.rera_reg_no || prev.reraNumber,
                                  city: found.city || prev.city
                                }));
                              }
                            }
                          }}
                        >
                          <option value="">-- Select Registered Profile --</option>
                          {builders.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.type === 'builder' ? '🏢' : '👤'} {b.name} ({b.city || 'NCR'})
                            </option>
                          ))}
                        </select>
                        <input
                          className="form-input"
                          style={{ flex: 1, height: 38 }}
                          value={formData.builder}
                          onChange={e => setFormData({ ...formData, builder: e.target.value, builder_id: '' })}
                          placeholder="Or type custom name"
                        />
                      </div>
                    ) : (
                      <input
                        className="form-input"
                        value={formData.builder}
                        onChange={e => setFormData({ ...formData, builder: e.target.value })}
                        placeholder="e.g. DLF Luxury Collection / Direct Owner"
                      />
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Asset Category / Taxonomy *</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => handleTypeChange(e.target.value)}
                    >
                      <optgroup label="Residential Properties">
                        <option value="residential">Apartment / High-Rise</option>
                        <option value="villa">Luxury Villa / Bungalow</option>
                        <option value="penthouse">Penthouse / Sky Villa</option>
                        <option value="builder_floor">Independent Builder Floor</option>
                        <option value="studio">Studio / Serviced Apartment</option>
                      </optgroup>
                      <optgroup label="Commercial & Mixed-Use">
                        <option value="commercial">Commercial Office / IT Park</option>
                        <option value="retail">High-Street Retail / Showroom</option>
                        <option value="mixed_use">Mixed-Use (Commercial + Residential)</option>
                        <option value="live_work">Live-Work Unit / SOHO</option>
                        <option value="sco">SCO Plot (Shop-Cum-Office)</option>
                        <option value="coworking">Co-Working & Managed Office</option>
                      </optgroup>
                      <optgroup label="Plots & Land">
                        <option value="plot">Residential Plot / Land</option>
                        <option value="land">General Land Parcel</option>
                        <option value="mixed_use_land">Mixed-Use Land (MLU Plot)</option>
                        <option value="commercial_land">Commercial & Institutional Land</option>
                        <option value="farmhouse_land">Farmhouse Land</option>
                        <option value="agricultural">Agricultural / Farm Land</option>
                      </optgroup>
                      <optgroup label="Luxury Estates & Industrial">
                        <option value="farmhouse">Luxury Farmhouse & Estate</option>
                        <option value="warehouse">Industrial & Warehousing</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transaction Purpose</label>
                    <select
                      className="form-select"
                      value={formData.purpose || 'buy'}
                      onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                    >
                      <option value="buy">For Sale (Outright Purchase)</option>
                      <option value="rent">For Lease / High-End Rent</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Configuration & Space Selector (TGV Admin Parity) */}
                <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>Configuration / Space Specification</span>
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                      Active: <strong style={{ color: 'var(--color-primary)' }}>{formData.configuration || "Custom"}</strong>
                    </span>
                  </div>

                  {/* Preset configuration chips for the selected property type */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(CONFIGURATIONS_BY_CATEGORY[formData.type] || []).map((cfg) => {
                      const isSelected = formData.configuration === cfg.label;
                      return (
                        <button
                          key={cfg.label}
                          type="button"
                          onClick={() => {
                            const beds = cfg.bedrooms !== undefined ? cfg.bedrooms : formData.bedrooms;
                            const baths = beds > 1 ? beds - 1 : (beds === 1 ? 1 : 0);
                            setFormData(prev => {
                              const nextVars = prev.variants.length > 0 ? [
                                { ...prev.variants[0], name: cfg.label, bedrooms: beds, bathrooms: baths },
                                ...prev.variants.slice(1)
                              ] : [];
                              return {
                                ...prev,
                                configuration: cfg.label,
                                bedrooms: beds,
                                bathrooms: baths,
                                variants: nextVars
                              };
                            });
                          }}
                          className={`config-pill-chip ${isSelected ? 'active' : ''}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Configuration input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>Or Custom Label:</span>
                    <input
                      className="form-input"
                      style={{ height: 32, fontSize: 12 }}
                      value={formData.configuration}
                      onChange={e => setFormData({ ...formData, configuration: e.target.value })}
                      placeholder="e.g. 4 BHK + Servant Suite or 500 Sq.Yds Villa Plot"
                    />
                  </div>
                </div>

                {/* Archetype-Specific Pricing & Spec Inputs */}
                {(() => {
                  const arch = getAssetArchetype(formData.type, formData.name);

                  // 1. Plot & Land Archetype
                  if (arch === 'plot') {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12 }}>
                          <div className="form-group">
                            <label className="form-label">
                              Price (₹ Lakhs) * {formData.priceLakhs ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>(= ₹{(formData.priceLakhs / 100).toFixed(2)} Cr)</span> : null}
                            </label>
                            <input
                              type="number"
                              step="any"
                              className="form-input"
                              value={formData.priceLakhs}
                              onChange={e => setFormData({ ...formData, priceLakhs: e.target.value })}
                              placeholder="e.g. 350 (= 3.50 Cr)"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              Plot Area (Sq.Ft) * {formData.areaSqFt ? <span style={{ color: 'var(--color-muted-fg)' }}>(~{Math.round(formData.areaSqFt / 9)} sq.yd)</span> : null}
                            </label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.areaSqFt}
                              onChange={e => setFormData({ ...formData, areaSqFt: e.target.value })}
                              placeholder="e.g. 2700 (= 300 Sq.Yd)"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Facing / Orientation</label>
                            <select
                              className="form-select"
                              value={formData.facing}
                              onChange={e => setFormData({ ...formData, facing: e.target.value })}
                            >
                              <option value="North-East Facing">North-East Facing</option>
                              <option value="East Facing">East Facing</option>
                              <option value="North Facing">North Facing</option>
                              <option value="Park Facing">Park Facing</option>
                              <option value="Corner Plot (Two Side Open)">Corner Plot (Two Side Open)</option>
                              <option value="Wide Road Facing (60ft+)">Wide Road Facing (60ft+)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Land Title / Possession</label>
                            <select
                              className="form-select"
                              value={formData.legal_status_tag || 'Freehold Immediate Registry'}
                              onChange={e => setFormData({ ...formData, legal_status_tag: e.target.value })}
                            >
                              <option value="Freehold Immediate Registry">Freehold (Immediate Registry)</option>
                              <option value="Authority Allotted">Authority Allotted (Leasehold)</option>
                              <option value="Gated Township Plot">Gated Township (Ready to Build)</option>
                              <option value="Clear Title Agricultural">Clear Title Farm Land</option>
                            </select>
                          </div>
                        </div>

                        {/* Plot Engineering Specs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: 12 }}>
                          <div className="form-group">
                            <label className="form-label">Approach Road (ft)</label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.road_width_ft !== undefined ? formData.road_width_ft : ''}
                              onChange={e => setFormData({ ...formData, road_width_ft: e.target.value })}
                              placeholder="e.g. 60 or 24"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Dimensions (L × B)</label>
                            <input
                              className="form-input"
                              value={formData.dimensions_ft || ''}
                              onChange={e => setFormData({ ...formData, dimensions_ft: e.target.value })}
                              placeholder="e.g. 30 × 60 ft"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Permissible FAR / FSI</label>
                            <input
                              className="form-input"
                              value={formData.far_fsi || ''}
                              onChange={e => setFormData({ ...formData, far_fsi: e.target.value })}
                              placeholder="e.g. 2.64"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Gated / Boundary Wall</label>
                            <select
                              className="form-select"
                              value={formData.boundary_wall ? 'yes' : 'no'}
                              onChange={e => setFormData({ ...formData, boundary_wall: e.target.value === 'yes' })}
                            >
                              <option value="yes">Gated / Boundary Wall Built</option>
                              <option value="no">Open Perimeter / Raw Land</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 2. Commercial / Industrial Archetype
                  if (arch === 'commercial' || arch === 'industrial') {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12 }}>
                          <div className="form-group">
                            <label className="form-label">
                              Price (₹ Lakhs) * {formData.priceLakhs ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>(= ₹{(formData.priceLakhs / 100).toFixed(2)} Cr)</span> : null}
                            </label>
                            <input
                              type="number"
                              step="any"
                              className="form-input"
                              value={formData.priceLakhs}
                              onChange={e => setFormData({ ...formData, priceLakhs: e.target.value })}
                              placeholder="e.g. 850 (= 8.50 Cr)"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Super Area (Sq.Ft) *</label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.areaSqFt}
                              onChange={e => setFormData({ ...formData, areaSqFt: e.target.value })}
                              placeholder="e.g. 5000"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Washrooms (Count)</label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.bathrooms || ''}
                              onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                              placeholder="e.g. 2"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Fit-out Condition</label>
                            <select
                              className="form-select"
                              value={formData.furnishing_status || 'semi-furnished'}
                              onChange={e => setFormData({ ...formData, furnishing_status: e.target.value })}
                            >
                              <option value="unfurnished">Bare Shell (Raw Space)</option>
                              <option value="semi-furnished">Warm Shell (HVAC + Flooring)</option>
                              <option value="furnished">Fully Furnished / Plug & Play</option>
                            </select>
                          </div>
                        </div>

                        {/* Commercial Specs: Frontage, Occupancy, Power */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 12 }}>
                          <div className="form-group">
                            <label className="form-label">Frontage Width (ft)</label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.frontage_ft !== undefined ? formData.frontage_ft : ''}
                              onChange={e => setFormData({ ...formData, frontage_ft: e.target.value })}
                              placeholder="e.g. 35 ft main road"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Occupancy / Tenancy Status</label>
                            <select
                              className="form-select"
                              value={formData.occupancy_status || 'Vacant'}
                              onChange={e => setFormData({ ...formData, occupancy_status: e.target.value })}
                            >
                              <option value="Vacant">Vacant (Immediate Self-Use)</option>
                              <option value="Pre-Leased">Pre-Leased (High Rental Yield)</option>
                              <option value="Under-Construction">Under Construction (Delivery Soon)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Power Load Sanctioned (KVA)</label>
                            <input
                              type="number"
                              className="form-input"
                              value={formData.power_load_kva !== undefined ? formData.power_load_kva : ''}
                              onChange={e => setFormData({ ...formData, power_load_kva: e.target.value })}
                              placeholder="e.g. 50 KVA with dual source"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 3. Residential / Villa / Penthouse / Estate Archetype
                  const carpetEstimate = formData.areaSqFt ? Math.round(Number(formData.areaSqFt) * 0.74) : null;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">
                            Base Price (₹ Lakhs) * {formData.priceLakhs ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>(= ₹{(formData.priceLakhs / 100).toFixed(2)} Cr)</span> : null}
                          </label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            value={formData.priceLakhs}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const nextVars = prev.variants.length > 0 ? [
                                  { ...prev.variants[0], price_lakhs: Number(val) },
                                  ...prev.variants.slice(1)
                                ] : [];
                                return { ...prev, priceLakhs: val, variants: nextVars };
                              });
                            }}
                            placeholder="e.g. 450 (= ₹4.50 Cr)"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Super Area (Sq.Ft) *</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.areaSqFt}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const nextVars = prev.variants.length > 0 ? [
                                  { ...prev.variants[0], sqft: Number(val) },
                                  ...prev.variants.slice(1)
                                ] : [];
                                return { ...prev, areaSqFt: val, variants: nextVars };
                              });
                            }}
                            placeholder="e.g. 3850"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Bedrooms (BHK)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-input"
                            value={formData.bedrooms !== undefined ? formData.bedrooms : 3}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setFormData(prev => {
                                const nextVars = prev.variants.length > 0 ? [
                                  { ...prev.variants[0], bedrooms: val },
                                  ...prev.variants.slice(1)
                                ] : [];
                                return { ...prev, bedrooms: val, variants: nextVars };
                              });
                            }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Bathrooms</label>
                          <input
                            type="number"
                            min="0"
                            className="form-input"
                            value={formData.bathrooms !== undefined ? formData.bathrooms : 3}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setFormData(prev => {
                                const nextVars = prev.variants.length > 0 ? [
                                  { ...prev.variants[0], bathrooms: val },
                                  ...prev.variants.slice(1)
                                ] : [];
                                return { ...prev, bathrooms: val, variants: nextVars };
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">
                            Carpet Area (Sq.Ft) {carpetEstimate ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>(~74% ≈ {carpetEstimate})</span> : null}
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.carpet_sqft}
                            onChange={e => setFormData({ ...formData, carpet_sqft: e.target.value })}
                            placeholder={carpetEstimate ? `e.g. ${carpetEstimate}` : 'e.g. 2950'}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Possession Status / Timeline</label>
                          <input
                            className="form-input"
                            value={formData.possession_timeline || ''}
                            onChange={e => setFormData({ ...formData, possession_timeline: e.target.value, possessionDate: e.target.value })}
                            placeholder="e.g. Ready to Move / Dec 2026"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Facing / Orientation</label>
                          <input
                            className="form-input"
                            value={formData.facing}
                            onChange={e => setFormData({ ...formData, facing: e.target.value })}
                            placeholder="e.g. North-East Facing"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Furnishing Status</label>
                          <select
                            className="form-select"
                            value={formData.furnishing_status || 'semi-furnished'}
                            onChange={e => setFormData({ ...formData, furnishing_status: e.target.value })}
                          >
                            <option value="furnished">Designer Furnished</option>
                            <option value="semi-furnished">Semi-Furnished (Modular + ACs)</option>
                            <option value="unfurnished">Bare-shell / Unfurnished</option>
                          </select>
                        </div>
                      </div>

                      {/* Floor Specs & Maintenance */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">Floor Number</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.floor_number !== undefined ? formData.floor_number : ''}
                            onChange={e => setFormData({ ...formData, floor_number: e.target.value })}
                            placeholder="e.g. 14"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Total Floors in Tower</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.total_floors !== undefined ? formData.total_floors : ''}
                            onChange={e => setFormData({ ...formData, total_floors: e.target.value })}
                            placeholder="e.g. 32"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Balconies Count</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.balconies !== undefined ? formData.balconies : ''}
                            onChange={e => setFormData({ ...formData, balconies: e.target.value })}
                            placeholder="e.g. 3"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Maintenance Charges</label>
                          <input
                            className="form-input"
                            value={formData.maintenance_charges || ''}
                            onChange={e => setFormData({ ...formData, maintenance_charges: e.target.value })}
                            placeholder="e.g. ₹5 / sq.ft or ₹12,000 / mo"
                          />
                        </div>
                      </div>

                      {/* Integrated Multi-Size Configurations (TGV Admin Parity) */}
                      <div style={{
                        background: 'var(--color-bg-secondary, #F1F5FD)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Layers size={14} style={{ color: 'var(--color-primary)' }} />
                            <span>Unit Size Variations ({formData.variants.length})</span>
                          </span>

                          {formData.variants.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const baseVar = {
                                  id: `var-base-${Date.now()}`,
                                  name: formData.configuration || `${formData.bedrooms || 3} BHK Base`,
                                  sqft: Number(formData.areaSqFt) || 2400,
                                  price_lakhs: Number(formData.priceLakhs) || 450,
                                  bedrooms: Number(formData.bedrooms) || 3,
                                  bathrooms: Number(formData.bathrooms) || 3,
                                  floor_plan_url: formData.floor_plan_url || ''
                                };
                                setFormData(prev => ({ ...prev, variants: [baseVar] }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Plus size={13} /> Has Multiple Sizes / Layouts? (e.g. 3 & 4 BHK like Epic)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, variants: [] }))}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Switch Back to Single Size Only
                            </button>
                          )}
                        </div>

                        {formData.variants.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                              {formData.variants.map((v, idx) => (
                                <div
                                  key={v.id || idx}
                                  style={{
                                    background: 'var(--color-card)',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 12, fontWeight: 700 }}>{v.name || `Size #${idx + 1}`}</span>
                                      {idx === 0 && (
                                        <span style={{ fontSize: 9, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                          Primary
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                                      {v.sqft?.toLocaleString()} sq.ft • ₹{v.price_lakhs}L • {v.bedrooms} Bed
                                    </span>
                                  </div>
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removeVariant(idx)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                                      title="Remove variant"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Quick Add Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto', gap: 6, paddingTop: 4, borderTop: '1px dashed var(--color-border)' }}>
                              <input
                                className="form-input"
                                style={{ height: 30, fontSize: 11 }}
                                placeholder="Size Name (e.g. 4 BHK Grande)"
                                value={newVariantInput.name}
                                onChange={e => setNewVariantInput({ ...newVariantInput, name: e.target.value })}
                              />
                              <input
                                type="number"
                                className="form-input"
                                style={{ height: 30, fontSize: 11 }}
                                placeholder="Sq.Ft"
                                value={newVariantInput.sqft}
                                onChange={e => setNewVariantInput({ ...newVariantInput, sqft: e.target.value })}
                              />
                              <input
                                type="number"
                                className="form-input"
                                style={{ height: 30, fontSize: 11 }}
                                placeholder="₹ Lakhs"
                                value={newVariantInput.price_lakhs}
                                onChange={e => setNewVariantInput({ ...newVariantInput, price_lakhs: e.target.value })}
                              />
                              <input
                                type="number"
                                className="form-input"
                                style={{ height: 30, fontSize: 11 }}
                                placeholder="Bedrooms"
                                value={newVariantInput.bedrooms}
                                onChange={e => setNewVariantInput({ ...newVariantInput, bedrooms: Number(e.target.value) })}
                              />
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ height: 30, fontSize: 11, padding: '0 10px', fontWeight: 600 }}
                                onClick={handleAddVariant}
                              >
                                + Add Size
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* City & Sector with Grouped Regions + Custom City Input (TGV Admin Parity) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City / Market *</label>
                    <select
                      className="form-select"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    >
                      {CITIES_BY_REGION.map(reg => (
                        <optgroup key={reg.region} label={reg.region}>
                          {reg.cities.map(c => (
                            <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="custom">+ Other / Custom City...</option>
                    </select>

                    {formData.city === 'custom' && (
                      <input
                        className="form-input"
                        style={{ marginTop: 6 }}
                        placeholder="Type custom city name (e.g. Goa, Ayodhya, Alibaug, Dubai)..."
                        value={formData.custom_city}
                        onChange={e => setFormData({ ...formData, custom_city: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sector / Locality *</label>
                    <input
                      className="form-input"
                      value={formData.locality}
                      onChange={e => setFormData({ ...formData, locality: e.target.value })}
                      placeholder="e.g. DLF Phase 5 / Sector 150 / Worli Sea Face"
                    />
                  </div>
                </div>

                {/* Tier & Visibility Strategy Bar (Bidirectionally Synchronized) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, background: 'var(--color-bg-secondary, #F1F5FD)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 11 }}>Listing Tier</label>
                    <select
                      className="form-select"
                      value={formData.tier || 'luxury'}
                      onChange={e => {
                        const tier = e.target.value;
                        setFormData({
                          ...formData,
                          tier,
                          visibility: tier === 'normal' ? 'unlisted' : 'public'
                        });
                      }}
                    >
                      <option value="luxury">✨ Luxury Tier (Public Showcase)</option>
                      <option value="normal">🏢 Normal / Off-Market Mandate</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 11 }}>Visibility Scope</label>
                    <select
                      className="form-select"
                      value={formData.visibility || 'public'}
                      onChange={e => {
                        const vis = e.target.value;
                        setFormData({
                          ...formData,
                          visibility: vis,
                          tier: vis === 'unlisted' ? 'normal' : 'luxury'
                        });
                      }}
                    >
                      <option value="public">🌐 Public (Search + SEO + Direct)</option>
                      <option value="unlisted">🔒 Secret / Unlisted Link Only</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 11 }}>Editorial Spotlight</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      />
                      <span>Pin to Website Hero</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Editorial Description / Narrative</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="High ceilings, Italian marble, wrap-around balconies with panoramic views of the Aravallis..."
                  />
                </div>
              </>
            )}

            {/* ========================================================
                TAB 2: MEDIA & ASSETS
                ======================================================== */}
            {activeTab === 'media' && (
              <>
                {/* 1-Click Preset Gallery Chips */}
                <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>1-Click Curated Luxury Photo Presets</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="preset-photo-chip"
                        onClick={() => handleAddImageUrl(preset.url)}
                      >
                        <span>+ {preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload & Direct URL Add */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Listing Photo Gallery ({formData.images?.length || 0} photo{formData.images?.length !== 1 ? 's' : ''})</span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>First photo acts as the primary Cover</span>
                  </label>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, fontSize: 12, padding: '0 12px' }}>
                      <Upload size={14} />
                      <span>Upload Files</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>

                    <input
                      type="url"
                      id="directPhotoUrlInput"
                      className="form-input"
                      style={{ flex: 1, height: 34, fontSize: 12 }}
                      placeholder="Or paste direct image URL (https://images.unsplash.com/...)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ height: 34, fontSize: 12 }}
                      onClick={() => {
                        const el = document.getElementById('directPhotoUrlInput');
                        if (el && el.value) {
                          handleAddImageUrl(el.value);
                          el.value = '';
                        }
                      }}
                    >
                      Add Photo
                    </button>
                  </div>

                  {/* Thumbnail gallery */}
                  {formData.images && formData.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 8, marginTop: 10 }}>
                      {formData.images.map((img, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            position: 'relative', 
                            height: 76, 
                            borderRadius: 8, 
                            overflow: 'hidden', 
                            border: idx === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            boxShadow: idx === 0 ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                          }}
                        >
                          <img src={img} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          
                          {idx === 0 ? (
                            <span style={{ position: 'absolute', top: 3, left: 3, background: 'var(--color-primary)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                              ⭐ Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 4, padding: '1px 4px', fontSize: 9, cursor: 'pointer' }}
                              title="Make Cover"
                            >
                              Set Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rich Asset Media URLs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Brochure PDF Download URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.brochure_url}
                      onChange={e => setFormData({ ...formData, brochure_url: e.target.value })}
                      placeholder="https://.../brochure.pdf"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Video Walkthrough (YouTube / Drive)</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.video_url}
                      onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Virtual 360 Tour Link (Matterport / Kuula)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.virtual_tour_url}
                    onChange={e => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                    placeholder="https://my.matterport.com/show/?m=..."
                  />
                </div>

                {/* Popular Amenities Multi-Select */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Curated Luxury Amenities</span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Click to toggle</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {POPULAR_AMENITIES.map(amenity => {
                      const isSelected = currentAmenitiesList.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 16,
                            fontSize: 11,
                            fontWeight: isSelected ? 600 : 400,
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                            background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-bg)',
                            color: isSelected ? 'var(--color-primary)' : 'var(--color-fg)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 150ms ease'
                          }}
                        >
                          {isSelected && <Check size={11} />}
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    className="form-input"
                    value={formData.amenities}
                    onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="Or type custom comma-separated amenities..."
                    style={{ fontSize: 12 }}
                  />
                </div>
              </>
            )}

            {/* ========================================================
                TAB 3: VARIANTS & FLOOR PLANS
                ======================================================== */}
            {activeTab === 'variants' && (
              <>
                {/* Tactile Switch Banner */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setFormData(prev => ({ ...prev, show_floor_plan: !prev.show_floor_plan }))}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFormData(prev => ({ ...prev, show_floor_plan: !prev.show_floor_plan })); } }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 14px', 
                    background: formData.show_floor_plan ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-bg-secondary, #F1F5FD)', 
                    borderRadius: 12, 
                    border: formData.show_floor_plan ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: formData.show_floor_plan ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                      color: formData.show_floor_plan ? '#059669' : 'var(--color-muted-fg)'
                    }}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-fg)' }}>
                          Floor Plans &amp; Layout Visualizer
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: formData.show_floor_plan ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: formData.show_floor_plan ? '#059669' : '#64748b'
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: formData.show_floor_plan ? '#10b981' : '#94a3b8'
                          }} />
                          {formData.show_floor_plan ? 'Active on Website' : 'Hidden on Website'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                        Display architectural blueprints, unit size variants &amp; room dimensions to buyers.
                      </p>
                    </div>
                  </div>

                  {/* iOS Style Tactile Switch */}
                  <div style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: formData.show_floor_plan ? '#10b981' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 200ms ease',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 2,
                      left: formData.show_floor_plan ? 22 : 2,
                      transition: 'left 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {!formData.show_floor_plan ? (
                  <div style={{
                    padding: '32px 20px',
                    borderRadius: 14,
                    background: 'var(--color-bg-secondary, #F1F5FD)',
                    border: '1.5px dashed var(--color-border)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(100, 116, 139, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-muted-fg)'
                    }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fg)', display: 'block' }}>
                        Floor Plans &amp; Layout Visualizer is Disabled
                      </span>
                      <p style={{ margin: '6px auto 0', fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: 440, lineHeight: 1.5 }}>
                        This section is turned OFF. Architectural blueprints, per-unit size variants, and custom room dimensions are completely hidden from buyers on the website.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, height: 32, padding: '0 14px', marginTop: 4, fontWeight: 600 }}
                      onClick={() => setFormData(prev => ({ ...prev, show_floor_plan: true }))}
                    >
                      Turn On Floor Plans &amp; Blueprints
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Master Layout / Floor Plan Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.floor_plan_url}
                      onChange={e => setFormData({ ...formData, floor_plan_url: e.target.value })}
                      placeholder="https://.../master_floorplan.jpg (Detailed architectural blueprint)"
                    />
                  </div>

                  {/* Multi-Size Variants Matrix with Per-Variant Floor Plans */}
                  <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', padding: 14, borderRadius: 12, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Unit Configurations &amp; Dedicated Floor Plans ({formData.variants.length})</span>
                          <span style={{ fontSize: 10, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                            Independent Blueprints
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                          Each variant can have its own distinct architectural blueprint (e.g. 3 BHK vs 4 BHK Penthouse layout). If left blank, it seamlessly falls back to the master plan above.
                        </p>
                      </div>
                    </div>

                    {/* Added Variants Studio Cards */}
                    {formData.variants.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {formData.variants.map((v, idx) => {
                          const planThumb = v.floor_plan_url || formData.floor_plan_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop';
                          const isPrimary = idx === 0;

                          return (
                            <div key={v.id || idx} className="variant-card">
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Left: Thumbnail & Plan Preview */}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                  <div className="variant-plan-thumb">
                                    <img src={planThumb} alt={v.name || 'Floor Plan'} />
                                    <span style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 8, padding: '1px 3px', borderRadius: 2 }}>
                                      {v.floor_plan_url ? 'Custom Plan' : 'Master Plan'}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700 }}>{v.name || `Variant #${idx + 1}`}</span>
                                      {isPrimary && (
                                        <span style={{ fontSize: 9, background: 'rgba(37, 99, 235, 0.15)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                                          Primary Base Unit
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                                      {v.sqft?.toLocaleString()} sq.ft Super • {v.carpet_sqft || Math.round((v.sqft || 0) * 0.74)} sq.ft Carpet • ₹{v.price_lakhs}L{v.bedrooms ? ` (${v.bedrooms} BHK / ${v.bathrooms || v.bedrooms} Bath)` : ''}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <label className="btn btn-secondary" style={{ cursor: 'pointer', height: 28, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Upload size={12} />
                                    <span>{v.floor_plan_url ? 'Change Plan' : 'Upload Plan'}</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      style={{ display: 'none' }} 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleVariantPlanUpload(idx, file);
                                      }} 
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => removeVariant(idx)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-destructive, #ef4444)', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
                                    title="Remove this size variant"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>

                              {/* Plan URL Row */}
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--color-bg)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>Floor Plan URL:</span>
                                <input
                                  className="form-input"
                                  style={{ height: 28, fontSize: 11, flex: 1 }}
                                  placeholder="https://... (Direct blueprint image URL for this specific variant)"
                                  value={v.floor_plan_url || ''}
                                  onChange={(e) => updateVariant(idx, 'floor_plan_url', e.target.value)}
                                />
                                {v.floor_plan_url && (
                                  <button
                                    type="button"
                                    onClick={() => updateVariant(idx, 'floor_plan_url', '')}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-muted-fg)', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    Reset to Master
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add New Variant Box */}
                    <div style={{ background: 'var(--color-card)', padding: 12, borderRadius: 10, border: '1px dashed var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={13} style={{ color: 'var(--color-primary)' }} />
                        <span>Add Another Size Variant &amp; Floor Plan ({formData.type === 'plot' || formData.type === 'land' ? 'e.g. Phase 2 (500 Sq.Yd)' : formData.type === 'commercial' ? 'e.g. Ground Floor Anchor' : formData.type === 'mixed_use' || formData.type === 'live_work' ? 'e.g. Ground Retail + 1st Floor Suite' : 'e.g. 4 BHK Sky Villa'})</span>
                      </span>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: (formData.type === 'plot' || formData.type === 'land' || formData.type === 'commercial_land' || formData.type === 'farmhouse_land' || formData.type === 'commercial' || formData.type === 'warehouse')
                          ? '1.6fr 1.2fr 1fr' 
                          : '1.4fr 1fr 1fr 70px 70px', 
                        gap: 6 
                      }}>
                        <input
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder={formData.type === 'plot' || formData.type === 'land' ? 'Plot / Phase (e.g. Corner Parcel A-12)' : formData.type === 'commercial' ? 'Unit Name (e.g. Ground Floor Anchor)' : formData.type === 'mixed_use' ? 'Unit Name (e.g. Dual-Suite 201)' : 'Variant Name (e.g. 4 BHK Grande)'}
                          value={newVariantInput.name}
                          onChange={e => setNewVariantInput({ ...newVariantInput, name: e.target.value })}
                        />
                        <input
                          type="number"
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder={formData.type === 'plot' || formData.type === 'land' ? 'Area (Sq.Yds / Acres)' : 'Super Area (Sq.Ft)'}
                          value={newVariantInput.sqft}
                          onChange={e => setNewVariantInput({ ...newVariantInput, sqft: e.target.value })}
                        />
                        <input
                          type="number"
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder="Price (₹ Lakhs)"
                          value={newVariantInput.price_lakhs}
                          onChange={e => setNewVariantInput({ ...newVariantInput, price_lakhs: e.target.value })}
                        />
                        {formData.type !== 'plot' && formData.type !== 'land' && formData.type !== 'commercial_land' && formData.type !== 'farmhouse_land' && formData.type !== 'commercial' && formData.type !== 'warehouse' && (
                          <>
                            <input
                              type="number"
                              className="form-input"
                              style={{ height: 32, fontSize: 12 }}
                              placeholder="Beds"
                              value={newVariantInput.bedrooms}
                              onChange={e => setNewVariantInput({ ...newVariantInput, bedrooms: Number(e.target.value) })}
                            />
                            <input
                              type="number"
                              className="form-input"
                              style={{ height: 32, fontSize: 12 }}
                              placeholder="Baths"
                              value={newVariantInput.bathrooms}
                              onChange={e => setNewVariantInput({ ...newVariantInput, bathrooms: Number(e.target.value) })}
                            />
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          className="form-input"
                          style={{ height: 32, fontSize: 12, flex: 1 }}
                          placeholder="Variant Floor Plan URL (optional - paste image link or upload below)"
                          value={newVariantInput.floor_plan_url}
                          onChange={e => setNewVariantInput({ ...newVariantInput, floor_plan_url: e.target.value })}
                        />

                        <label className="btn btn-secondary" style={{ cursor: 'pointer', height: 32, fontSize: 11, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                          <Upload size={12} />
                          <span>Upload Plan</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleNewVariantPlanUpload(file);
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: 32, fontSize: 12, padding: '0 14px', whiteSpace: 'nowrap', fontWeight: 600 }}
                          onClick={handleAddVariant}
                        >
                          + Add Variant
                        </button>
                      </div>
                    </div>
                  </div>

                {/* Custom Room Dimensions Matrix with Per-Variant Scoping */}
                <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', padding: 14, borderRadius: 12, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Custom Room Dimensions Schedule</span>
                        <span style={{ fontSize: 10, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          Per-Variant Dimensions
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                        Different unit layouts have different room sizes (e.g. Master Bedroom 18x14 ft vs 22x16 ft in Penthouse). Select which variant you are configuring below.
                      </p>
                    </div>
                  </div>

                  {/* Scope Selector: Master Project vs Each Unit Variant */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                    <button
                      type="button"
                      onClick={() => setActiveDimensionScope('master')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: activeDimensionScope === 'master' ? 700 : 500,
                        border: '1px solid',
                        borderColor: activeDimensionScope === 'master' ? 'var(--color-primary)' : 'var(--color-border)',
                        background: activeDimensionScope === 'master' ? 'var(--color-primary)' : 'var(--color-card)',
                        color: activeDimensionScope === 'master' ? '#ffffff' : 'var(--color-fg)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: activeDimensionScope === 'master' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 150ms ease'
                      }}
                    >
                      🏛️ Default / Master Specs ({formData.custom_dimensions?.length || 0})
                    </button>

                    {formData.variants.map((v, idx) => {
                      const isScopeActive = activeDimensionScope === String(idx);
                      const varDimsCount = Array.isArray(v.custom_dimensions) ? v.custom_dimensions.length : 0;

                      return (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => setActiveDimensionScope(String(idx))}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: isScopeActive ? 700 : 500,
                            border: '1px solid',
                            borderColor: isScopeActive ? 'var(--color-primary)' : 'var(--color-border)',
                            background: isScopeActive ? 'var(--color-primary)' : 'var(--color-card)',
                            color: isScopeActive ? '#ffffff' : 'var(--color-fg)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: isScopeActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
                            transition: 'all 150ms ease'
                          }}
                        >
                          📐 {v.name || `Variant #${idx + 1}`} ({varDimsCount})
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Dimension List & Inline Form */}
                  {(() => {
                    const currentDimensions = activeDimensionScope === 'master'
                      ? (formData.custom_dimensions || [])
                      : (Array.isArray(formData.variants[Number(activeDimensionScope)]?.custom_dimensions)
                          ? formData.variants[Number(activeDimensionScope)].custom_dimensions
                          : []);

                    const scopeLabel = activeDimensionScope === 'master'
                      ? 'Default / Master Plan'
                      : (formData.variants[Number(activeDimensionScope)]?.name || `Variant #${Number(activeDimensionScope) + 1}`);

                    return (
                      <div style={{ background: 'var(--color-card)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>
                            Configuring Dimensions for: <strong style={{ color: 'var(--color-fg)' }}>{scopeLabel}</strong>
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--color-muted-fg)' }}>
                            {currentDimensions.length} Room{currentDimensions.length !== 1 ? 's' : ''} added
                          </span>
                        </div>

                        {currentDimensions.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {currentDimensions.map((d, idx) => (
                              <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-bg)', padding: '5px 10px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 11 }}>
                                <span style={{ fontWeight: 700 }}>{d.room || d.room_name}:</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{d.dimension || d.dimensions}</span>
                                {(d.note || d.notes) && <span style={{ color: 'var(--color-muted-fg)', fontSize: 10 }}>({d.note || d.notes})</span>}
                                <button
                                  type="button"
                                  onClick={() => removeRoom(idx)}
                                  style={{ background: 'none', border: 'none', color: 'var(--color-destructive, #ef4444)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                  title="Remove room"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted-fg)' }}>
                            {activeDimensionScope === 'master' 
                              ? 'No default room dimensions specified yet. Add rooms below or let website generate standard luxury sizes.' 
                              : 'No custom room sizes for this variant yet. It will inherit the master plan room sizes or auto-scale by sq.ft.'}
                          </p>
                        )}

                        {/* Inline Room Adder */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 80px', gap: 6, paddingTop: 4, borderTop: '1px dashed var(--color-border)' }}>
                          <input
                            className="form-input"
                            style={{ height: 32, fontSize: 12 }}
                            placeholder="Room (e.g. Master Suite / Balcony Deck)"
                            value={newRoomInput.room_name}
                            onChange={e => setNewRoomInput({ ...newRoomInput, room_name: e.target.value })}
                          />
                          <input
                            className="form-input"
                            style={{ height: 32, fontSize: 12 }}
                            placeholder="Size (e.g. 18'4&quot; x 14'0&quot;)"
                            value={newRoomInput.dimensions}
                            onChange={e => setNewRoomInput({ ...newRoomInput, dimensions: e.target.value })}
                          />
                          <input
                            className="form-input"
                            style={{ height: 32, fontSize: 12 }}
                            placeholder="Note (e.g. En-suite + Wardrobe)"
                            value={newRoomInput.notes}
                            onChange={e => setNewRoomInput({ ...newRoomInput, notes: e.target.value })}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ height: 32, fontSize: 12, padding: '0 8px', fontWeight: 600 }}
                            onClick={handleAddRoom}
                          >
                            <Plus size={13} /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                </div>
              )}
            </>
          )}

            {/* ========================================================
                TAB 4: TRANSIT & COMMUTE
                ======================================================== */}
            {activeTab === 'transit' && (
              <>
                {/* Tactile Switch Banner */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setFormData(prev => ({ ...prev, show_transit: !prev.show_transit }))}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFormData(prev => ({ ...prev, show_transit: !prev.show_transit })); } }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 14px', 
                    background: formData.show_transit ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-bg-secondary, #F1F5FD)', 
                    borderRadius: 12, 
                    border: formData.show_transit ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: formData.show_transit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                      color: formData.show_transit ? '#059669' : 'var(--color-muted-fg)'
                    }}>
                      <Navigation size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-fg)' }}>
                          Transit, Metro &amp; Connectivity Schedule
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: formData.show_transit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: formData.show_transit ? '#059669' : '#64748b'
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: formData.show_transit ? '#10b981' : '#94a3b8'
                          }} />
                          {formData.show_transit ? 'Active on Website' : 'Hidden on Website'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                        Display drive-time badges to airports, metro stations, expressways &amp; CBDs.
                      </p>
                    </div>
                  </div>

                  {/* iOS Style Tactile Switch */}
                  <div style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: formData.show_transit ? '#10b981' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 200ms ease',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 2,
                      left: formData.show_transit ? 22 : 2,
                      transition: 'left 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {!formData.show_transit ? (
                  <div style={{
                    padding: '32px 20px',
                    borderRadius: 14,
                    background: 'var(--color-bg-secondary, #F1F5FD)',
                    border: '1.5px dashed var(--color-border)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(100, 116, 139, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-muted-fg)'
                    }}>
                      <Navigation size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fg)', display: 'block' }}>
                        Transit &amp; Connectivity Schedule is Disabled
                      </span>
                      <p style={{ margin: '6px auto 0', fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: 440, lineHeight: 1.5 }}>
                        This section is turned OFF. Strategic commute landmarks, drive times to airports/metros, and interactive location pins are completely hidden from buyers on the website.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, height: 32, padding: '0 14px', marginTop: 4, fontWeight: 600 }}
                      onClick={() => setFormData(prev => ({ ...prev, show_transit: true }))}
                    >
                      Turn On Transit &amp; Commute Matrix
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Google Maps / Pin Location URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={formData.locationLink}
                        onChange={e => setFormData({ ...formData, locationLink: e.target.value })}
                        placeholder="https://maps.google.com/?q=... or https://maps.app.goo.gl/..."
                      />
                    </div>

                    {/* Commute Landmarks Builder */}
                    <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>Strategic Commute Landmarks ({formData.custom_commute_points.length})</span>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                            Appears as interactive distance & time badges in the property location section
                          </p>
                        </div>
                      </div>

                      {formData.custom_commute_points.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          {formData.custom_commute_points.map((p, idx) => (
                            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-card)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12 }}>
                              <span style={{ fontWeight: 600 }}>{p.landmark}:</span>
                              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{p.time_mins} mins</span>
                              {p.distance_km && <span style={{ color: 'var(--color-muted-fg)', fontSize: 11 }}>({p.distance_km} km)</span>}
                              <span style={{ fontSize: 10, background: 'var(--color-muted)', padding: '1px 4px', borderRadius: 3 }}>{p.category}</span>
                              <button
                                type="button"
                                onClick={() => removeCommute(idx)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-destructive, #ef4444)', cursor: 'pointer', padding: 0 }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr 80px', gap: 6, background: 'var(--color-card)', padding: 8, borderRadius: 8, border: '1px dashed var(--color-border)' }}>
                        <input
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder="Landmark (e.g. Cyber Hub)"
                          value={newCommuteInput.landmark}
                          onChange={e => setNewCommuteInput({ ...newCommuteInput, landmark: e.target.value })}
                        />
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder="Dist (km)"
                          value={newCommuteInput.distance_km}
                          onChange={e => setNewCommuteInput({ ...newCommuteInput, distance_km: e.target.value })}
                        />
                        <input
                          type="number"
                          className="form-input"
                          style={{ height: 32, fontSize: 12 }}
                          placeholder="Time (mins)"
                          value={newCommuteInput.time_mins}
                          onChange={e => setNewCommuteInput({ ...newCommuteInput, time_mins: e.target.value })}
                        />
                        <select
                          className="form-select"
                          style={{ height: 32, fontSize: 12 }}
                          value={newCommuteInput.category}
                          onChange={e => setNewCommuteInput({ ...newCommuteInput, category: e.target.value })}
                        >
                          <option value="Transit">Transit / Metro</option>
                          <option value="Airport">Airport / Aerocity</option>
                          <option value="Business">Business District</option>
                          <option value="School">School / University</option>
                          <option value="Hospital">Hospital</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ height: 32, fontSize: 12, padding: '0 8px' }}
                          onClick={handleAddCommute}
                        >
                          <Plus size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ========================================================
                TAB 5: LEGAL DILIGENCE & BADGES
                ======================================================== */}
            {activeTab === 'legal' && (
              <>
                {/* Tactile Switch Banner */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setFormData(prev => ({ ...prev, show_rera: !prev.show_rera }))}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFormData(prev => ({ ...prev, show_rera: !prev.show_rera })); } }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 14px', 
                    background: formData.show_rera ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-bg-secondary, #F1F5FD)', 
                    borderRadius: 12, 
                    border: formData.show_rera ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: formData.show_rera ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                      color: formData.show_rera ? '#059669' : 'var(--color-muted-fg)'
                    }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-fg)' }}>
                          RERA Compliance &amp; Legal Title Diligence
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: formData.show_rera ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: formData.show_rera ? '#059669' : '#64748b'
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: formData.show_rera ? '#10b981' : '#94a3b8'
                          }} />
                          {formData.show_rera ? 'Active on Website' : 'Hidden on Website'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                        Display official RERA registration number, verification portal link &amp; legal audit report.
                      </p>
                    </div>
                  </div>

                  {/* iOS Style Tactile Switch */}
                  <div style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: formData.show_rera ? '#10b981' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 200ms ease',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 2,
                      left: formData.show_rera ? 22 : 2,
                      transition: 'left 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {!formData.show_rera ? (
                  <div style={{
                    padding: '32px 20px',
                    borderRadius: 14,
                    background: 'var(--color-bg-secondary, #F1F5FD)',
                    border: '1.5px dashed var(--color-border)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(100, 116, 139, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-muted-fg)'
                    }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fg)', display: 'block' }}>
                        RERA Compliance &amp; Diligence is Disabled
                      </span>
                      <p style={{ margin: '6px auto 0', fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: 440, lineHeight: 1.5 }}>
                        This section is turned OFF. Official RERA registration number, state authority portal verification link, and legal title remarks are completely hidden from buyers on the website.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, height: 32, padding: '0 14px', marginTop: 4, fontWeight: 600 }}
                      onClick={() => setFormData(prev => ({ ...prev, show_rera: true }))}
                    >
                      Turn On RERA &amp; Legal Diligence
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">RERA Registration No. *</label>
                        <input
                          className="form-input"
                          value={formData.reraNumber}
                          onChange={e => setFormData({ ...formData, reraNumber: e.target.value })}
                          placeholder="e.g. HRERA-GGM-2024-892"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Official State Authority Portal Link</label>
                        <input
                          type="url"
                          className="form-input"
                          value={formData.rera_portal_url}
                          onChange={e => setFormData({ ...formData, rera_portal_url: e.target.value })}
                          placeholder="https://haryanarera.gov.in/ or state portal link"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Regulatory Authority Name</label>
                        <input
                          className="form-input"
                          value={formData.rera_authority || ''}
                          onChange={e => setFormData({ ...formData, rera_authority: e.target.value })}
                          placeholder="e.g. Haryana RERA (HRERA) Gurugram / UP RERA"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Custom Diligence Card Heading</label>
                        <input
                          className="form-input"
                          value={formData.rera_custom_title || ''}
                          onChange={e => setFormData({ ...formData, rera_custom_title: e.target.value })}
                          placeholder="e.g. Regulatory Clearance & Title Diligence"
                        />
                      </div>
                    </div>

                    {/* Custom Material / Legal Text Written By User */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Custom RERA &amp; Legal Disclosures (What to show)</label>
                        <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Displayed directly on website diligence card</span>
                      </div>
                      <textarea
                        className="form-input"
                        rows={3}
                        style={{ height: 'auto', padding: '8px 10px', fontSize: 12, lineHeight: 1.5 }}
                        value={formData.rera_details_text || ''}
                        onChange={e => setFormData({ ...formData, rera_details_text: e.target.value })}
                        placeholder="Write custom RERA status, approval date, specific project clearances, land title notes, or disclosures you want buyers to see..."
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Legal Title &amp; Registry Status</label>
                        <input
                          className="form-input"
                          value={formData.legal_status_tag}
                          onChange={e => setFormData({ ...formData, legal_status_tag: e.target.value })}
                          placeholder="e.g. Freehold Immediate Registry, Clear Title"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">RERA Certificate PDF / Dossier Link</label>
                        <input
                          type="url"
                          className="form-input"
                          value={formData.rera_document_url || ''}
                          onChange={e => setFormData({ ...formData, rera_document_url: e.target.value })}
                          placeholder="https://.../rera-certificate.pdf"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Audit Remarks &amp; Approvals Summary</label>
                      <input
                        className="form-input"
                        value={formData.legal_remarks}
                        onChange={e => setFormData({ ...formData, legal_remarks: e.target.value })}
                        placeholder="e.g. 30-year search report completed; Nil-encumbrance certificate verified."
                      />
                    </div>
                    {/* Dynamic RERA 4-Block Diligence Module */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShieldCheck size={16} style={{ color: '#059669' }} />
                            <label className="form-label" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-fg)' }}>
                              RERA Diligence Blocks (4-Block Section &amp; Custom Cards)
                            </label>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted-fg)' }}>
                            Control what blocks buyers see on the public website. Toggle show/hide, edit block details, or add custom diligence cards.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ height: 30, fontSize: 11, padding: '0 10px', gap: 4, fontWeight: 600 }}
                          onClick={handleAddReraBlock}
                        >
                          <Plus size={12} /> Add RERA Block
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 10 }}>
                        {currentReraBlocks.map((block, bIdx) => (
                          <div
                            key={block.id || bIdx}
                            style={{
                              background: block.is_visible ? 'var(--color-card, #ffffff)' : 'var(--color-bg-secondary, #F8FAFC)',
                              border: `1.5px solid ${block.is_visible ? 'var(--color-border, #E2E8F0)' : '#E2E8F0'}`,
                              borderRadius: 12,
                              padding: 12,
                              opacity: block.is_visible ? 1 : 0.65,
                              transition: 'all 200ms ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                              position: 'relative',
                              boxShadow: block.is_visible ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                            }}
                          >
                            {/* Block Header: Visibility Switch, Type Badge, Delete */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleReraBlockVisibility(block.id)}
                                  title={block.is_visible ? 'Click to Hide on Website' : 'Click to Show on Website'}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '3px 9px',
                                    borderRadius: 16,
                                    cursor: 'pointer',
                                    border: 'none',
                                    background: block.is_visible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.18)',
                                    color: block.is_visible ? '#059669' : '#64748b',
                                    transition: 'all 150ms ease'
                                  }}
                                >
                                  {block.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                  <span>{block.is_visible ? 'Visible' : 'Hidden'}</span>
                                </button>

                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  background: block.is_custom ? 'rgba(217, 119, 6, 0.12)' : 'rgba(37, 99, 235, 0.1)',
                                  color: block.is_custom ? '#b45309' : '#1d4ed8'
                                }}>
                                  {block.is_custom ? 'Custom' : 'Pre-Made'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveReraBlock(block.id)}
                                title="Delete Block"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: 4,
                                  borderRadius: 6,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Block Title & Status Tag Inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
                              <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', marginBottom: 2 }}>
                                  Card Title
                                </label>
                                <input
                                  className="form-input"
                                  style={{ height: 30, fontSize: 11, fontWeight: 600 }}
                                  value={block.title}
                                  onChange={e => handleUpdateReraBlock(block.id, 'title', e.target.value)}
                                  placeholder="e.g. Statutory Sanctions & Approvals"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', marginBottom: 2 }}>
                                  Status / Badge
                                </label>
                                <input
                                  className="form-input"
                                  style={{ height: 30, fontSize: 11 }}
                                  value={block.status}
                                  onChange={e => handleUpdateReraBlock(block.id, 'status', e.target.value)}
                                  placeholder="e.g. Verified Clear"
                                />
                              </div>
                            </div>

                            {/* Block Description */}
                            <div>
                              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-muted-fg)', marginBottom: 2 }}>
                                Detailed Description / Diligence Notes
                              </label>
                              <textarea
                                className="form-input"
                                rows={2}
                                style={{ height: 'auto', padding: '6px 8px', fontSize: 11, lineHeight: 1.4 }}
                                value={block.desc}
                                onChange={e => handleUpdateReraBlock(block.id, 'desc', e.target.value)}
                                placeholder="Details shown to buyers on the website..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Highlights Module */}
                <div style={{ background: 'var(--color-bg-secondary, #F1F5FD)', padding: 14, borderRadius: 12, border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-fg)' }}>
                        Executive Highlights (&quot;Why Consider This Asset&quot;)
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                      Auto-generated &amp; custom bullet points
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--color-muted-fg)', lineHeight: 1.4 }}>
                    Displayed in the hero card on the property page. Use the switches to toggle individual visibility, edit text directly, or add custom highlights.
                  </p>

                  {/* Highlights Items List */}
                  {currentHighlightsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {currentHighlightsList.map((hl, idx) => (
                        <div
                          key={hl.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: hl.is_visible ? 'var(--color-card, #ffffff)' : 'rgba(241, 245, 249, 0.7)',
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: `1px solid ${hl.is_visible ? 'var(--color-border, #E2E8F0)' : '#cbd5e1'}`,
                            opacity: hl.is_visible ? 1 : 0.6,
                            transition: 'all 150ms ease'
                          }}
                        >
                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleHighlightVisibility(hl.id)}
                            title={hl.is_visible ? 'Visible on website (click to hide)' : 'Hidden on website (click to show)'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 14,
                              cursor: 'pointer',
                              border: 'none',
                              background: hl.is_visible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.18)',
                              color: hl.is_visible ? '#059669' : '#64748b',
                              flexShrink: 0
                            }}
                          >
                            {hl.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            <span>{hl.is_visible ? 'Show' : 'Hide'}</span>
                          </button>

                          {/* Auto-Generated vs Custom Indicator Badge */}
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            background: hl.is_custom ? 'rgba(217, 119, 6, 0.12)' : 'rgba(37, 99, 235, 0.1)',
                            color: hl.is_custom ? '#b45309' : '#1d4ed8',
                            flexShrink: 0
                          }}>
                            {hl.is_custom ? 'Custom' : 'Auto-Gen'}
                          </span>

                          {/* Editable Text Input */}
                          <input
                            className="form-input"
                            style={{
                              height: 30,
                              fontSize: 12,
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              padding: '2px 6px',
                              textDecoration: hl.is_visible ? 'none' : 'line-through',
                              color: hl.is_visible ? 'var(--color-fg)' : 'var(--color-muted-fg)'
                            }}
                            value={hl.text}
                            onChange={e => handleUpdateHighlightText(hl.id, e.target.value)}
                            placeholder="Highlight item description..."
                          />

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(hl.id)}
                            title="Delete Highlight"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                      No highlights configured yet. Add one below.
                    </div>
                  )}

                  {/* Add Custom Highlight Input */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="form-input"
                      style={{ height: 34, fontSize: 12, flex: 1 }}
                      placeholder="Add custom highlight (e.g. 5 Mins to Rapid Metro) and click Add or press Enter..."
                      value={newHighlightInput}
                      onChange={e => setNewHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomHighlight();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ height: 34, fontSize: 12, gap: 4, fontWeight: 600 }}
                      onClick={handleAddCustomHighlight}
                    >
                      <Plus size={13} /> Add Custom Highlight
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Footer Navigation */}
            <div className="modal-footer" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeTab !== 'overview' && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: 13 }}
                    onClick={() => {
                      const tabIds = TABS.map(t => t.id);
                      const idx = tabIds.indexOf(activeTab);
                      if (idx > 0) setActiveTab(tabIds[idx - 1]);
                    }}
                  >
                    ← Previous
                  </button>
                )}
                {activeTab !== 'legal' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: 13 }}
                    onClick={() => {
                      const tabIds = TABS.map(t => t.id);
                      const idx = tabIds.indexOf(activeTab);
                      if (idx < tabIds.length - 1) setActiveTab(tabIds[idx + 1]);
                    }}
                  >
                    Next Tab →
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: 13, fontWeight: 600 }}>
                  {editingProperty ? 'Save & Sync Listing' : 'Publish Property to Website & CRM'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
