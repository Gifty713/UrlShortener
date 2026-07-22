import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Switch, Typography } from '@mui/material'
import { requestRedirectDestination, resolveShortUrl } from '../Services/urlService'

export function Consent({ optIn, setOptIn }) {
  return <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 1.5 }}><Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}><Box><Typography fontWeight={800}>Anonymous analytics</Typography><Typography variant="caption">Optional and off by default. Choose Opt In to share visit, country and device information.</Typography></Box><Stack direction="row" alignItems="center" spacing={.5}><Typography variant="caption">{optIn ? 'Opt In' : 'Opt Out'}</Typography><Switch checked={optIn} onChange={event => setOptIn(event.target.checked)} inputProps={{ 'aria-label': 'Opt in to anonymous analytics' }} /></Stack></Stack></Box>
}

function ShortLinkPage({ alias, navigate }) {
  const [loading, setLoading] = useState(true); const [optIn, setOptIn] = useState(false); const [error, setError] = useState(''); const [continuing, setContinuing] = useState(false)
  useEffect(() => { let active = true; resolveShortUrl(alias).then(data => { if (!active) return; if (data.passwordProtected) navigate(`/go/${encodeURIComponent(alias)}/unlock`); else setLoading(false) }).catch(err => { if (active) { setError(err.message); setLoading(false) } }); return () => { active = false } }, [alias, navigate])
  async function continueRedirect() { setContinuing(true); setError(''); try { const data = await requestRedirectDestination(alias, optIn); window.location.assign(data.redirectUrl) } catch (err) { console.error('Unable to continue shortened link redirect:', err); setError('We could not continue to this destination. Please try again.'); setContinuing(false) } }
  if (loading) return <Box className="auth-page"><CircularProgress aria-label="Loading link" /></Box>
  return <Box component="main" className="auth-page"><Card className="auth-card"><CardContent><Typography variant="h4">Continue to destination?</Typography><Typography color="text.secondary" sx={{ my: 1 }}>You’re about to leave Linklet.</Typography><Stack spacing={2} sx={{ mt: 3 }}>{error && <Alert severity="error" action={<Button color="inherit" onClick={continueRedirect}>Retry</Button>}>{error}</Alert>}<Consent optIn={optIn} setOptIn={setOptIn} /><Button variant="contained" onClick={continueRedirect} disabled={continuing}>{continuing ? <CircularProgress size={20} color="inherit" /> : 'Continue'}</Button><Button onClick={() => navigate('/')}>Cancel</Button></Stack></CardContent></Card></Box>
}
export default ShortLinkPage
