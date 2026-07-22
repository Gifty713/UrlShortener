import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Grid, LinearProgress, Skeleton, Stack, Typography } from '@mui/material'
import { getAnalytics } from '../Services/urlService'
import DashboardNav from './DashboardNav'

function Breakdown({ title, items }) {
  const max = Math.max(...items.map(item => item.value), 1)
  return <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>{items.length ? <Stack spacing={2}>{items.map(item => <Box key={item.name}><Stack direction="row" justifyContent="space-between"><Typography variant="body2">{item.name}</Typography><Typography variant="caption" fontWeight={800}>{item.value}</Typography></Stack><LinearProgress variant="determinate" value={(item.value / max) * 100} sx={{ mt: .75, height: 7, borderRadius: 4, bgcolor: '#f1e8e3' }} /></Box>)}</Stack> : <Typography color="text.secondary">No opted-in visits yet.</Typography>}</CardContent></Card>
}

function Analytics({ navigate, onLogout }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await getAnalytics()) } catch (err) { console.error('Unable to load analytics:', err); setError(err.message) } finally { setLoading(false) } }, [])
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer) }, [load])
  const stats = [{ label: 'Opted-in visits', value: data?.totalClicks ?? 0 }, { label: 'Unique visitors', value: data?.uniqueVisitors ?? 0 }, { label: 'Countries reached', value: data?.countries?.length ?? 0 }]
  const trend = (data?.trend || []).map(item => ({ name: item.date, value: item.value }))
  return <><DashboardNav active="analytics" navigate={navigate} onLogout={onLogout} /><Box component="main" className="dashboard"><Typography variant="overline" color="primary">PERFORMANCE</Typography><Typography variant="h2" sx={{ mb: 3 }}>Audience<br /><em>insights.</em></Typography>{error ? <Alert severity="error" action={<Button color="inherit" onClick={load}>Try again</Button>}>We couldn’t load analytics right now.</Alert> : <><Grid container spacing={2} sx={{ mb: 3 }}>{stats.map(stat => <Grid size={{ xs: 12, sm: 4 }} key={stat.label}><Card><CardContent><Typography color="text.secondary" variant="body2">{stat.label}</Typography>{loading ? <Skeleton height={44} width="50%" /> : <Typography variant="h4">{stat.value}</Typography>}</CardContent></Card></Grid>)}</Grid>{!loading && <Grid container spacing={2}><Grid size={{ xs: 12, md: 6 }}><Breakdown title="Countries" items={data?.countries || []} /></Grid><Grid size={{ xs: 12, md: 6 }}><Breakdown title="Devices" items={data?.devices || []} /></Grid><Grid size={{ xs: 12 }}><Breakdown title="Clicks by date" items={trend} /></Grid></Grid>}<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Analytics includes only visits where the visitor actively opted in.</Typography></>}</Box></>
}
export default Analytics
