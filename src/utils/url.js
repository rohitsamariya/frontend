/**
 * Utility to handle media URLs and API base path
 */

const API_URL = import.meta.env.VITE_API_URL || '';

// Normalize API_BASE by removing trailing /api or /api/
export const API_BASE = API_URL.replace(/\/api\/?$/, '');

/**
 * Constructs a full URL for a media file (profile image, document, etc.)
 * @param {string} path - The relative path to the file (e.g., '/uploads/...')
 * @returns {string|null} - The full URL or null if no path provided
 */
export const getMediaUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL (like Cloudinary), return it
    if (path.startsWith('http')) return path;

    // Handle relative paths (legacy local storage)
    // Trim trailing slash from base if present
    const base = API_BASE.replace(/\/$/, '');

    // Ensure path starts with a single leading slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Concatenate base and path
    return `${base}${normalizedPath}`;
};
