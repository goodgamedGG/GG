
export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x400?text=No+Image';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Get backend URL (strip /api if present)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');

    // Clean path
    // Remove leading slash if present to avoid double slashes when joining
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Ensure path uses forward slashes
    const normalizedPath = cleanPath.replace(/\\/g, '/');

    return `${baseUrl}/${normalizedPath}`;
};
