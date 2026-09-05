import React, { useState, useRef, useMemo } from 'react';
import { Avatar, ActionIcon, Loader, Box, Tooltip } from '@mantine/core';
import { IconCamera, IconTrash } from '@tabler/icons-react';
import { fetchApi } from '../../lib/api';

/**
 * 12 Curated Instagram-style Background & Silhouette Color Palettes
 */
const PALETTES = [
  { bg: '#E2E8F0', figure: '#334155', accent: '#94A3B8' }, // Slate Cool
  { bg: '#E0E7FF', figure: '#3730A3', accent: '#818CF8' }, // Royal Indigo
  { bg: '#D1FAE5', figure: '#065F46', accent: '#34D399' }, // Fresh Emerald
  { bg: '#FFEDD5', figure: '#9A3412', accent: '#FB923C' }, // Warm Terracotta
  { bg: '#CCFBF1', figure: '#115E59', accent: '#2DD4BF' }, // Nordic Teal
  { bg: '#FFE4E6', figure: '#9F1239', accent: '#FB7185' }, // Soft Rose
  { bg: '#DBEAFE', figure: '#1E40AF', accent: '#60A5FA' }, // Classic Cobalt
  { bg: '#FEF08A', figure: '#854D0E', accent: '#CA8A04' }, // Golden Amber
  { bg: '#F3E8FF', figure: '#6B21A8', accent: '#C084FC' }, // Regal Violet
  { bg: '#CFFAFE', figure: '#155E75', accent: '#22D3EE' }, // Ocean Cyan
  { bg: '#FCE7F3', figure: '#9D174D', accent: '#F472B6' }, // Modern Magenta
  { bg: '#D9F99D', figure: '#3F6212', accent: '#84CC16' }, // Crisp Lime
];

/**
 * 8 Distinct Human Silhouette Contours (Instagram Silhouette Style)
 * All standing/bust poses of a person so no two employees look identical!
 */
const SILHOUETTES = [
  // 1. Classic Instagram Clean Minimal Human Bust
  ({ figure, accent }) => (
    <g>
      {/* Head */}
      <circle cx="50" cy="33" r="16" fill={figure} />
      {/* Torso / Shoulders with smooth curve */}
      <path d="M 18 90 C 18 64 32 56 50 56 C 68 56 82 64 82 90 Z" fill={figure} />
    </g>
  ),

  // 2. Standing Person with Collar / Business Casual
  ({ figure, accent }) => (
    <g>
      {/* Head */}
      <circle cx="50" cy="31" r="15" fill={figure} />
      {/* Torso with V-collar notch */}
      <path d="M 20 90 C 20 63 32 55 50 55 C 68 55 80 63 80 90 Z" fill={figure} />
      <polygon points="50,68 43,55 57,55" fill={accent} />
    </g>
  ),

  // 3. Human Silhouette with Glasses / Spectacles
  ({ figure, accent }) => (
    <g>
      {/* Head */}
      <circle cx="50" cy="32" r="16" fill={figure} />
      {/* Glasses accent */}
      <rect x="36" y="29" width="11" height="7" rx="2" fill="none" stroke={accent} strokeWidth="2" />
      <rect x="53" y="29" width="11" height="7" rx="2" fill="none" stroke={accent} strokeWidth="2" />
      <line x1="47" y1="32" x2="53" y2="32" stroke={accent} strokeWidth="2" />
      {/* Torso */}
      <path d="M 19 90 C 19 63 32 55 50 55 C 68 55 81 63 81 90 Z" fill={figure} />
    </g>
  ),

  // 4. Human Silhouette with Wavy / Textured Hair
  ({ figure, accent }) => (
    <g>
      {/* Hair volume */}
      <circle cx="50" cy="31" r="18" fill={accent} />
      {/* Face & Head */}
      <circle cx="50" cy="34" r="14" fill={figure} />
      {/* Torso */}
      <path d="M 20 90 C 20 64 34 56 50 56 C 66 56 80 64 80 90 Z" fill={figure} />
    </g>
  ),

  // 5. Human Silhouette with Top-Knot / High Bun
  ({ figure, accent }) => (
    <g>
      {/* Bun */}
      <circle cx="50" cy="14" r="6" fill={figure} />
      {/* Head */}
      <circle cx="50" cy="34" r="15" fill={figure} />
      {/* Torso */}
      <path d="M 18 90 C 18 64 32 56 50 56 C 68 56 82 64 82 90 Z" fill={figure} />
    </g>
  ),

  // 6. Minimalist Standing Figure (Upper Body + Neck Detail)
  ({ figure, accent }) => (
    <g>
      {/* Head */}
      <ellipse cx="50" cy="30" rx="14" ry="16" fill={figure} />
      {/* Neck */}
      <rect x="46" y="44" width="8" height="10" fill={figure} />
      {/* Broad Shoulders */}
      <path d="M 16 90 C 16 62 30 54 50 54 C 70 54 84 62 84 90 Z" fill={figure} />
    </g>
  ),

  // 7. Human Silhouette with Athletic Crewneck Contour
  ({ figure, accent }) => (
    <g>
      {/* Head */}
      <circle cx="50" cy="32" r="15" fill={figure} />
      {/* Torso with crew neckline */}
      <path d="M 18 90 C 18 64 32 55 50 55 C 68 55 82 64 82 90 Z" fill={figure} />
      <path d="M 40 55 C 40 62 60 62 60 55 Z" fill={accent} />
    </g>
  ),

  // 8. Human Silhouette with Side-Part Hairline
  ({ figure, accent }) => (
    <g>
      {/* Hair side-sweep */}
      <path d="M 33 28 C 33 16 67 16 67 28 C 67 36 33 36 33 28 Z" fill={accent} />
      {/* Face & Head */}
      <circle cx="50" cy="34" r="14" fill={figure} />
      {/* Torso */}
      <path d="M 19 90 C 19 63 33 55 50 55 C 67 55 81 63 81 90 Z" fill={figure} />
    </g>
  ),
];

/**
 * Deterministic hash function for consistent user avatar generation
 */
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an SVG Data URI for an Instagram-style default human silhouette avatar
 */
export function getDefaultAvatarSvgDataUri(seed = 'User') {
  const hash = hashString(seed);
  const palette = PALETTES[hash % PALETTES.length];
  const silhouetteIndex = Math.floor(hash / PALETTES.length) % SILHOUETTES.length;
  const SilhouetteComponent = SILHOUETTES[silhouetteIndex];

  // We can render the SVG to a data URI string
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="50" fill="${palette.bg}" />
      <circle cx="50" cy="33" r="16" fill="${palette.figure}" />
      <path d="M 18 90 C 18 64 32 56 50 56 C 68 56 82 64 82 90 Z" fill="${palette.figure}" />
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * UserAvatar Component
 * - Displays user photo from ImageKit if set
 * - Otherwise renders a unique, deterministic Instagram-style human silhouette avatar!
 * - Supports instant photo upload to ImageKit if editable=true
 */
export const UserAvatar = ({
  src,
  name = 'User',
  id = '',
  size = 40,
  radius = 'xl',
  editable = false,
  onPhotoUploaded,
  onPhotoRemoved,
  className = '',
  style = {},
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || null);

  // Synchronize when prop changes
  React.useEffect(() => {
    if (src !== undefined) {
      setCurrentSrc(src);
    }
  }, [src]);

  // Compute deterministic palette and silhouette
  const seed = `${name}_${id}`;
  const { palette, SilhouetteComponent } = useMemo(() => {
    const hash = hashString(seed);
    const p = PALETTES[hash % PALETTES.length];
    const s = SILHOUETTES[Math.floor(hash / PALETTES.length) % SILHOUETTES.length];
    return { palette: p, SilhouetteComponent: s };
  }, [seed]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      // Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        // Call backend ImageKit upload API
        const result = await fetchApi('/employees/avatar', {
          method: 'POST',
          body: JSON.stringify({
            image: base64Data,
            fileName: `profile_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
          }),
        });

        if (result.url) {
          setCurrentSrc(result.url);
          // Save to localStorage for persistence
          localStorage.setItem('paypilot_user_avatar', result.url);
          window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: result.url }));

          if (onPhotoUploaded) {
            onPhotoUploaded(result.url);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload profile photo to ImageKit:', err);
      alert(err.message || 'Failed to upload photo. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setCurrentSrc(null);
    localStorage.removeItem('paypilot_user_avatar');
    window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: null }));
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  return (
    <Box style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
      {/* Hidden File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {/* Main Avatar Surface */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius === 'xl' ? '9999px' : '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: palette.bg,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          cursor: editable ? 'pointer' : 'default',
        }}
        onClick={() => editable && !uploading && fileInputRef.current?.click()}
        title={editable ? 'Click to change profile photo' : name}
      >
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setCurrentSrc(null)} // fallback to silhouette on image error
          />
        ) : (
          /* Instagram-style Unique Human Silhouette SVG */
          <svg
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            style={{ display: 'block' }}
          >
            <rect width="100" height="100" fill={palette.bg} />
            <SilhouetteComponent figure={palette.figure} accent={palette.accent} />
          </svg>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader size={size > 48 ? 'sm' : 'xs'} color="white" />
          </div>
        )}
      </div>

      {/* Editable Overlay Camera Badge */}
      {editable && !uploading && (
        <Tooltip label={currentSrc ? 'Change photo' : 'Upload photo'} withArrow>
          <ActionIcon
            size={Math.max(22, Math.round(size * 0.34))}
            radius="xl"
            color="blue"
            variant="filled"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <IconCamera size={Math.max(12, Math.round(size * 0.18))} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Remove Photo Badge if photo is set */}
      {editable && currentSrc && !uploading && (
        <Tooltip label="Remove photo" withArrow>
          <ActionIcon
            size={Math.max(18, Math.round(size * 0.28))}
            radius="xl"
            color="red"
            variant="filled"
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
            }}
            onClick={handleRemovePhoto}
          >
            <IconTrash size={Math.max(10, Math.round(size * 0.15))} />
          </ActionIcon>
        </Tooltip>
      )}
    </Box>
  );
};

export default UserAvatar;
