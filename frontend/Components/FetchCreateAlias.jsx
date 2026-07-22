import { getAccessToken } from '../Services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchCreateAlias({ originalURL, customAlias, expiryDate }) {
  const accessToken = getAccessToken()
  const response = await fetch(`/api/v1/url/createalias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      originalURL,
      customAlias: customAlias || undefined,
      expiryDate: expiryDate || undefined,
      isQrcode: false,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Unable to shorten this URL. Please try again.')
  }

  if (data.url?._id && !accessToken) {
    localStorage.setItem('userId', data.url._id)
  }

  return {
    ...data,
    shortUrl: `${window.location.origin}/go/${data.url.alias}`,
  }
}
