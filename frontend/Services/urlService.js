import { clearAuth, getAccessToken, refreshAccessToken } from './authService'

const API_BASE_URL = "";

async function request(path, options = {}, retry = true) {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/api/v1/url/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })

  if (response.status === 401 && retry) {
    try { await refreshAccessToken(); return request(path, options, false) } catch { clearAuth() }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'We could not complete that request. Please try again.')
  return data
}

export async function getUserUrls() { const data = await request('geturls'); return data.userUrls || [] }
export async function getQrCode(alias) { const data = await request(`qrcode/${encodeURIComponent(alias)}`); if (!data.qrData) throw new Error('No QR code was returned.'); return data.qrData }
export async function resetUrlPassword(alias, password) { return request(`resetpassword/${encodeURIComponent(alias)}`, { method: 'POST', body: JSON.stringify({ password }) }) }
export async function removeUrlPassword(alias) { return request(`resetpassword/${encodeURIComponent(alias)}`, { method: 'DELETE' }) }
export async function getAnalytics() { return request('analytics') }

async function publicRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/v1/url/${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'We could not open this link.')
    error.status = response.status
    throw error
  }
  return data
}
export function getRedirectUrl(alias, optIn) { return `${API_BASE_URL}/api/v1/url/redirect/${encodeURIComponent(alias)}${optIn ? '?optIn=true' : ''}` }
export function resolveShortUrl(alias) { return publicRequest(`resolve/${encodeURIComponent(alias)}`) }
export function requestRedirectDestination(alias, optIn) { return publicRequest(`redirect/${encodeURIComponent(alias)}?mode=json${optIn ? '&optIn=true' : ''}`) }
export function verifyShortUrlPassword(alias, password, optIn) { return publicRequest(`pwdredirect/${encodeURIComponent(alias)}/pwd?mode=json${optIn ? '&optIn=true' : ''}`, { method: 'POST', body: JSON.stringify({ password }) }) }
