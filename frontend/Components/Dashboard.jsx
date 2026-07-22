import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import DashboardNav from './DashboardNav'
import ShortenLinkModal from './ShortenLinkModal'
import UrlList from './UrlList'
import { getUserUrls } from '../Services/urlService'

function Dashboard({ navigate, onLogout }) {
  const [open, setOpen] = useState(false), [urls, setUrls] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('')
  const loadUrls = useCallback(async () => { setLoading(true); setError(''); try { setUrls(await getUserUrls()) } catch (err) { setError(err.message) } finally { setLoading(false) } }, [])
  useEffect(() => { const timer = setTimeout(loadUrls, 0); return () => clearTimeout(timer) }, [loadUrls])
  const stats = [{ label: 'Total URLs', value: urls.length }, { label: 'Total clicks', value: urls.reduce((sum, url) => sum + (url.clickCount || 0), 0).toLocaleString() }, { label: 'Active URLs', value: urls.filter(url => !url.expiryDate || new Date(url.expiryDate) >= new Date()).length }, { label: 'Expired URLs', value: urls.filter(url => url.expiryDate && new Date(url.expiryDate) < new Date()).length }]
  return <><DashboardNav active="dashboard" navigate={navigate} onLogout={onLogout} /><Box component="main" className="dashboard"><Box className="dashboard-intro"><Box><Typography variant="overline" color="primary">YOUR WORKSPACE</Typography><Typography variant="h2">Link management,<br /><em>made clear.</em></Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Monitor your links and see how your audience engages.</Typography></Box><Button variant="contained" onClick={() => setOpen(true)}>Create a link</Button></Box><Grid container spacing={2} sx={{ mb: 3 }}>{stats.map(stat => <Grid size={{ xs: 6, md: 3 }} key={stat.label}><Card><CardContent><Typography variant="body2" color="text.secondary">{stat.label}</Typography>{loading ? <Skeleton width="55%" height={46} /> : <Typography variant="h4">{stat.value}</Typography>}</CardContent></Card></Grid>)}</Grid>{error ? <Alert severity="error" action={<Button color="inherit" onClick={loadUrls}>Try again</Button>}>We couldn’t load your links right now.</Alert> : <UrlList urls={urls} loading={loading} onCreate={() => setOpen(true)} onUpdated={loadUrls} />}</Box>{open && <ShortenLinkModal navigate={navigate} onClose={() => { setOpen(false); loadUrls() }} />}</>
}
export default Dashboard
