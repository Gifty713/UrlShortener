const API_BASE_URL = "";

// Tokens deliberately live only for the lifetime of this JavaScript runtime.
// Remove credentials written by earlier frontend versions; userId remains reserved
// for the anonymous link-claiming flow.
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
localStorage.removeItem('userEmail')

let accessToken = null

async function authRequest(path, payload) {
  const response = await fetch(`/api/v1/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}

export async function login(credentials) {
  const data = await authRequest('login', credentials)
  if (!data.accessToken) throw new Error('Login succeeded but no authentication token was returned.')
  accessToken = data.accessToken
  return data
}

export function getAccessToken() { return accessToken }
export function clearAuth() { accessToken = null }
export function isAuthenticated() { return Boolean(accessToken) }

export async function logout() {
  try { await authRequest('logout', {}) } finally { clearAuth() }
}

export async function refreshAccessToken() {
  const data = await authRequest('refresh', {})
  if (!data.accessToken) throw new Error('Your session has ended. Please log in again.')
  accessToken = data.accessToken
  return data.accessToken
}

export async function restoreSession() {
  try { await refreshAccessToken(); return true } catch { clearAuth(); return false }
}

export function register(credentials) { return authRequest('register', credentials) }
