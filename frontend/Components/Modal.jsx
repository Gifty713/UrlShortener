import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
function Modal({ title, children, onClose }) { return <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="modal-title"><DialogTitle id="modal-title">{title}<IconButton onClick={onClose} aria-label="Close dialog" sx={{ position: 'absolute', right: 12, top: 12 }}>×</IconButton></DialogTitle><DialogContent>{children}</DialogContent></Dialog> }
export default Modal
