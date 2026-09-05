// frontend/src/lib/api.js

const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  let token = localStorage.getItem('paypilot_auth_token') || 'dev-admin-token';

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Auto token refresh on 401 if refresh token exists
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('paypilot_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const { accessToken, refreshToken: newRefresh } = await refreshRes.json();
          localStorage.setItem('paypilot_auth_token', accessToken);
          if (newRefresh) localStorage.setItem('paypilot_refresh_token', newRefresh);
          token = accessToken;

          // Retry original request
          res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              ...options.headers,
            },
          });
        }
      } catch (e) {
        // Clear tokens on failed refresh
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${res.status} Error`);
  }

  return res.json();
}
