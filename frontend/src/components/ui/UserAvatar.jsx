import React, { useState, useRef, useMemo } from 'react';
import { ActionIcon, Loader, Box, Tooltip } from '@mantine/core';
import { IconCamera, IconTrash } from '@tabler/icons-react';
import { fetchApi } from '../../lib/api';

/**
 * 12 Modern Background & Silhouette Color Palettes for Dummy Placeholder Avatars
 */
const PALETTES = [
  { bg: '#E2E8F0', figure: '#475569', accent: '#94A3B8' }, // Slate Cool
  { bg: '#E0E7FF', figure: '#4338CA', accent: '#818CF8' }, // Royal Indigo
  { bg: '#D1FAE5', figure: '#047857', accent: '#34D399' }, // Fresh Emerald
  { bg: '#FFEDD5', figure: '#C2410C', accent: '#FB923C' }, // Warm Terracotta
  { bg: '#CCFBF1', figure: '#0F766E', accent: '#2DD4BF' }, // Nordic Teal
  { bg: '#FFE4E6', figure: '#BE123C', accent: '#FB7185' }, // Soft Rose
  { bg: '#DBEAFE', figure: '#1D4ED8', accent: '#60A5FA' }, // Classic Cobalt
  { bg: '#FEF08A', figure: '#A16207', accent: '#CA8A04' }, // Golden Amber
  { bg: '#F3E8FF', figure: '#7E22CE', accent: '#C084FC' }, // Regal Violet
  { bg: '#CFFAFE', figure: '#0E7490', accent: '#22D3EE' }, // Ocean Cyan
  { bg: '#FCE7F3', figure: '#BE185D', accent: '#F472B6' }, // Modern Magenta
  { bg: '#D9F99D', figure: '#4D7C0F', accent: '#84CC16' }, // Crisp Lime
];

/**
 * Deterministic hash function for consistent user avatar color palette
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
 * Resolves user photo:
 * 1. Checks explicitSrc (e.g. ImageKit URL https://ik.imagekit.io/...)
 * 2. Checks localStorage for uploaded ImageKit avatars for this user/id
 * 3. Otherwise returns null (renders clean dummy placeholder avatar)
 */
export function resolveUserPhoto(name = '', id = '', explicitSrc = null) {
  if (explicitSrc && typeof explicitSrc === 'string' && explicitSrc.trim() !== '') {
    // Only allow real uploaded URLs or ImageKit URLs, not old hardcoded unsplash or mock files
    if (!explicitSrc.includes('unsplash.com') && !explicitSrc.startsWith('/professional-') && !explicitSrc.startsWith('/testimonial-')) {
      return explicitSrc;
    }
  }

  const cleanName = (name || '').toLowerCase().trim();
  const cleanId = (id || '').toLowerCase().trim();

  // Check if there's a stored ImageKit upload for this user in localStorage
  if (cleanId) {
    const storedForId = localStorage.getItem(`paypilot_avatar_${cleanId}`);
    if (storedForId) return storedForId;
  }
  if (cleanName) {
    const storedForName = localStorage.getItem(`paypilot_avatar_${cleanName}`);
    if (storedForName) return storedForName;
  }

  // Fallback to null (Clean Dummy Placeholder Avatar)
  return null;
}

/**
 * UserAvatar Component
 * - Displays user photo if uploaded to ImageKit
 * - If no photo uploaded, renders a clean, professional dummy SVG silhouette avatar
 * - Supports photo upload to ImageKit when editable=true or when triggered
 */
export const UserAvatar = ({
  src,
  name = 'User',
  id = '',
  size = 40,
  radius = 'xl',
  editable = false,
  showInitials = false,
  onPhotoUploaded,
  onPhotoRemoved,
  className = '',
  style = {},
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Compute resolved photo URL
  const resolvedPhoto = useMemo(() => {
    return resolveUserPhoto(name, id, src);
  }, [src, name, id]);

  const [currentSrc, setCurrentSrc] = useState(resolvedPhoto);

  // Synchronize when prop changes or avatar is updated globally
  React.useEffect(() => {
    setImageError(false);
    setCurrentSrc(resolveUserPhoto(name, id, src));
  }, [src, name, id]);

  React.useEffect(() => {
    const handleGlobalUpdate = (e) => {
      const cleanName = (name || '').toLowerCase().trim();
      const cleanId = (id || '').toLowerCase().trim();
      const currentLoggedInName = (localStorage.getItem('paypilot_user_name') || '').toLowerCase().trim();
      const currentLoggedInEmail = (localStorage.getItem('paypilot_user_email') || '').toLowerCase().trim();

      if (
        cleanName === currentLoggedInName ||
        cleanId === currentLoggedInEmail ||
        cleanName.includes('tanvi') ||
        cleanName.includes('meera') ||
        !cleanId
      ) {
        if (e.detail) {
          setCurrentSrc(e.detail);
          setImageError(false);
        } else {
          setCurrentSrc(null);
        }
      }
    };

    window.addEventListener('paypilot_avatar_updated', handleGlobalUpdate);
    return () => window.removeEventListener('paypilot_avatar_updated', handleGlobalUpdate);
  }, [name, id]);

  // Compute deterministic palette for dummy avatar background
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

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo size must be less than 10MB.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        // Call backend ImageKit upload API
        const cleanId = (id || name || 'user').toLowerCase().replace(/\s+/g, '_');
        const result = await fetchApi('/employees/avatar', {
          method: 'POST',
          body: JSON.stringify({
            image: base64Data,
            fileName: `avatar_${cleanId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
            employeeId: id,
          }),
        });

        if (result.url) {
          setCurrentSrc(result.url);
          setImageError(false);
          localStorage.setItem('paypilot_user_avatar', result.url);
          if (cleanId) {
            localStorage.setItem(`paypilot_avatar_${cleanId}`, result.url);
          }
          if (name) {
            localStorage.setItem(`paypilot_avatar_${name.toLowerCase().trim()}`, result.url);
          }

          window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: result.url }));

          if (onPhotoUploaded) {
            onPhotoUploaded(result.url);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload photo to ImageKit:', err);
      alert(err.message || 'Failed to upload photo to ImageKit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setCurrentSrc(null);
    setImageError(false);
    const cleanId = (id || name || 'user').toLowerCase().replace(/\s+/g, '_');
    localStorage.removeItem('paypilot_user_avatar');
    localStorage.removeItem(`paypilot_avatar_${cleanId}`);
    if (name) {
      localStorage.removeItem(`paypilot_avatar_${name.toLowerCase().trim()}`);
    }
    window.dispatchEvent(new CustomEvent('paypilot_avatar_updated', { detail: null }));
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  const showImage = Boolean(currentSrc && !imageError);

  return (
    <Box style={{ position: 'relative', display: 'inline-block', flexShrink: 0, ...style }} className={className}>
      {/* Hidden File Input for ImageKit upload */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
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
        title={editable ? 'Click to upload profile photo to ImageKit' : name}
      >
        {showImage ? (
          /* User Uploaded ImageKit Photo */
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
        ) : showInitials ? (
          /* High-Contrast Initial Badge */
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
        ) : (
          /* Clean Professional Vector Silhouette Dummy Avatar */
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: palette.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={palette.figure}
              style={{
                width: '64%',
                height: '64%',
                opacity: 0.85,
              }}
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}

        {/* Uploading to ImageKit Loader Overlay */}
        {uploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader size={size > 48 ? 'sm' : 'xs'} color="white" />
          </div>
        )}
      </div>

      {/* Editable Camera Badge */}
      {editable && !uploading && (
        <Tooltip label={showImage ? 'Change ImageKit photo' : 'Upload photo to ImageKit'} withArrow>
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

      {/* Remove Photo Badge */}
      {editable && showImage && !uploading && (
        <Tooltip label="Reset to dummy avatar" withArrow>
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
