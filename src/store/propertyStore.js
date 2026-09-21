import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/supabase';
import { sanitizeImageList, sanitizeImageUrl } from '../utils/storageUpload';

// Detail columns added by supabase/migrations/20260921000000_listing_detail_fields.sql.
// Kept in one list so saves can retry without them when the migration
// hasn't been applied to the live project yet (PGRST204 fallback).
const NEW_DETAIL_KEYS = ['area_unit', 'cabins', 'pantry', 'image_tags'];
const VALID_AREA_UNITS = ['sqft', 'sqyd', 'sqm', 'acre'];

function isMissingColumnError(err) {
  return Boolean(
    err &&
    err.code === 'PGRST204' &&
    NEW_DETAIL_KEYS.some((k) => `${err.message || ''}`.includes(k))
  );
}

function stripNewDetailKeys(payload) {
  const next = { ...payload };
  NEW_DETAIL_KEYS.forEach((k) => delete next[k]);
  return next;
}

// Helper to normalize Supabase property schema to CRM internal schema
export function normalizeCrmProperty(raw) {
  let images = [];
  if (Array.isArray(raw.images)) {
    images = raw.images.filter(img => typeof img === 'string' && img.trim().length > 0);
  } else if (typeof raw.images === 'string') {
    try {
      const parsed = JSON.parse(raw.images);
      if (Array.isArray(parsed)) images = parsed;
    } catch {}
  }

  let amenities = [];
  if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities;
  } else if (typeof raw.amenities === 'string') {
    amenities = raw.amenities.split(',').map(s => s.trim()).filter(Boolean);
  }

  const defaultImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop';
  const mainImage = images[0] || raw.imageUrl || defaultImg;

  const bedroomsNum = raw.bedrooms !== undefined ? Number(raw.bedrooms) : (parseInt(raw.configuration || raw.bhk) || 0);
  const bathroomsNum = raw.bathrooms !== undefined ? Number(raw.bathrooms) : (bedroomsNum > 1 ? bedroomsNum - 1 : 1);

  return {
    id: raw.id,
    name: raw.title || raw.name || 'Untitled Property',
    title: raw.title || raw.name || 'Untitled Property',
    builder: raw.builder || 'TGV Verified Developer',
    builder_id: raw.builder_id || null,
    type: raw.property_type || raw.type || 'residential',
    configuration: raw.configuration || (raw.bedrooms ? `${raw.bedrooms} BHK` : 'Standard'),
    bhk: raw.configuration || (raw.bedrooms ? `${raw.bedrooms} BHK` : 'Standard'),
    bedrooms: bedroomsNum,
    bathrooms: bathroomsNum,
    areaSqFt: Number(raw.sqft) || Number(raw.areaSqFt) || 0,
    priceLakhs: Number(raw.price_lakhs) || Number(raw.priceLakhs) || 0,
    locality: raw.location_sector || raw.locality || 'Prime Locality',
    city: raw.location_city || raw.city || 'Delhi NCR',
    status: raw.status || 'ready_to_move',
    possessionDate: raw.possession_status || raw.possessionDate || 'Ready to Move',
    reraNumber: raw.rera_number || raw.reraNumber || '',
    locationLink: raw.locationLink || (raw.location_sector ? `https://maps.google.com/?q=${encodeURIComponent(raw.location_sector + ', ' + (raw.location_city || 'India'))}` : ''),
    description: raw.description || '',
    amenities: amenities,
    imageUrl: mainImage,
    images: images.length > 0 ? images : [mainImage],
    tier: raw.tier || 'luxury',
    visibility: raw.visibility || (raw.tier === 'normal' ? 'unlisted' : 'public'),
    is_featured: Boolean(raw.is_featured),
    carpet_sqft: Number(raw.carpet_sqft) || undefined,
    facing: raw.facing || 'North-East Facing',
    parking: raw.parking || '2 Covered Parking',
    furnishing_status: raw.furnishing_status || 'semi-furnished',
    purpose: raw.purpose || 'buy',
    show_rera: raw.show_rera !== undefined ? (raw.show_rera === false || raw.show_rera === 'false' || raw.show_rera === 0 || raw.show_rera === '0' ? false : true) : true,
    show_floor_plan: raw.show_floor_plan !== undefined ? (raw.show_floor_plan === false || raw.show_floor_plan === 'false' || raw.show_floor_plan === 0 || raw.show_floor_plan === '0' ? false : true) : true,
    show_transit: raw.show_transit !== undefined ? (raw.show_transit === false || raw.show_transit === 'false' || raw.show_transit === 0 || raw.show_transit === '0' ? false : true) : true,
    brochure_url: raw.brochure_url || '',
    video_url: raw.video_url || '',
    virtual_tour_url: raw.virtual_tour_url || '',
    floor_plan_url: raw.floor_plan_url || '',
    area_unit: VALID_AREA_UNITS.includes(raw.area_unit) ? raw.area_unit : 'sqft',
    cabins: raw.cabins !== undefined && raw.cabins !== null && raw.cabins !== '' ? Number(raw.cabins) : '',
    pantry: Boolean(raw.pantry),
    image_tags: Array.isArray(raw.image_tags) ? raw.image_tags.filter(t => typeof t === 'string') : [],
    rera_portal_url: raw.rera_portal_url || '',
    legal_status_tag: raw.legal_status_tag || 'Clear Title',
    legal_remarks: raw.legal_remarks || '',
    rera_authority: raw.rera_authority || '',
    rera_custom_title: raw.rera_custom_title || '',
    rera_details_text: raw.rera_details_text || '',
    rera_document_url: raw.rera_document_url || '',
    possession_timeline: raw.possession_timeline || raw.possession_status || 'Ready to Move',
    floor_number: raw.floor_number !== undefined && raw.floor_number !== null ? Number(raw.floor_number) : '',
    total_floors: raw.total_floors !== undefined && raw.total_floors !== null ? Number(raw.total_floors) : '',
    balconies: raw.balconies !== undefined && raw.balconies !== null ? Number(raw.balconies) : '',
    maintenance_charges: raw.maintenance_charges || '',
    road_width_ft: raw.road_width_ft !== undefined && raw.road_width_ft !== null ? Number(raw.road_width_ft) : '',
    dimensions_ft: raw.dimensions_ft || '',
    boundary_wall: Boolean(raw.boundary_wall),
    far_fsi: raw.far_fsi || '',
    frontage_ft: raw.frontage_ft !== undefined && raw.frontage_ft !== null ? Number(raw.frontage_ft) : '',
    occupancy_status: raw.occupancy_status || 'Vacant',
    power_load_kva: raw.power_load_kva !== undefined && raw.power_load_kva !== null ? Number(raw.power_load_kva) : '',
    variants: Array.isArray(raw.variants) ? raw.variants : (typeof raw.variants === 'string' ? JSON.parse(raw.variants || '[]') : []),
    custom_dimensions: Array.isArray(raw.custom_dimensions) ? raw.custom_dimensions : (typeof raw.custom_dimensions === 'string' ? JSON.parse(raw.custom_dimensions || '[]') : []),
    custom_commute_points: Array.isArray(raw.custom_commute_points) ? raw.custom_commute_points : (typeof raw.custom_commute_points === 'string' ? JSON.parse(raw.custom_commute_points || '[]') : []),
    key_highlights: (() => {
      if (Array.isArray(raw.key_highlights)) {
        return raw.key_highlights.map((h, i) => {
          if (typeof h === 'string') {
            return { id: `hl-${i}`, text: h, is_visible: true, is_custom: false };
          }
          return {
            id: h.id || `hl-${i}`,
            text: h.text || '',
            is_visible: h.is_visible !== false,
            is_custom: Boolean(h.is_custom)
          };
        });
      }
      if (typeof raw.key_highlights === 'string') {
        try {
          const parsed = JSON.parse(raw.key_highlights);
          if (Array.isArray(parsed)) {
            return parsed.map((h, i) => typeof h === 'string' ? { id: `hl-${i}`, text: h, is_visible: true, is_custom: false } : { id: h.id || `hl-${i}`, text: h.text || '', is_visible: h.is_visible !== false, is_custom: Boolean(h.is_custom) });
          }
        } catch {}
        return raw.key_highlights.split(',').map((s, i) => ({ id: `hl-${i}`, text: s.trim(), is_visible: true, is_custom: false })).filter(h => h.text);
      }
      return [];
    })(),
    rera_blocks: (() => {
      if (Array.isArray(raw.rera_blocks)) {
        return raw.rera_blocks;
      }
      if (typeof raw.rera_blocks === 'string') {
        try {
          const parsed = JSON.parse(raw.rera_blocks);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    })(),
    created_at: raw.created_at
  };
}

export const usePropertyStore = create(
  persist(
    (set, get) => ({
      properties: [],
      isLoading: false,
      error: null,

      // Live fetch from Supabase
      fetchProperties: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching properties from Supabase:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data) {
            const normalized = data.map(normalizeCrmProperty);
            set({ properties: normalized, isLoading: false });
          }
        } catch (err) {
          console.error('Failed to query properties:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      getProperties: () => {
        return get().properties;
      },
      
      getLuxuryProperties: () => {
        return get().properties.filter(p => p.tier === 'luxury');
      },

      getNormalProperties: () => {
        return get().properties.filter(p => p.tier === 'normal');
      },

      // Filter properties by tier
      getPropertiesByTier: (tier) => {
        if (!tier || tier === 'all') return get().properties;
        return get().properties.filter(p => p.tier === tier);
      },

      // Filter properties for website
      getPublicWebsiteProperties: () => {
        return get().properties.filter(p => p.visibility === 'public' && p.tier === 'luxury');
      },

      getUnlistedProperties: () => {
        return get().properties.filter(p => p.visibility === 'unlisted' || p.visibility === 'private');
      },
      
      getProperty: (id) => {
        return get().properties.find(p => p.id === id) || null;
      },
      
      addProperty: async (prop) => {
        const uniqueSuffix = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const propertyId = prop.id || `PROP-${uniqueSuffix}`;

        const normalized = normalizeCrmProperty({
          ...prop,
          id: propertyId
        });

        // 1. Optimistic local state update
        set(state => ({ properties: [normalized, ...state.properties] }));

        // 2. Persist live to Supabase with bulletproof type coercion
        try {
          const insertPayload = {
            id: normalized.id,
            title: normalized.name || 'Untitled Property',
            price_lakhs: Number(normalized.priceLakhs) || 0,
            location_city: normalized.city || 'Delhi NCR',
            location_sector: normalized.locality || 'Prime Locality',
            bedrooms: Number(normalized.bedrooms) || 0,
            bathrooms: Number(normalized.bathrooms) || 1,
            sqft: Number(normalized.areaSqFt) || 0,
            carpet_sqft: normalized.carpet_sqft !== '' && normalized.carpet_sqft !== undefined && normalized.carpet_sqft !== null && !isNaN(normalized.carpet_sqft) ? Number(normalized.carpet_sqft) : null,
            furnishing_status: normalized.furnishing_status || 'semi-furnished',
            possession_status: normalized.possessionDate || 'Ready to Move',
            facing: normalized.facing || 'North-East Facing',
            parking: normalized.parking || '2 Covered Parking',
            purpose: normalized.purpose || 'buy',
            show_rera: normalized.show_rera === false || normalized.show_rera === 'false' ? false : true,
            show_floor_plan: normalized.show_floor_plan === false || normalized.show_floor_plan === 'false' ? false : true,
            show_transit: normalized.show_transit === false || normalized.show_transit === 'false' ? false : true,
            status: normalized.status || 'available',
            is_featured: Boolean(normalized.is_featured),
            builder_id: normalized.builder_id || null,
            property_type: normalized.type || 'residential',
            configuration: normalized.configuration || normalized.bhk || null,
            rera_number: normalized.reraNumber || null,
            description: normalized.description || null,
            // Never persist inline blobs — Storage / remote URLs only
            images: sanitizeImageList(Array.isArray(normalized.images) ? normalized.images : (normalized.imageUrl ? [normalized.imageUrl] : [])),
            amenities: Array.isArray(normalized.amenities) ? normalized.amenities : (typeof normalized.amenities === 'string' ? normalized.amenities.split(',').map(s => s.trim()).filter(Boolean) : []),
            tier: normalized.tier || 'luxury',
            visibility: normalized.visibility || 'public',
            brochure_url: normalized.brochure_url || null,
            video_url: normalized.video_url || null,
            virtual_tour_url: normalized.virtual_tour_url || null,
            floor_plan_url: sanitizeImageUrl(normalized.floor_plan_url) || null,
            area_unit: VALID_AREA_UNITS.includes(normalized.area_unit) ? normalized.area_unit : 'sqft',
            cabins: normalized.cabins !== '' && normalized.cabins !== undefined && normalized.cabins !== null && !isNaN(normalized.cabins) ? Number(normalized.cabins) : null,
            pantry: Boolean(normalized.pantry),
            image_tags: Array.isArray(normalized.image_tags) ? normalized.image_tags.filter(t => typeof t === 'string') : [],
            rera_portal_url: normalized.rera_portal_url || null,
            legal_status_tag: normalized.legal_status_tag || null,
            legal_remarks: normalized.legal_remarks || null,
            rera_authority: normalized.rera_authority || null,
            rera_custom_title: normalized.rera_custom_title || null,
            rera_details_text: normalized.rera_details_text || null,
            rera_document_url: normalized.rera_document_url || null,
            possession_timeline: normalized.possession_timeline || null,
            floor_number: normalized.floor_number !== '' && normalized.floor_number !== undefined && normalized.floor_number !== null && !isNaN(normalized.floor_number) ? Number(normalized.floor_number) : null,
            total_floors: normalized.total_floors !== '' && normalized.total_floors !== undefined && normalized.total_floors !== null && !isNaN(normalized.total_floors) ? Number(normalized.total_floors) : null,
            balconies: normalized.balconies !== '' && normalized.balconies !== undefined && normalized.balconies !== null && !isNaN(normalized.balconies) ? Number(normalized.balconies) : null,
            maintenance_charges: normalized.maintenance_charges || null,
            road_width_ft: normalized.road_width_ft !== '' && normalized.road_width_ft !== undefined && normalized.road_width_ft !== null && !isNaN(normalized.road_width_ft) ? Number(normalized.road_width_ft) : null,
            dimensions_ft: normalized.dimensions_ft || null,
            boundary_wall: Boolean(normalized.boundary_wall),
            far_fsi: normalized.far_fsi || null,
            frontage_ft: normalized.frontage_ft !== '' && normalized.frontage_ft !== undefined && normalized.frontage_ft !== null && !isNaN(normalized.frontage_ft) ? Number(normalized.frontage_ft) : null,
            occupancy_status: normalized.occupancy_status || null,
            power_load_kva: normalized.power_load_kva !== '' && normalized.power_load_kva !== undefined && normalized.power_load_kva !== null && !isNaN(normalized.power_load_kva) ? Number(normalized.power_load_kva) : null,
            variants: Array.isArray(normalized.variants) ? normalized.variants.map((v) => ({ ...v, floor_plan_url: sanitizeImageUrl(v.floor_plan_url) })) : [],
            custom_dimensions: Array.isArray(normalized.custom_dimensions) ? normalized.custom_dimensions : [],
            custom_commute_points: Array.isArray(normalized.custom_commute_points) ? normalized.custom_commute_points : [],
            key_highlights: Array.isArray(normalized.key_highlights) ? normalized.key_highlights : [],
            rera_blocks: Array.isArray(normalized.rera_blocks) ? normalized.rera_blocks : []
          };

          const { error } = await supabase.from('properties').insert(insertPayload);
          let insertError = error;
          if (isMissingColumnError(insertError)) {
            console.warn('Detail columns (area_unit/cabins/pantry/image_tags) not migrated yet — retrying without them. Run supabase/migrations/20260921000000_listing_detail_fields.sql in the Supabase dashboard.');
            ({ error: insertError } = await supabase.from('properties').insert(stripNewDetailKeys(insertPayload)));
          }
          if (insertError) {
            console.error('Supabase properties insert error:', insertError);
          }
        } catch (err) {
          console.error('Failed to sync added property to Supabase:', err);
        }
      },
      
      updateProperty: async (id, updates) => {
        set(state => ({ 
          properties: state.properties.map(p => p.id === id ? { ...p, ...updates } : p) 
        }));

        try {
          const updatePayload = {};
          if (updates.name !== undefined) updatePayload.title = updates.name;
          if (updates.priceLakhs !== undefined) updatePayload.price_lakhs = Number(updates.priceLakhs);
          if (updates.city !== undefined) updatePayload.location_city = updates.city;
          if (updates.locality !== undefined) updatePayload.location_sector = updates.locality;
          if (updates.areaSqFt !== undefined) updatePayload.sqft = Number(updates.areaSqFt);
          if (updates.carpet_sqft !== undefined) {
            updatePayload.carpet_sqft = updates.carpet_sqft !== '' && updates.carpet_sqft !== null && !isNaN(updates.carpet_sqft) ? Number(updates.carpet_sqft) : null;
          }
          if (updates.bedrooms !== undefined) updatePayload.bedrooms = Number(updates.bedrooms);
          if (updates.bathrooms !== undefined) updatePayload.bathrooms = Number(updates.bathrooms);
          if (updates.facing !== undefined) updatePayload.facing = updates.facing;
          if (updates.parking !== undefined) updatePayload.parking = updates.parking;
          if (updates.furnishing_status !== undefined) updatePayload.furnishing_status = updates.furnishing_status;
          if (updates.purpose !== undefined) updatePayload.purpose = updates.purpose;
          if (updates.show_rera !== undefined) updatePayload.show_rera = (updates.show_rera === false || updates.show_rera === 'false') ? false : true;
          if (updates.show_floor_plan !== undefined) updatePayload.show_floor_plan = (updates.show_floor_plan === false || updates.show_floor_plan === 'false') ? false : true;
          if (updates.show_transit !== undefined) updatePayload.show_transit = (updates.show_transit === false || updates.show_transit === 'false') ? false : true;
          if (updates.status !== undefined) updatePayload.status = updates.status;
          if (updates.description !== undefined) updatePayload.description = updates.description;
          if (updates.images !== undefined) updatePayload.images = sanitizeImageList(Array.isArray(updates.images) ? updates.images : []);
          if (updates.amenities !== undefined) {
            updatePayload.amenities = Array.isArray(updates.amenities) ? updates.amenities : (typeof updates.amenities === 'string' ? updates.amenities.split(',').map(s => s.trim()).filter(Boolean) : []);
          }
          if (updates.tier !== undefined) updatePayload.tier = updates.tier;
          if (updates.visibility !== undefined) updatePayload.visibility = updates.visibility;
          if (updates.reraNumber !== undefined) updatePayload.rera_number = updates.reraNumber;
          if (updates.is_featured !== undefined) updatePayload.is_featured = Boolean(updates.is_featured);
          if (updates.builder_id !== undefined) updatePayload.builder_id = updates.builder_id;
          // NOTE: `properties` has no `builder` text column (builder name resolves
          // via builder_id -> builders_sellers). Sending it caused PGRST204 400s.
          if (updates.type !== undefined) updatePayload.property_type = updates.type;
          if (updates.configuration !== undefined) updatePayload.configuration = updates.configuration;
          if (updates.bhk !== undefined && updates.configuration === undefined) updatePayload.configuration = updates.bhk;
          if (updates.brochure_url !== undefined) updatePayload.brochure_url = updates.brochure_url;
          if (updates.video_url !== undefined) updatePayload.video_url = updates.video_url;
          if (updates.virtual_tour_url !== undefined) updatePayload.virtual_tour_url = updates.virtual_tour_url;
          if (updates.floor_plan_url !== undefined) updatePayload.floor_plan_url = sanitizeImageUrl(updates.floor_plan_url) || null;
          if (updates.area_unit !== undefined && VALID_AREA_UNITS.includes(updates.area_unit)) updatePayload.area_unit = updates.area_unit;
          if (updates.cabins !== undefined) updatePayload.cabins = updates.cabins !== '' && updates.cabins !== null && !isNaN(updates.cabins) ? Number(updates.cabins) : null;
          if (updates.pantry !== undefined) updatePayload.pantry = Boolean(updates.pantry);
          if (updates.image_tags !== undefined) updatePayload.image_tags = Array.isArray(updates.image_tags) ? updates.image_tags.filter(t => typeof t === 'string') : [];
          if (updates.rera_portal_url !== undefined) updatePayload.rera_portal_url = updates.rera_portal_url;
          if (updates.legal_status_tag !== undefined) updatePayload.legal_status_tag = updates.legal_status_tag;
          if (updates.legal_remarks !== undefined) updatePayload.legal_remarks = updates.legal_remarks;
          if (updates.rera_authority !== undefined) updatePayload.rera_authority = updates.rera_authority;
          if (updates.rera_custom_title !== undefined) updatePayload.rera_custom_title = updates.rera_custom_title;
          if (updates.rera_details_text !== undefined) updatePayload.rera_details_text = updates.rera_details_text;
          if (updates.rera_document_url !== undefined) updatePayload.rera_document_url = updates.rera_document_url;
          if (updates.possession_timeline !== undefined) updatePayload.possession_timeline = updates.possession_timeline;
          if (updates.floor_number !== undefined) {
            updatePayload.floor_number = updates.floor_number !== '' && updates.floor_number !== null && !isNaN(updates.floor_number) ? Number(updates.floor_number) : null;
          }
          if (updates.total_floors !== undefined) {
            updatePayload.total_floors = updates.total_floors !== '' && updates.total_floors !== null && !isNaN(updates.total_floors) ? Number(updates.total_floors) : null;
          }
          if (updates.balconies !== undefined) {
            updatePayload.balconies = updates.balconies !== '' && updates.balconies !== null && !isNaN(updates.balconies) ? Number(updates.balconies) : null;
          }
          if (updates.maintenance_charges !== undefined) updatePayload.maintenance_charges = updates.maintenance_charges;
          if (updates.road_width_ft !== undefined) {
            updatePayload.road_width_ft = updates.road_width_ft !== '' && updates.road_width_ft !== null && !isNaN(updates.road_width_ft) ? Number(updates.road_width_ft) : null;
          }
          if (updates.dimensions_ft !== undefined) updatePayload.dimensions_ft = updates.dimensions_ft;
          if (updates.boundary_wall !== undefined) updatePayload.boundary_wall = Boolean(updates.boundary_wall);
          if (updates.far_fsi !== undefined) updatePayload.far_fsi = updates.far_fsi;
          if (updates.frontage_ft !== undefined) {
            updatePayload.frontage_ft = updates.frontage_ft !== '' && updates.frontage_ft !== null && !isNaN(updates.frontage_ft) ? Number(updates.frontage_ft) : null;
          }
          if (updates.occupancy_status !== undefined) updatePayload.occupancy_status = updates.occupancy_status;
          if (updates.power_load_kva !== undefined) {
            updatePayload.power_load_kva = updates.power_load_kva !== '' && updates.power_load_kva !== null && !isNaN(updates.power_load_kva) ? Number(updates.power_load_kva) : null;
          }
          if (updates.variants !== undefined) updatePayload.variants = Array.isArray(updates.variants) ? updates.variants.map((v) => ({ ...v, floor_plan_url: sanitizeImageUrl(v.floor_plan_url) })) : [];
          if (updates.custom_dimensions !== undefined) updatePayload.custom_dimensions = Array.isArray(updates.custom_dimensions) ? updates.custom_dimensions : [];
          if (updates.custom_commute_points !== undefined) updatePayload.custom_commute_points = Array.isArray(updates.custom_commute_points) ? updates.custom_commute_points : [];
          if (updates.key_highlights !== undefined) {
            updatePayload.key_highlights = Array.isArray(updates.key_highlights) ? updates.key_highlights : (typeof updates.key_highlights === 'string' ? updates.key_highlights.split(',').map(s => s.trim()).filter(Boolean) : []);
          }
          if (updates.rera_blocks !== undefined) {
            updatePayload.rera_blocks = Array.isArray(updates.rera_blocks) ? updates.rera_blocks : [];
          }

          if (Object.keys(updatePayload).length > 0) {
            const { error } = await supabase.from('properties').update(updatePayload).eq('id', id);
            let updateError = error;
            if (isMissingColumnError(updateError)) {
              console.warn('Detail columns (area_unit/cabins/pantry/image_tags) not migrated yet — retrying without them. Run supabase/migrations/20260921000000_listing_detail_fields.sql in the Supabase dashboard.');
              ({ error: updateError } = await supabase.from('properties').update(stripNewDetailKeys(updatePayload)).eq('id', id));
            }
            if (updateError) {
              console.error('Supabase properties update error:', updateError);
            }
          }
        } catch (err) {
          console.error('Failed to sync updated property to Supabase:', err);
        }
      },

      // Quick admin toggle actions
      toggleFeatured: async (id) => {
        const prop = get().properties.find(p => p.id === id);
        if (!prop) return;
        const nextVal = !prop.is_featured;
        await get().updateProperty(id, { is_featured: nextVal });
      },

      toggleVisibility: async (id) => {
        const prop = get().properties.find(p => p.id === id);
        if (!prop) return;
        const nextVis = prop.visibility === 'public' ? 'unlisted' : 'public';
        const nextTier = nextVis === 'public' ? 'luxury' : 'normal';
        await get().updateProperty(id, { visibility: nextVis, tier: nextTier });
      },

      toggleSectionVisibility: async (id, sectionKey) => {
        const prop = get().properties.find(p => p.id === id);
        if (!prop) return;
        const currentVal = prop[sectionKey] !== false;
        const nextVal = !currentVal;
        await get().updateProperty(id, { [sectionKey]: nextVal });
      },

      updateStatus: async (id, status) => {
        await get().updateProperty(id, { status });
      },
      
      deleteProperty: async (id) => {
        set(state => ({ 
          properties: state.properties.filter(p => p.id !== id) 
        }));

        try {
          await supabase.from('properties').delete().eq('id', id);
        } catch (err) {
          console.error('Failed to delete property from Supabase:', err);
        }
      }
    }),
    {
      name: 'tgv-live-properties-v5',
      // Strip out huge base64 images and documents from localStorage to avoid QuotaExceededError
      partialize: (state) => ({
        properties: state.properties.map(p => {
          // Keep lightweight URLs or placeholders, strip huge raw data:image strings from local cache
          const sanitizedImages = (p.images || []).map(img => 
            typeof img === 'string' && img.startsWith('data:') ? '' : img
          ).filter(Boolean);
          
          return {
            ...p,
            images: sanitizedImages.length > 0 ? sanitizedImages : (p.imageUrl?.startsWith('data:') ? [] : [p.imageUrl].filter(Boolean)),
            imageUrl: p.imageUrl?.startsWith('data:') ? '' : p.imageUrl
          };
        })
      })
    }
  )
);
