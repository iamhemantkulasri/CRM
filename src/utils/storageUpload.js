import { supabase } from '../api/supabase';

export const STORAGE_BUCKET = 'property-images';
export const INVENTORY_FOLDER = 'inventory';
export const FLOOR_PLANS_FOLDER = 'floor-plans';
export const BROCHURES_BUCKET = 'property-brochures';

/**
 * Compress an image file using an off-screen HTML5 canvas.
 * Reduces raw 5-15MB phone camera shots to ~80-180KB crisp JPEGs,
 * saving Supabase Storage bandwidth and accelerating website loading.
 */
export async function compressImage(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) {
        resolve(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = dataUrl;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image (File or Blob) to the public Supabase `property-images`
 * storage bucket. Returns the permanent public CDN URL.
 */
export async function uploadPropertyImage(fileOrBlob, folder = INVENTORY_FOLDER) {
  // Determine file extension
  let ext = 'jpg';
  if (fileOrBlob instanceof File && fileOrBlob.name) {
    const parts = fileOrBlob.name.split('.');
    if (parts.length > 1) {
      ext = parts.pop()?.toLowerCase() || 'jpg';
    }
  } else if (fileOrBlob.type) {
    if (fileOrBlob.type.includes('webp')) ext = 'webp';
    else if (fileOrBlob.type.includes('png')) ext = 'png';
  }

  // Generate unique path
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const filePath = `${folder}/${Date.now()}-${randomSuffix}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileOrBlob, {
      contentType: fileOrBlob.type || (ext === 'webp' ? 'image/webp' : 'image/jpeg'),
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Supabase Storage');
  }

  // Retrieve public CDN URL
  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Compress + upload in one step (used by all CRM image inputs).
 */
export async function compressAndUploadImage(file, folder = INVENTORY_FOLDER) {
  const compressed = await compressImage(file);
  return uploadPropertyImage(compressed, folder);
}

/**
 * Check whether a URL points at our Supabase storage bucket.
 */
export function isStorageUrl(url) {
  return typeof url === 'string' && url.includes(`/${STORAGE_BUCKET}/`);
}

/**
 * Delete an image from Supabase Storage by its public URL.
 * No-op (returns false) for external URLs.
 */
export async function deletePropertyImage(publicUrl) {
  try {
    if (!isStorageUrl(publicUrl)) return false;

    const path = publicUrl.split(`/${STORAGE_BUCKET}/`)[1]?.split('?')[0];
    if (!path) return false;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      console.error('Failed to delete image from Supabase Storage:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete property image error:', err);
    return false;
  }
}

/**
 * Upload a PDF brochure to the public `property-brochures` Supabase bucket.
 * Returns the permanent CDN public URL.
 */
export async function uploadBrochurePdf(file, propertyId) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please upload a valid PDF document (.pdf)');
  }

  // Generate clean filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filePath = propertyId
    ? `${propertyId}/${Date.now()}-${cleanName}`
    : `uploads/${Date.now()}-${randomSuffix}-${cleanName}`;

  const { data, error } = await supabase.storage
    .from(BROCHURES_BUCKET)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      cacheControl: '31536000',
      upsert: true,
    });

  if (error) {
    console.error('Supabase brochure upload error:', error);
    throw new Error(error.message || 'Failed to upload brochure to Supabase Storage');
  }

  const { data: publicUrlData } = supabase.storage
    .from(BROCHURES_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Strip inline/file blobs that must never reach the database.
 * Keeps http(s) URLs, drops `data:` and `blob:` entries.
 */
export function sanitizeImageList(images) {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img) =>
      typeof img === 'string' &&
      img.trim().length > 0 &&
      !img.startsWith('data:') &&
      !img.startsWith('blob:')
  );
}

/**
 * Sanitize a single image URL field (floor plans). Returns '' when the
 * value is an inline blob rather than a real URL.
 */
export function sanitizeImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return '';
  return url;
}
