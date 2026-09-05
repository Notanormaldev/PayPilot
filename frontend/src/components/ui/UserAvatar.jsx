import React, { useState, useRef, useMemo } from 'react';
import { Avatar, ActionIcon, Loader, Box, Tooltip } from '@mantine/core';
import { IconCamera, IconTrash } from '@tabler/icons-react';
import { fetchApi } from '../../lib/api';

/**
 * 1. Curated Named Persona Avatar Mapping
 * Maps standard demo personas and core employees to high-definition portrait assets
 */
const NAMED_PERSONA_AVATARS = {
  // Executive & Leadership
  'meera krishnan': '/professional-woman-avatar-with-short-brown-hair-an.jpg',
  'meera.krishnan@paypilot.internal': '/professional-woman-avatar-with-short-brown-hair-an.jpg',
  'meera': '/professional-woman-avatar-with-short-brown-hair-an.jpg',

  // HR & DevOps
  'vikram malhotra': '/professional-man-avatar-with-beard-and-glasses-loo.jpg',
  'vikram.malhotra@paypilot.internal': '/professional-man-avatar-with-beard-and-glasses-loo.jpg',
  'vikram patel': '/professional-man-avatar-with-beard-and-glasses-loo.jpg',
  'vikram.patel@paypilot.internal': '/professional-man-avatar-with-beard-and-glasses-loo.jpg',
  'vikram': '/professional-man-avatar-with-beard-and-glasses-loo.jpg',

  // Payroll Specialists
  'neha gupta': '/testimonial-avatar-1.jpg',
  'neha.gupta@paypilot.internal': '/testimonial-avatar-1.jpg',
  'neha': '/testimonial-avatar-1.jpg',

  // Product & Engineering
  'kartik kumar': '/testimonial-avatar-2.jpg',
  'kartik.kumar@paypilot.internal': '/testimonial-avatar-2.jpg',
  'kartik': '/testimonial-avatar-2.jpg',

  'priya sharma': '/testimonial-avatar-3.jpg',
  'priya.sharma@paypilot.internal': '/testimonial-avatar-3.jpg',
  'priya': '/testimonial-avatar-3.jpg',

  // Extended seeded staff
  'tanvi kapoor': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'tanvi.kapoor@paypilot.internal': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',

  'aarav mehta': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'aarav.mehta@paypilot.internal': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',

  'rohan verma': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'rohan.verma@paypilot.internal': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',

  'ananya iyer': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'ananya.iyer@paypilot.internal': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',

  'devendra rao': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'devendra.rao@paypilot.internal': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',

  'sneha nair': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'sneha.nair@paypilot.internal': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',

  'aditya joshi': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'aditya.joshi@paypilot.internal': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',

  'arjun reddy': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'arjun.reddy@paypilot.internal': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',

  'pooja menon': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'pooja.menon@paypilot.internal': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',

  'sanjay singhania': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'sanjay.singhania@paypilot.internal': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
};

/**
 * 2. Curated Pool of Diverse Professional Portraits for All Other Employees
 * Deterministically assigned so every single user always has a realistic photo!
 */
const CURATED_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534751516642-a1714f5a507a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
];

/**
 * 3. 12 Instagram-style Background & Silhouette Color Palettes (Fallback)
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
 * Resolves the initial photo URL for any given user name / ID
 */
export function resolveUserPhoto(name = '', id = '', explicitSrc = null) {
  if (explicitSrc) return explicitSrc;

  const cleanName = (name || '').toLowerCase().trim();
  const cleanId = (id || '').toLowerCase().trim();

  // 1. Direct match in Named Persona map
  if (NAMED_PERSONA_AVATARS[cleanName]) return NAMED_PERSONA_AVATARS[cleanName];
  if (NAMED_PERSONA_AVATARS[cleanId]) return NAMED_PERSONA_AVATARS[cleanId];

  // 2. Partial first name match in Named Persona map
  const firstName = cleanName.split(' ')[0];
  if (firstName && NAMED_PERSONA_AVATARS[firstName]) return NAMED_PERSONA_AVATARS[firstName];

  // 3. Deterministic index into Curated Portrait pool
  const seed = `${cleanName}_${cleanId}`;
  const hash = hashString(seed);
  return CURATED_PORTRAITS[hash % CURATED_PORTRAITS.length];
}

/**
 * UserAvatar Component
 * - Displays user photo (uploaded image, curated persona portrait, or deterministic portrait)
 * - Has fallback to Instagram-style human silhouette with initials
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
  const [imageError, setImageError] = useState(false);

  // Compute resolved portrait photo
  const resolvedPhoto = useMemo(() => {
    return resolveUserPhoto(name, id, src);
  }, [src, name, id]);

  const [currentSrc, setCurrentSrc] = useState(resolvedPhoto);

  // Synchronize when prop changes
  React.useEffect(() => {
    setImageError(false);
    setCurrentSrc(resolveUserPhoto(name, id, src));
  }, [src, name, id]);

  // Compute deterministic palette for SVG fallback
  const seed = `${name}_${id}`;
  const palette = useMemo(() => {
    const hash = hashString(seed);
    return PALETTES[hash % PALETTES.length];
  }, [seed]);

  const initials = useMemo(() => {
    const parts = (name || 'User').trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) || 'PP').toUpperCase();
  }, [name]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
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
          setImageError(false);
          localStorage.setItem('paypilot_user_avatar', result.url);
          window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: result.url }));

          if (onPhotoUploaded) {
            onPhotoUploaded(result.url);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      alert(err.message || 'Failed to upload photo. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    const fallback = resolveUserPhoto(name, id, null);
    setCurrentSrc(fallback);
    localStorage.removeItem('paypilot_user_avatar');
    window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: null }));
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  const showImage = Boolean(currentSrc && !imageError);

  return (
    <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0, ...style }} className={className}>
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
        {showImage ? (
          <img
            src={currentSrc}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-Contrast Clean Initial / Silhouette Badge */
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: palette.bg,
              color: palette.figure,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: `${Math.max(10, Math.round(size * 0.38))}px`,
              letterSpacing: '0.02em',
              userSelect: 'none',
            }}
          >
            {initials}
          </div>
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
        <Tooltip label={showImage ? 'Change photo' : 'Upload photo'} withArrow>
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
      {editable && showImage && !uploading && (
        <Tooltip label="Reset photo" withArrow>
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
