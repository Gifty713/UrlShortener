import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { Consent } from './ShortLinkPage'
import { resolveShortUrl, verifyShortUrlPassword } from '../Services/urlService'

function PasswordLinkPage({ alias, navigate }) {
  const [password, setPassword] = useState(''); const [optIn, setOptIn] = useState(false); const [checking, setChecking] = useState(true); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(''); const [loadFailed, setLoadFailed] = useState(false)
  useEffect(() => { let active = true; resolveShortUrl(alias).then(data => { if (!active) return; if (!data.passwordProtected) navigate(`/go/${encodeURIComponent(alias)}`); else setChecking(false) }).catch(err => { if (active) { console.error('Unable to resolve protected shortened link:', err); setLoadFailed(true); setChecking(false) } }); return () => { active = false } }, [alias, navigate])
  async function submitPassword(event) { event.preventDefault(); if (!password) { setError('Enter the link password.'); return }; setSubmitting(true); setError(''); try { const data = await verifyShortUrlPassword(alias, password, optIn); setPassword(''); window.location.assign(data.redirectUrl) } catch (err) { console.error('Unable to verify shortened link password:', err); setError(err.status === 401 ? 'That password is incorrect. Try again.' : 'We could not unlock this link. Please try again.'); setSubmitting(false) } }
  if (checking) return <Box className="auth-page"><CircularProgress aria-label="Loading protected link" /></Box>
  if (loadFailed) return <Box component="main" className="auth-page"><Card className="auth-card"><CardContent><Alert severity="error">We could not open this protected link. Please return to the link and try again.</Alert></CardContent></Card></Box>
  return <Box component="main" className="auth-page"><Card className="auth-card"><CardContent><form onSubmit={submitPassword}><Typography variant="h4">This link is protected</Typography><Typography color="text.secondary" sx={{ my: 1 }}>Enter the password to continue to the destination.</Typography><Stack spacing={2} sx={{ mt: 3 }}><TextField autoFocus type="password" label="Link password" value={password} onChange={event => setPassword(event.target.value)} error={Boolean(error)} helperText={error} autoComplete="current-password" /><Consent optIn={optIn} setOptIn={setOptIn} /><Button type="submit" variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={20} color="inherit" /> : 'Continue'}</Button><Button onClick={() => navigate('/')}>Cancel</Button></Stack></form></CardContent></Card></Box>
}
export default PasswordLinkPage
