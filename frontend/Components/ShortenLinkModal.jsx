import Modal from './Modal'
import UrlShortenerForm from './UrlShortenerForm'

function ShortenLinkModal({ navigate, onClose }) {
  return <Modal title="Create a new link" onClose={onClose}>
    <p className="modal-copy">Paste a long URL to create a clean, shareable link.</p>
    <UrlShortenerForm navigate={navigate} isAuthenticated />
  </Modal>
}

export default ShortenLinkModal
