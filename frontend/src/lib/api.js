// frontend/src/lib/api.js
const API_BASE = '/api';

/**
 * Robust API Client with automatic JWT Token Refresh Lifecycle
 */
export async function fetchApi(endpoint, options = {}) {
  let token = localStorage.getItem('paypilot_auth_token') || 'dev-admin-token';

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Intercept 401 Unauthorized to attempt auto-refresh using Refresh Token
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('paypilot_refresh_token');

    if (refreshToken && endpoint !== '/auth/login' && endpoint !== '/auth/register' && endpoint !== '/auth/refresh') {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.accessToken) {
            localStorage.setItem('paypilot_auth_token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('paypilot_refresh_token', data.refreshToken);
            }
            token = data.accessToken;

            // Re-attempt original request with the fresh Access Token
            res = await fetch(`${API_BASE}${endpoint}`, {
              ...options,
              headers: {
                ...options.headers,
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
          }
        } else {
          // Refresh token expired or invalidated: wipe session
          localStorage.removeItem('paypilot_auth_token');
          localStorage.removeItem('paypilot_refresh_token');
          window.dispatchEvent(new Event('paypilot_auth_expired'));
        }
      } catch (err) {
        console.warn('Silent token refresh failed:', err);
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData.message || errorData.error || `HTTP ${res.status} Error`);
    err.data = errorData;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

